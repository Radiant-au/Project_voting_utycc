import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { VoterCategory } from '@/features/exhibition/data/types';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
import { allowRequest, isSameOrigin, isVotingCode, json, normalizeVotingCode } from '@/lib/voter/http';
import { cookieOptions, createVoterSession, SESSION_SECONDS, signSession, VOTER_COOKIE } from '@/lib/voter/session';

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request.url, request.headers.get('origin'), request.headers.get('sec-fetch-site'))) return json({ error: 'forbidden' }, 403);
    const body = await request.json();
    const code = normalizeVotingCode(body?.code);
    if (!isVotingCode(code)) return json({ error: 'invalid_code' }, 400);
    const limit = await allowRequest(request, 'verify');
    if (!limit.allowed) return json({ error: 'rate_limited', retryAfter: limit.retry_after }, 429, { 'Retry-After': String(limit.retry_after) });
    const { data, error } = await getVoterSupabase().rpc('verify_voter_code', { input_code: code });
    const row = data?.[0];
    if (error || !row || !['student','teacher','visitor'].includes(row.category)) return json({ error: 'invalid_code' }, 400);
    const session = createVoterSession(row.voting_code_id, row.category as VoterCategory);
    (await cookies()).set(VOTER_COOKIE, signSession(session), cookieOptions(SESSION_SECONDS));
    return json({ session: { category: session.category, hasVoted: false } });
  } catch { return json({ error: 'service_unavailable' }, 503); }
}
