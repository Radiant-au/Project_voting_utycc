import assert from 'node:assert/strict';

process.env.VOTER_SESSION_SECRET = 'test-secret-that-is-at-least-32-characters';

const { createReceiptSession, createVoterSession, readSession, signSession } = await import('../src/lib/voter/session.ts');
const { isProjectId, isSameOrigin, isVotingCode, normalizeVotingCode } = await import('../src/lib/voter/contract.ts');

assert.equal(normalizeVotingCode(' st7k2p9 '), 'ST7K2P9');
assert.equal(isVotingCode('ST7K2P9'), true);
assert.equal(isVotingCode('ST7-2P9'), false);
assert.equal(isProjectId('p12'), true);
assert.equal(isProjectId('p1/other'), false);
assert.equal(isSameOrigin('https://vote.example/api/voter/vote', 'https://vote.example', 'same-origin'), true);
assert.equal(isSameOrigin('https://vote.example/api/voter/vote', 'https://evil.example', 'cross-site'), false);

const voter = createVoterSession('00000000-0000-0000-0000-000000000001', 'visitor', 100);
const token = signSession(voter);
assert.deepEqual(readSession(token, 101), voter);
assert.equal(token.includes('ST7K2P9'), false);
assert.equal(readSession(`${token.slice(0, -1)}x`, 101), null);
assert.equal(readSession(token, voter.exp), null);

const receipt = createReceiptSession('00000000-0000-0000-0000-000000000002', 100);
assert.deepEqual(readSession(signSession(receipt), 101), receipt);
console.log('Voter session and request checks passed');
