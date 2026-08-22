import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

const voter = createVoterSession('00000000-0000-0000-0000-000000000001', 'visitor', false, 100);
const token = signSession(voter);
assert.deepEqual(readSession(token, 101), voter);
assert.equal(token.includes('ST7K2P9'), false);
assert.equal(readSession(`${token.slice(0, -1)}x`, 101), null);
assert.equal(readSession(token, voter.exp), null);

const receipt = createReceiptSession('00000000-0000-0000-0000-000000000002', 100);
assert.deepEqual(readSession(signSession(receipt), 101), receipt);
const voterData = readFileSync('src/lib/voter/data.ts', 'utf8');
const voterReceipt = readFileSync('src/app/api/voter/receipt/route.ts', 'utf8');
const routeSession = readFileSync('src/lib/voter/route-session.ts', 'utf8');
const statusRoute = readFileSync('src/app/api/voter/status/route.ts', 'utf8');
const home = readFileSync('src/features/exhibition/pages/voter/home-page.tsx', 'utf8');
const projectsRoute = readFileSync('src/app/api/voter/projects/route.ts', 'utf8');
const voteRoute = readFileSync('src/app/api/voter/vote/route.ts', 'utf8');
assert.doesNotMatch(voterData, /row\.(project_number|hidden_project_code|points)/);
assert.match(voterData, /const columns = 'id,title/);
assert.doesNotMatch(voterReceipt, /select\([^)]*points/);
assert.match(routeSession, /session\.hasVoted \? 'used' : 'unused'/);
assert.match(routeSession, /returningVoterSession/);
assert.match(statusRoute, /signedVoterSession/);
assert.match(statusRoute, /revalidate: 2/);
assert.match(voterReceipt, /query\.eq\('voting_code_id', session\.codeId\)/);
assert.doesNotMatch(voterReceipt, /select\([^)]*(code|points|hidden_project_code)/);
assert.match(home, /session\.hasVoted \? "\/vote\/success" : "\/projects"/);
assert.match(projectsRoute, /currentVoterSession\(\)/);
assert.match(projectsRoute, /Promise\.all/);
assert.match(voterData, /revalidate: 30/);
assert.match(voteRoute, /voterSession\(\)/);
assert.match(voteRoute, /session\.hasVoted/);
console.log('Voter session and request checks passed');
