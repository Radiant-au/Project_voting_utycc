import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { cookieOptions } from './session';

export const BROWSER_ID_COOKIE = 'utycc-voter-browser';
export const BROWSER_ID_SECONDS = 24 * 60 * 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const signature = (value: string) => {
  const secret = process.env.VOTER_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('VOTER_SESSION_SECRET must be at least 32 characters.');
  return createHmac('sha256', secret).update(`browser:${value}`).digest('base64url');
};

const valid = (cookie: string | undefined) => {
  const [value, supplied, extra] = cookie?.split('.') ?? [];
  if (!value || !supplied || extra || !uuid.test(value)) return null;
  const expected = signature(value);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? value : null;
};

export function browserId(request: NextRequest) {
  const existing = valid(request.cookies.get(BROWSER_ID_COOKIE)?.value);
  return existing ? { value: existing, created: false } : { value: randomUUID(), created: true };
}

export function setBrowserId(response: NextResponse, browser: ReturnType<typeof browserId>) {
  if (browser.created) response.cookies.set(BROWSER_ID_COOKIE, `${browser.value}.${signature(browser.value)}`, cookieOptions(BROWSER_ID_SECONDS));
  return response;
}
