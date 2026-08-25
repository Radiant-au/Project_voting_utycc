import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY.');

const admin = createClient(url, serviceKey);
const code = randomBytes(7).toString('hex').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

try {
  assert.equal((await admin.from('voting_codes').insert({ code, category: 'visitor' })).error, null);
  const verified = (await admin.rpc('start_voter_vote_session', { input_code: code })).data as Array<{ voting_session_id: string; category: string }>;
  assert.equal(verified[0].category, 'visitor');
  assert.ok(verified[0].voting_session_id);

  const failed = await admin.rpc('submit_voter_vote', { input_voting_session_id: verified[0].voting_session_id, input_project_id: 'p99999', input_idempotency_key: randomUUID() });
  assert.equal((failed.data as Array<{ result: string }>)[0].result, 'invalid_project');
  assert.equal(((await admin.rpc('start_voter_vote_session', { input_code: code })).data as Array<unknown>).length, 1);

  const idempotencyKey = randomUUID();
  const attempts = await Promise.all(Array.from({ length: 5 }, () => admin.rpc('submit_voter_vote', { input_voting_session_id: verified[0].voting_session_id, input_project_id: 'p1', input_idempotency_key: idempotencyKey })));
  assert.equal(attempts.filter(({ data }) => (data as Array<{ result: string }> | null)?.[0]?.result === 'submitted').length, 5);
  const codeRow = await admin.from('voting_codes').select('id').eq('code', code).single();
  assert.ok(codeRow.data);
  const vote = await admin.from('votes').select('category,points', { count: 'exact' }).eq('voting_code_id', codeRow.data.id).single();
  assert.equal(vote.count, 1);
  assert.deepEqual(vote.data, { category: 'visitor', points: 3 });
  console.log('Voting concurrency checks passed');
} finally {
  const row = await admin.from('voting_codes').select('id').eq('code', code).maybeSingle();
  if (row.data) {
    await admin.from('voter_vote_idempotency').delete().eq('voting_session_id', (await admin.from('voter_vote_sessions').select('id').eq('voting_code_id', row.data.id).maybeSingle()).data?.id ?? '00000000-0000-0000-0000-000000000000');
    await admin.from('votes').delete().eq('voting_code_id', row.data.id);
    await admin.from('voting_codes').delete().eq('id', row.data.id);
  }
}
