import type { VoterCategory } from './types';

export type MockVotingState = 'open' | 'used' | 'not-started' | 'closed' | 'network-error';

export interface MockPinSession {
  pinId: string;
  category: VoterCategory;
  hasVoted: boolean;
}

export type PinVerificationResult =
  | { ok: true; session: MockPinSession }
  | { ok: false; reason: 'invalid' | Exclude<MockVotingState, 'open'> };

export const demoPins: Readonly<Record<string, VoterCategory>> = {
  STU2601: 'student',
  TCH2602: 'teacher',
  VST2603: 'visitor',
};

export const PIN_SESSION_KEY = 'utycc-demo-pin-session';
export const MOCK_VOTING_STATE_KEY = 'utycc-demo-voting-state';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const isCategory = (value: unknown): value is VoterCategory =>
  value === 'student' || value === 'teacher' || value === 'visitor';

export async function verifyVotingPin(
  pin: string,
  state: MockVotingState = 'open',
): Promise<PinVerificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  const category = demoPins[pin.toUpperCase()];
  if (!category) return { ok: false, reason: 'invalid' };
  if (state !== 'open') return { ok: false, reason: state };
  return { ok: true, session: { pinId: `demo-${category}`, category, hasVoted: false } };
}

export function saveMockPinSession(session: MockPinSession, storage: StorageLike = localStorage) {
  storage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
}

export function readMockPinSession(storage: StorageLike = localStorage): MockPinSession | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(PIN_SESSION_KEY) || 'null');
    if (!value || typeof value !== 'object') return null;
    const session = value as Partial<MockPinSession>;
    return typeof session.pinId === 'string' && isCategory(session.category) && typeof session.hasVoted === 'boolean'
      ? { pinId: session.pinId, category: session.category, hasVoted: session.hasVoted }
      : null;
  } catch {
    return null;
  }
}

export function clearMockPinSession(storage: StorageLike = localStorage) {
  storage.removeItem(PIN_SESSION_KEY);
  storage.removeItem('exhibition-selected');
}

export function getMockVotingState(storage: StorageLike = localStorage): MockVotingState {
  const state = storage.getItem(MOCK_VOTING_STATE_KEY);
  return state === 'used' || state === 'not-started' || state === 'closed' || state === 'network-error' ? state : 'open';
}

export function setMockVotingState(state: MockVotingState, storage: StorageLike = localStorage) {
  state === 'open' ? storage.removeItem(MOCK_VOTING_STATE_KEY) : storage.setItem(MOCK_VOTING_STATE_KEY, state);
}
