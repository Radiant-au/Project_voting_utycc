import 'server-only';
import { cookies } from 'next/headers';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { readSession, VOTER_COOKIE, type ReceiptSession, type ValidatedVoterSession, type VoterSession } from './session';

async function validatedVoterSession(expectedStatus: 'unused' | 'used' | null): Promise<ValidatedVoterSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  if (session?.kind !== 'voter') return null;
  const { data, error } = await getVoterSupabase().from('voter_vote_sessions').select('voting_code_id,category,expires_at,voting_codes(status)').eq('id', session.sessionId).maybeSingle();
  const code = data?.voting_codes as { status?: string } | null;
  const hasVoted = code?.status === 'used';
  return !error && data && new Date(data.expires_at) > new Date() && (!expectedStatus || (hasVoted ? 'used' : 'unused') === expectedStatus)
    ? { ...session, codeId: data.voting_code_id, category: data.category as ValidatedVoterSession['category'], hasVoted }
    : null;
}

export const voterSession = () => validatedVoterSession('unused');
export const returningVoterSession = () => validatedVoterSession('used');
export const currentVoterSession = () => validatedVoterSession(null);

export async function signedVoterSession(): Promise<VoterSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  return session?.kind === 'voter' ? session : null;
}

export async function receiptSession(): Promise<ReceiptSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  return session?.kind === 'receipt' ? session : null;
}
