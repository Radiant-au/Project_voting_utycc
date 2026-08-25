import type { NextRequest } from 'next/server';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { browserId, setBrowserId } from '@/lib/voter/browser-id';
import { allowRequest, isSameOrigin, isVotingCode, json, normalizeVotingCode, RateLimitUnavailable } from '@/lib/voter/http';
import { cookieOptions, createVoterSession, SESSION_SECONDS, signSession, VOTER_COOKIE } from '@/lib/voter/session';

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request.url, request.headers.get('origin'), request.headers.get('sec-fetch-site'))) return json({ error: 'forbidden' }, 403);
    const browser = browserId(request);
    const body = await request.json().catch(() => null);
    const limit = await allowRequest('verify', browser.value);
    if (!limit.allowed) return setBrowserId(json({ error: 'Too many code attempts. Please wait and try again.', retryAfter: limit.retry_after }, 429, { 'Retry-After': String(limit.retry_after) }), browser);
    const code = normalizeVotingCode(body?.code);
    if (!isVotingCode(code)) return setBrowserId(json({ error: 'invalid_code' }, 400), browser);
    const { data, error } = await getVoterSupabase().rpc('start_voter_vote_session', { input_code: code });
    const row = data?.[0];
    if (error || !row || typeof row.category !== 'string' || !['student','teacher','visitor'].includes(row.category)) return setBrowserId(json({ error: 'invalid_code' }, 400), browser);
    if (row.result === 'used') return setBrowserId(json({ error: 'code_used' }, 409), browser);
    if (row.result !== 'valid' || !row.voting_session_id) return setBrowserId(json({ error: 'invalid_code' }, 400), browser);
    const session = createVoterSession(row.voting_session_id as string);
    const response = setBrowserId(json({ session: { category: row.category, hasVoted: false } }), browser);
    response.cookies.set(VOTER_COOKIE, signSession(session), cookieOptions(SESSION_SECONDS));
    return response;
  } catch (error) { return json({ error: error instanceof RateLimitUnavailable ? 'rate_limit_unavailable' : 'service_unavailable' }, 503); }
}
