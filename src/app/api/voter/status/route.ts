import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { unstable_cache } from 'next/cache';
import { json } from '@/lib/voter/http';
import { signedVoterSession } from '@/lib/voter/route-session';

const getCachedVotingStatus = unstable_cache(async () => {
  const { data, error } = await getVoterSupabase()
    .from('voting_settings')
    .select('is_open')
    .eq('id', true)
    .maybeSingle();
  if (error || !data) throw new Error('status_unavailable');
  return data.is_open;
}, ['voter-status'], { revalidate: 2 });

export async function GET() {
  try {
    if (!await signedVoterSession()) return json({ error: 'unauthorized' }, 401);
    return json({ status: { isOpen: await getCachedVotingStatus() } });
  } catch {
    return json({ error: 'service_unavailable' }, 503);
  }
}
