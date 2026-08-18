import { json } from '@/lib/voter/http';
import { voterSession } from '@/lib/voter/route-session';

export async function GET() {
  const session = await voterSession();
  if (!session) return json({ error: 'unauthorized' }, 401);
  return json({ session: { category: session.category, hasVoted: false } });
}
