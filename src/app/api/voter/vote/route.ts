import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getVoterSupabase } from "@/lib/supabase/voter-server";
import {
  allowRequest,
  isProjectId,
  isSameOrigin,
  json,
} from "@/lib/voter/http";
import { voterSession } from "@/lib/voter/route-session";
import {
  cookieOptions,
  createReceiptSession,
  RECEIPT_SECONDS,
  signSession,
  VOTER_COOKIE,
} from "@/lib/voter/session";

export async function POST(request: NextRequest) {
  if (
    !isSameOrigin(
      request.url,
      request.headers.get("origin"),
      request.headers.get("sec-fetch-site"),
    )
  )
    return json({ error: "forbidden" }, 403);
  const session = await voterSession();
  if (!session) return json({ error: "unauthorized" }, 401);
  if (session.hasVoted) return json({ error: "vote_rejected" }, 409);
  try {
    const body = await request.json();
    if (!body || Object.keys(body).length !== 1 || !isProjectId(body.projectId))
      return json({ error: "invalid_request" }, 400);
    const limit = await allowRequest(request, "vote", session.sessionId);
    if (!limit.allowed)
      return json(
        { error: "rate_limited", retryAfter: limit.retry_after },
        429,
        { "Retry-After": String(limit.retry_after) },
      );
    const { data, error } = await getVoterSupabase().rpc("submit_voter_vote", {
      input_voting_code_id: session.codeId,
      input_project_id: body.projectId,
    });
    const row = data?.[0];
    if (error || row?.result !== "submitted" || !row.vote_id)
      return json({ error: "vote_rejected" }, 409);
    (await cookies()).set(
      VOTER_COOKIE,
      signSession(createReceiptSession(row.vote_id)),
      cookieOptions(RECEIPT_SECONDS),
    );
    return json({ ok: true });
  } catch {
    return json({ error: "service_unavailable" }, 503);
  }
}
