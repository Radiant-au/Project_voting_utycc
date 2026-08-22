import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { getProject } from '@/lib/voter/data';
import { json } from '@/lib/voter/http';
import { receiptSession, returningVoterSession } from '@/lib/voter/route-session';

export async function GET() {
  const session = await receiptSession() ?? await returningVoterSession();
  if (!session) return json({ error: 'unauthorized' }, 401);
  try {
    const query = getVoterSupabase().from('votes').select('id,project_id,category,created_at');
    const { data, error } = await (session.kind === 'receipt' ? query.eq('id', session.voteId) : query.eq('voting_code_id', session.codeId)).maybeSingle();
    if (error || !data) return json({ error: 'not_found' }, 404);
    const project = await getProject(data.project_id);
    if (!project) return json({ error: 'not_found' }, 404);
    return json({ receipt: { voteId: data.id, category: data.category, createdAt: data.created_at, project } });
  } catch { return json({ error: 'service_unavailable' }, 503); }
}
