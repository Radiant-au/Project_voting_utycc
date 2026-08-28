import { getVotingStatus } from '@/lib/voter/data';
import { json } from '@/lib/voter/http';
import { signedVoterSession } from '@/lib/voter/route-session';

export async function GET() {
  try {
    if (!await signedVoterSession()) return json({ error: 'unauthorized' }, 401);
    return json({ status: { isOpen: await getVotingStatus() } });
  } catch {
    return json({ error: 'service_unavailable' }, 503);
  }
}
