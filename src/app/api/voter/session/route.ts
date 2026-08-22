import { json } from '@/lib/voter/http';
import { currentVoterSession } from '@/lib/voter/route-session';

export async function GET() {
  const session = await currentVoterSession();
  if (!session) return json({ error: 'unauthorized' }, 401);
  return json({ session: { category: session.category, hasVoted: session.hasVoted } });
}
