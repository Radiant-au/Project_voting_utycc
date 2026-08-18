import { getProject } from '@/lib/voter/data';
import { isProjectId, json } from '@/lib/voter/http';
import { voterSession } from '@/lib/voter/route-session';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await voterSession()) return json({ error: 'unauthorized' }, 401);
  const { id } = await params;
  if (!isProjectId(id)) return json({ error: 'not_found' }, 404);
  try {
    const project = await getProject(id);
    return project ? json({ project }) : json({ error: 'not_found' }, 404);
  } catch { return json({ error: 'service_unavailable' }, 503); }
}

