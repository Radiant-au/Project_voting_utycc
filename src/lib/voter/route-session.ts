import 'server-only';
import { cookies } from 'next/headers';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { readSession, VOTER_COOKIE, type ReceiptSession, type VoterSession } from './session';

export async function voterSession(): Promise<VoterSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  if (session?.kind !== 'voter') return null;
  const { data, error } = await getVoterSupabase().from('voting_codes').select('status,category').eq('id', session.codeId).maybeSingle();
  return !error && data?.status === 'unused' && data.category === session.category ? session : null;
}

export async function receiptSession(): Promise<ReceiptSession | null> {
  const session = readSession((await cookies()).get(VOTER_COOKIE)?.value);
  return session?.kind === 'receipt' ? session : null;
}
