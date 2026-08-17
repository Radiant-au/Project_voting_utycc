import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !publicKey || !serviceKey) throw new Error('Set Supabase URL, publishable key, and SUPABASE_SERVICE_ROLE_KEY.');

const admin = createClient(url, serviceKey);
const voter = createClient(url, publicKey);
const code = randomBytes(7).toString('hex').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

try {
  assert.equal((await admin.from('voting_codes').insert({ code, category: 'visitor' })).error, null);
  assert.equal(((await voter.rpc('verify_voting_code', { input_code: code })).data as Array<{ result: string }>)[0].result, 'valid');
  assert.equal(((await voter.rpc('verify_voting_code', { input_code: code })).data as Array<{ result: string }>)[0].result, 'valid');

  const failed = await voter.rpc('submit_vote', { input_code: code, input_project_id: '__FAIL__' });
  assert(failed.error, 'invalid project insert must fail');
  assert.equal(((await voter.rpc('verify_voting_code', { input_code: code })).data as Array<{ result: string }>)[0].result, 'valid');

  const attempts = await Promise.all(Array.from({ length: 5 }, () => voter.rpc('submit_vote', { input_code: code, input_project_id: 'p1' })));
  assert.equal(attempts.filter(({ data }) => (data as Array<{ result: string }> | null)?.[0]?.result === 'submitted').length, 1);
  assert.equal((await admin.from('votes').select('id', { count: 'exact', head: true }).eq('voting_code_id', (await admin.from('voting_codes').select('id').eq('code', code).single()).data!.id)).count, 1);
  console.log('Voting concurrency checks passed');
} finally {
  const row = await admin.from('voting_codes').select('id').eq('code', code).maybeSingle();
  if (row.data) {
    await admin.from('votes').delete().eq('voting_code_id', row.data.id);
    await admin.from('voting_codes').delete().eq('id', row.data.id);
  }
}
