import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY.');

const admin = createClient(url, serviceKey);
const code = randomBytes(7).toString('hex').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

try {
  assert.equal((await admin.from('voting_codes').insert({ code, category: 'visitor' })).error, null);
  const verified = (await admin.rpc('verify_voter_code', { input_code: code })).data as Array<{ voting_code_id: string; category: string }>;
  assert.equal(verified[0].category, 'visitor');
  assert.equal(((await admin.rpc('verify_voter_code', { input_code: code })).data as Array<unknown>).length, 1);

  const failed = await admin.rpc('submit_voter_vote', { input_voting_code_id: verified[0].voting_code_id, input_project_id: 'p99999' });
  assert.equal((failed.data as Array<{ result: string }>)[0].result, 'invalid_project');
  assert.equal(((await admin.rpc('verify_voter_code', { input_code: code })).data as Array<unknown>).length, 1);

  const attempts = await Promise.all(Array.from({ length: 5 }, () => admin.rpc('submit_voter_vote', { input_voting_code_id: verified[0].voting_code_id, input_project_id: 'p1' })));
  assert.equal(attempts.filter(({ data }) => (data as Array<{ result: string }> | null)?.[0]?.result === 'submitted').length, 1);
  const vote = await admin.from('votes').select('category,points', { count: 'exact' }).eq('voting_code_id', verified[0].voting_code_id).single();
  assert.equal(vote.count, 1);
  assert.deepEqual(vote.data, { category: 'visitor', points: 3 });
  console.log('Voting concurrency checks passed');
} finally {
  const row = await admin.from('voting_codes').select('id').eq('code', code).maybeSingle();
  if (row.data) {
    await admin.from('votes').delete().eq('voting_code_id', row.data.id);
    await admin.from('voting_codes').delete().eq('id', row.data.id);
  }
}
