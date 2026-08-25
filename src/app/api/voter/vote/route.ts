import type { NextRequest } from "next/server";
import { getVoterSupabase } from "@/lib/supabase/voter-server";
import {
  allowRequest,
  isProjectId,
  isSameOrigin,
  json,
  RateLimitUnavailable,
} from "@/lib/voter/http";
import { signedVoterSession } from "@/lib/voter/route-session";
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
  const session = await signedVoterSession();
  if (!session) return json({ error: "unauthorized" }, 401);
  try {
    const body = await request.json();
    if (!body || Object.keys(body).length !== 1 || !isProjectId(body.projectId))
      return json({ error: "invalid_request" }, 400);
    const idempotencyKey = request.headers.get("idempotency-key");
    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey))
      return json({ error: "invalid_request" }, 400);
    const limit = await allowRequest("vote", session.sessionId);
    if (!limit.allowed)
      return json(
        { error: "Too many vote submissions. Please wait and retry.", retryAfter: limit.retry_after },
        429,
        { "Retry-After": String(limit.retry_after) },
      );
    const { data, error } = await getVoterSupabase().rpc("submit_voter_vote", {
      input_voting_session_id: session.sessionId,
      input_project_id: body.projectId,
      input_idempotency_key: idempotencyKey,
    });
    const row = data?.[0];
    if (error) return json({ error: "vote_rejected" }, 409);
    if (row?.result === "closed") return json({ error: "voting_closed" }, 409);
    if (row?.result === "expired") return json({ error: "vote_session_expired" }, 401);
    if (row?.result === "idempotency_conflict") return json({ error: "idempotency_conflict" }, 409);
    if (row?.result !== "submitted" || !row.vote_id)
      return json({ error: "vote_rejected" }, 409);
    const response = json({ ok: true });
    response.cookies.set(VOTER_COOKIE, signSession(createReceiptSession(row.vote_id)), cookieOptions(RECEIPT_SECONDS));
    return response;
  } catch (error) {
    return json({ error: error instanceof RateLimitUnavailable ? "rate_limit_unavailable" : "service_unavailable" }, 503);
  }
}
