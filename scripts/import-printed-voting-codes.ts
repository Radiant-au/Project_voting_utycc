import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const validateOnly = process.argv.includes('--validate-only');
if (!validateOnly && !process.argv.includes('--confirm-reset')) throw new Error('Pass --validate-only or --confirm-reset.');

process.loadEnvFile('.env.local');

const sourceDirectory = resolve('private/printed-codes');
const studentFile = resolve(sourceDirectory, 'student_codes_merged_bordered.xlsx');
const visitorFile = resolve(sourceDirectory, 'visitor_codes.json');
const codePattern = /^[A-Z0-9]{7}$/;

const uniqueCodes = (codes: string[], expectedCount: number, label: string) => {
  assert.equal(codes.length, expectedCount, `${label} code count`);
  assert.ok(codes.every((code) => codePattern.test(code)), `${label} code format`);
  assert.equal(new Set(codes).size, expectedCount, `${label} code uniqueness`);
  return codes;
};

const extractedWorkbook = spawnSync('unzip', ['-p', studentFile, 'xl/sharedStrings.xml'], { encoding: 'utf8' });
if (extractedWorkbook.status !== 0 || !extractedWorkbook.stdout) throw extractedWorkbook.error ?? new Error('Could not extract student codes.');
const studentCodes = uniqueCodes(
  [...extractedWorkbook.stdout.matchAll(/<x:t[^>]*>([A-Z0-9]{7})<\/x:t>/g)].map((match) => match[1]),
  1000,
  'student',
);
const visitorCodes = uniqueCodes(
  JSON.parse(readFileSync(visitorFile, 'utf8')).codes,
  100,
  'visitor',
);
assert.equal(studentCodes.filter((code) => visitorCodes.includes(code)).length, 0, 'student and visitor code overlap');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.');
const admin = createClient(url, serviceKey);

const count = async (table: 'voting_codes' | 'votes' | 'voter_vote_sessions' | 'voter_vote_idempotency' | 'projects' | 'voting_settings', filters: Array<[string, string]> = []) => {
  let query = admin.from(table).select('*', { count: 'exact', head: true });
  for (const [column, value] of filters) query = query.eq(column, value);
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
};

const before = await Promise.all([
  count('voting_codes', [['category', 'student']]),
  count('voting_codes', [['category', 'visitor']]),
  count('voting_codes', [['category', 'teacher']]),
  count('votes'),
  count('voter_vote_sessions'),
  count('voter_vote_idempotency'),
  count('projects'),
  count('voting_settings'),
]);
const votingSettings = await admin.from('voting_settings').select('is_open,results_revealed,student_points,teacher_points,visitor_points').eq('id', true).maybeSingle();
if (votingSettings.error) throw votingSettings.error;
const teacherCodes = await admin.from('voting_codes').select('code').eq('category', 'teacher');
if (teacherCodes.error) throw teacherCodes.error;
assert.equal((teacherCodes.data ?? []).filter(({ code }) => studentCodes.includes(code) || visitorCodes.includes(code)).length, 0, 'teacher collision');

console.log('Pre-import state', { student: before[0], visitor: before[1], teacher: before[2], votes: before[3], sessions: before[4], idempotency: before[5], projects: before[6], settings: before[7], votingSettings: votingSettings.data });
if (validateOnly) {
  console.log('Printed code sources are valid and do not collide with teacher codes.');
  process.exit(0);
}
const { error: importError } = await admin.rpc('replace_printed_voting_codes', {
  input_student_codes: studentCodes,
  input_visitor_codes: visitorCodes,
});
if (importError) throw importError;

assert.equal(await count('voting_codes', [['category', 'student']]), 1000, 'student inventory');
assert.equal(await count('voting_codes', [['category', 'visitor']]), 100, 'visitor inventory');
assert.equal(await count('voting_codes', [['category', 'teacher']]), before[2], 'teacher inventory');
assert.equal(await count('projects'), before[6], 'project inventory');
console.log('Printed student and visitor code inventory replaced successfully.');
