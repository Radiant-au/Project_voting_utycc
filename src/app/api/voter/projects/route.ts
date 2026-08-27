import { getProjects } from "@/lib/voter/data";
import { getVoterSupabase } from "@/lib/supabase/voter-server";
import { json } from "@/lib/voter/http";
import { currentVoterSession } from "@/lib/voter/route-session";

export async function GET() {
  const session = await currentVoterSession();
  if (!session) return json({ error: "unauthorized" }, 401);
  try {
    const [projects, { data, error }] = await Promise.all([
      getProjects(),
      getVoterSupabase()
        .from("voting_settings")
        .select("is_open")
        .eq("id", true)
        .maybeSingle(),
    ]);
    if (error || !data) return json({ error: "service_unavailable" }, 503);
    return json({
      session: { category: session.category, hasVoted: session.hasVoted },
      status: { isOpen: data.is_open },
      projects,
    });
  } catch {
    return json({ error: "service_unavailable" }, 503);
  }
}
