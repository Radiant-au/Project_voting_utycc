import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { getProject } from '@/lib/voter/data';
import { json } from '@/lib/voter/http';
import { receiptSession } from '@/lib/voter/route-session';

export async function GET() {
  const session = await receiptSession();
  if (!session) return json({ error: 'unauthorized' }, 401);
  try {
    const { data, error } = await getVoterSupabase().from('votes').select('id,project_id,category,created_at').eq('id', session.voteId).maybeSingle();
    if (error || !data) return json({ error: 'not_found' }, 404);
    const project = await getProject(data.project_id);
    if (!project) return json({ error: 'not_found' }, 404);
    return json({ receipt: { voteId: data.id, category: data.category, createdAt: data.created_at, project } });
  } catch { return json({ error: 'service_unavailable' }, 503); }
}
