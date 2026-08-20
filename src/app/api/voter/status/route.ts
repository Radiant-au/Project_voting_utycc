import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { json } from '@/lib/voter/http';
import { voterSession } from '@/lib/voter/route-session';

export async function GET() {
  try {
    if (!await voterSession()) return json({ error: 'unauthorized' }, 401);
    const { data, error } = await getVoterSupabase()
      .from('voting_settings')
      .select('is_open')
      .eq('id', true)
      .maybeSingle();
    if (error || !data) return json({ error: 'service_unavailable' }, 503);
    return json({ status: { isOpen: data.is_open } });
  } catch {
    return json({ error: 'service_unavailable' }, 503);
  }
}
