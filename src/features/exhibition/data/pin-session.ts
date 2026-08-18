import { supabase } from '../../../lib/supabase/client.ts';
import type { VoterCategory } from './types';

export interface VoterSession {
  code: string;
  category: VoterCategory;
}

export type CodeFailure = 'invalid' | 'used' | 'disabled' | 'network-error';
export type CodeVerificationResult =
  | { ok: true; session: VoterSession }
  | { ok: false; reason: CodeFailure };
export type VoteSubmissionResult =
  | { ok: true; voteId: string }
  | { ok: false; reason: CodeFailure };

export const VOTER_SESSION_KEY = 'utycc-voter-session';
export const VOTE_RECEIPT_KEY = 'utycc-vote-receipt';


type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const isCategory = (value: unknown): value is VoterCategory =>
  value === 'student' || value === 'teacher' || value === 'visitor';

export const normalizeVotingCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

export async function verifyVotingCode(code: string): Promise<CodeVerificationResult> {
  const normalized = normalizeVotingCode(code);
  if (normalized.length !== 7) return { ok: false, reason: 'invalid' };

  const { data, error } = await supabase.rpc('verify_voting_code', { input_code: normalized });
  if (error) return { ok: false, reason: 'network-error' };
  const row = (data as Array<{ result: string; category: string | null }> | null)?.[0];
  if (row?.result === 'valid' && isCategory(row.category)) {
    return { ok: true, session: { code: normalized, category: row.category } };
  }
  return { ok: false, reason: row?.result === 'used' || row?.result === 'disabled' ? row.result : 'invalid' };
}

export async function submitVote(code: string, projectId: string): Promise<VoteSubmissionResult> {
  const { data, error } = await supabase.rpc('submit_vote', {
    input_code: normalizeVotingCode(code),
    input_project_id: projectId,
  });
  if (error) return { ok: false, reason: 'network-error' };
  const row = (data as Array<{ result: string; vote_id: string | null }> | null)?.[0];
  if (row?.result === 'submitted' && row.vote_id) return { ok: true, voteId: row.vote_id };
  return { ok: false, reason: row?.result === 'used' || row?.result === 'disabled' ? row.result : 'invalid' };
}

export function saveVoterSession(session: VoterSession, storage: StorageLike = sessionStorage) {
  storage.setItem(VOTER_SESSION_KEY, JSON.stringify(session));
}

export function readVoterSession(storage: StorageLike = sessionStorage): VoterSession | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(VOTER_SESSION_KEY) || 'null');
    if (!value || typeof value !== 'object') return null;
    const session = value as Partial<VoterSession>;
    return typeof session.code === 'string' && /^[A-Z0-9]{7}$/.test(session.code) && isCategory(session.category)
      ? { code: session.code, category: session.category }
      : null;
  } catch {
    return null;
  }
}

export function clearVoterSession(storage: StorageLike = sessionStorage) {
  storage.removeItem(VOTER_SESSION_KEY);
  storage.removeItem('exhibition-selected');
}
