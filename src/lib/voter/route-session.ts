import 'server-only';
import { cookies } from 'next/headers';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { readSession, VOTER_COOKIE, type ReceiptSession, type VoterSession } from './session';

async function validatedVoterSession(expectedStatus: 'unused' | 'used' | null): Promise<VoterSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  if (session?.kind !== 'voter') return null;
  const { data, error } = await getVoterSupabase().from('voting_codes').select('status,category').eq('id', session.codeId).maybeSingle();
  const sessionStatus = session.hasVoted ? 'used' : 'unused';
  return !error && data?.status === sessionStatus && data.category === session.category && (!expectedStatus || sessionStatus === expectedStatus) ? session : null;
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
