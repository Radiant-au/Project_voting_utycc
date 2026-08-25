import type { Project, VoterCategory } from './types';

export type PublicVoterSession = { category: VoterCategory; hasVoted: boolean };
export type VoteReceipt = { voteId: string; category: VoterCategory; createdAt: string; project: Project };
export class VoterApiError extends Error {
  constructor(message: string, readonly status: number, readonly retryAfter?: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new VoterApiError(typeof body.error === 'string' ? body.error : 'request_failed', response.status, typeof body.retryAfter === 'number' ? body.retryAfter : undefined);
  return body as T;
}

export const voterApi = {
  verifyCode: (code: string) => request<{ session: PublicVoterSession }>('/api/voter/verify-code', { method: 'POST', body: JSON.stringify({ code }) }),
  session: () => request<{ session: PublicVoterSession }>('/api/voter/session'),
  logout: () => request<{ ok: true }>('/api/voter/logout', { method: 'POST' }),
  projects: () => request<{ session: PublicVoterSession; status: { isOpen: boolean }; projects: Project[] }>('/api/voter/projects'),
  status: () => request<{ status: { isOpen: boolean } }>('/api/voter/status'),
  vote: (projectId: string, idempotencyKey: string) => request<{ ok: true }>('/api/voter/vote', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ projectId }) }),
  receipt: () => request<{ receipt: VoteReceipt }>('/api/voter/receipt'),
};
