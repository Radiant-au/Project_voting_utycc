import { getProjects } from '@/lib/voter/data';
import { json } from '@/lib/voter/http';
import { voterSession } from '@/lib/voter/route-session';

export async function GET() {
  if (!await voterSession()) return json({ error: 'unauthorized' }, 401);
  try { return json({ projects: await getProjects() }); }
  catch { return json({ error: 'service_unavailable' }, 503); }
}

