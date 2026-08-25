import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VoterCategory } from '@/features/exhibition/data/types';

export const VOTER_COOKIE = 'utycc-voter';
export const SESSION_SECONDS = 15 * 60;
export const RECEIPT_SECONDS = 30 * 60;

export type VoterSession = { v: 1; kind: 'voter'; sessionId: string; iat: number; exp: number };
export type ValidatedVoterSession = VoterSession & { codeId: string; category: VoterCategory; hasVoted: boolean };
export type ReceiptSession = { v: 1; kind: 'receipt'; voteId: string; iat: number; exp: number };
export type Session = VoterSession | ReceiptSession;

const secret = () => {
  const value = process.env.VOTER_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('VOTER_SESSION_SECRET must be at least 32 characters.');
  return value;
};
const signature = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function signSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function readSession(value: string | undefined, now = Math.floor(Date.now() / 1000)): Session | null {
  if (!value) return null;
  try {
    const [payload, supplied, extra] = value.split('.');
    if (!payload || !supplied || extra) return null;
    const expected = signature(payload);
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<Session>;
    if (parsed.v !== 1 || typeof parsed.iat !== 'number' || typeof parsed.exp !== 'number' || parsed.exp <= now) return null;
    if (parsed.kind === 'voter' && typeof parsed.sessionId === 'string') return parsed as VoterSession;
    if (parsed.kind === 'receipt' && typeof parsed.voteId === 'string') return parsed as ReceiptSession;
    return null;
  } catch { return null; }
}

export function createVoterSession(sessionId: string, now = Math.floor(Date.now() / 1000)): VoterSession {
  return { v: 1, kind: 'voter', sessionId, iat: now, exp: now + SESSION_SECONDS };
}

export function createReceiptSession(voteId: string, now = Math.floor(Date.now() / 1000)): ReceiptSession {
  return { v: 1, kind: 'receipt', voteId, iat: now, exp: now + RECEIPT_SECONDS };
}

export const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge });
