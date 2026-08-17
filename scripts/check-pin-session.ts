import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

const {
  VOTER_SESSION_KEY,
  clearVoterSession,
  normalizeVotingCode,
  readVoterSession,
  saveVoterSession,
} = await import('../src/features/exhibition/data/pin-session.ts');

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
};

assert.equal(normalizeVotingCode(' ab-12_cd34 '), 'AB12CD3');
saveVoterSession({ code: 'ABC1234', category: 'visitor' }, storage);
assert.deepEqual(readVoterSession(storage), { code: 'ABC1234', category: 'visitor' });
assert.equal(values.get(VOTER_SESSION_KEY)?.includes('ABC1234'), true);
values.set(VOTER_SESSION_KEY, '{broken');
assert.equal(readVoterSession(storage), null);
saveVoterSession({ code: 'ABC1234', category: 'student' }, storage);
clearVoterSession(storage);
assert.equal(readVoterSession(storage), null);
console.log('Voter session checks passed');
