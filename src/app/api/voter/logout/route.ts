import type { NextRequest } from 'next/server';
import { isSameOrigin, json } from '@/lib/voter/http';
import { cookieOptions, VOTER_COOKIE } from '@/lib/voter/session';

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.url, request.headers.get('origin'), request.headers.get('sec-fetch-site'))) return json({ error: 'forbidden' }, 403);
  const response = json({ ok: true });
  response.cookies.set(VOTER_COOKIE, '', cookieOptions(0));
  return response;
}
