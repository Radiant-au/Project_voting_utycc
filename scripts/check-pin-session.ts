import assert from 'node:assert/strict';
import {
  PIN_SESSION_KEY,
  readMockPinSession,
  saveMockPinSession,
  verifyVotingPin,
} from '../src/features/exhibition/data/pin-session.ts';

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
};

for (const [pin, category] of [['STU2601', 'student'], ['TCH2602', 'teacher'], ['VST2603', 'visitor']] as const) {
  const result = await verifyVotingPin(pin);
  assert.equal(result.ok && result.session.category, category);
  if (result.ok) saveMockPinSession(result.session, storage);
  assert.equal(values.get(PIN_SESSION_KEY)?.includes(pin), false);
}

assert.deepEqual(await verifyVotingPin('BAD0000'), { ok: false, reason: 'invalid' });
assert.deepEqual(await verifyVotingPin('STU2601', 'used'), { ok: false, reason: 'used' });
assert.equal((await verifyVotingPin('stu2601')).ok, true);
values.set(PIN_SESSION_KEY, '{broken');
assert.equal(readMockPinSession(storage), null);
console.log('PIN session checks passed');
