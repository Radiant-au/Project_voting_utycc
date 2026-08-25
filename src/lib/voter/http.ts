import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
export { isProjectId, isSameOrigin, isVotingCode, normalizeVotingCode } from './contract';

export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) => NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

export class RateLimitUnavailable extends Error {}

export async function allowRequest(action: 'verify' | 'vote', subjectId: string) {
  const secret = process.env.VOTER_SESSION_SECRET;
  if (!secret) throw new Error('Missing voter session configuration.');
  const fingerprint = createHmac('sha256', secret).update(`${action}:${subjectId}`).digest('hex');
  try {
    const { data, error } = await getVoterSupabase().rpc('check_voter_rate_limit', { input_action: action, input_fingerprint: fingerprint });
    if (error || !data?.[0]) throw error ?? new Error('missing rate limit result');
    return data[0];
  } catch (error) {
    console.error('voter_rate_limit_unavailable', { action, message: error instanceof Error ? error.message : 'unknown' });
    if (process.env.VOTER_RATE_LIMIT_FAIL_OPEN !== 'false') return { allowed: true, retry_after: 0 };
    throw new RateLimitUnavailable();
  }
}
