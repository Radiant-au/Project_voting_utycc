import { createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { getVoterSupabase } from '@/lib/supabase/voter-server';
export { isProjectId, isSameOrigin, isVotingCode, normalizeVotingCode } from './contract';

export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };
export const json = (body: unknown, status = 200, headers: HeadersInit = {}) => Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
export async function allowRequest(request: NextRequest, action: 'verify' | 'vote', sessionId = '') {
  const secret = process.env.VOTER_SESSION_SECRET;
  if (!secret) throw new Error('Missing voter session configuration.');
  const address = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const fingerprint = createHmac('sha256', secret).update(`${action}:${address}:${sessionId}`).digest('hex');
  const { data, error } = await getVoterSupabase().rpc('check_voter_rate_limit', { input_action: action, input_fingerprint: fingerprint });
  if (error) throw error;
  return data?.[0] ?? { allowed: false, retry_after: 60 };
}
