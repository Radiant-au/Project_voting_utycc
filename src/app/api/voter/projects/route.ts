import { getProjects, getVotingStatus } from "@/lib/voter/data";
import { json } from "@/lib/voter/http";
import { currentVoterSession } from "@/lib/voter/route-session";

export async function GET() {
  const session = await currentVoterSession();
  if (!session) return json({ error: "unauthorized" }, 401);
  try {
    const [projects, isOpen] = await Promise.all([
      getProjects(),
      getVotingStatus(),
    ]);
    return json({
      session: { category: session.category, hasVoted: session.hasVoted },
      status: { isOpen },
      projects,
    });
  } catch {
    return json({ error: "service_unavailable" }, 503);
  }
}
