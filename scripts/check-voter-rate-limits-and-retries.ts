import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
const admin = createClient(url, key);
const fingerprint = (value: string) => createHmac('sha256', 'test-rate-limit-secret').update(`verify:${value}`).digest('hex');
const code = () => randomBytes(8).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, '').padEnd(7, 'A').slice(0, 7);
const createdCodes: string[] = [];

try {
  // Same Wi-Fi is intentionally absent from the fingerprint: every browser gets its own bucket.
  const firstBrowser = fingerprint(randomUUID());
  for (let attempt = 0; attempt < 20; attempt++) assert.equal(((await admin.rpc('check_voter_rate_limit', { input_action: 'verify', input_fingerprint: firstBrowser })).data as any)[0].allowed, true);
  assert.equal(((await admin.rpc('check_voter_rate_limit', { input_action: 'verify', input_fingerprint: firstBrowser })).data as any)[0].allowed, false);
  assert.equal(((await admin.rpc('check_voter_rate_limit', { input_action: 'verify', input_fingerprint: fingerprint(randomUUID()) })).data as any)[0].allowed, true);
  const independent = await Promise.all(Array.from({ length: 301 }, () => admin.rpc('check_voter_rate_limit', { input_action: 'verify', input_fingerprint: fingerprint(randomUUID()) })));
  assert.equal(independent.every(({ data }) => (data as any)[0].allowed), true);
  const invalidBrowser = fingerprint(randomUUID());
  assert.equal(((await admin.rpc('check_voter_rate_limit', { input_action: 'verify', input_fingerprint: invalidBrowser })).data as any)[0].allowed, true);
  await admin.rpc('start_voter_vote_session', { input_code: 'INVALID' }); // The route calls this only after the browser-scoped increment.

  const votingCode = code(); createdCodes.push(votingCode);
  assert.equal((await admin.from('voting_codes').insert({ code: votingCode, category: 'visitor' })).error, null);
  const started = (await admin.rpc('start_voter_vote_session', { input_code: votingCode })).data as any[];
  const sessionId = started[0].voting_session_id as string;
  const idempotencyKey = randomUUID();
  const results = await Promise.all(Array.from({ length: 5 }, () => admin.rpc('submit_voter_vote', { input_voting_session_id: sessionId, input_project_id: 'p1', input_idempotency_key: idempotencyKey })));
  assert.equal(results.filter(({ data }) => (data as any)[0].result === 'submitted').length, 5);
  const voteId = (results[0].data as any)[0].vote_id;
  assert.equal((await admin.rpc('submit_voter_vote', { input_voting_session_id: sessionId, input_project_id: 'p1', input_idempotency_key: idempotencyKey })).data?.[0].vote_id, voteId);
  assert.equal((await admin.rpc('submit_voter_vote', { input_voting_session_id: sessionId, input_project_id: 'p2', input_idempotency_key: idempotencyKey })).data?.[0].result, 'idempotency_conflict');
  assert.equal((await admin.rpc('start_voter_vote_session', { input_code: votingCode })).data?.[0].result, 'used');
  assert.equal((await admin.rpc('submit_voter_vote', { input_voting_session_id: randomUUID(), input_project_id: 'p1', input_idempotency_key: randomUUID() })).data?.[0].result, 'invalid_session');

  const expiredCode = code(); createdCodes.push(expiredCode);
  assert.equal((await admin.from('voting_codes').insert({ code: expiredCode, category: 'visitor' })).error, null);
  const expiredSession = (await admin.rpc('start_voter_vote_session', { input_code: expiredCode })).data?.[0].voting_session_id;
  assert.equal((await admin.from('voter_vote_sessions').update({ expires_at: new Date(0).toISOString() }).eq('id', expiredSession)).error, null);
  assert.equal((await admin.rpc('submit_voter_vote', { input_voting_session_id: expiredSession, input_project_id: 'p1', input_idempotency_key: randomUUID() })).data?.[0].result, 'expired');

  const http = readFileSync('src/lib/voter/http.ts', 'utf8');
  const route = readFileSync('src/app/api/voter/vote/route.ts', 'utf8');
  assert.match(http, /\$\{action\}:\$\{subjectId\}/);
  assert.doesNotMatch(http, /x-forwarded-for|x-vercel-forwarded-for/);
  assert.match(http, /VOTER_RATE_LIMIT_FAIL_OPEN/);
  assert.match(route, /input_idempotency_key/);
  console.log('Shared Wi-Fi, retry, one-code-one-vote, and fail-open policy checks passed');
} finally {
  for (const value of createdCodes) {
    const row = await admin.from('voting_codes').select('id').eq('code', value).maybeSingle();
    if (!row.data) continue;
    const session = await admin.from('voter_vote_sessions').select('id').eq('voting_code_id', row.data.id).maybeSingle();
    if (session.data) await admin.from('voter_vote_idempotency').delete().eq('voting_session_id', session.data.id);
    await admin.from('votes').delete().eq('voting_code_id', row.data.id);
    await admin.from('voting_codes').delete().eq('id', row.data.id);
  }
}
