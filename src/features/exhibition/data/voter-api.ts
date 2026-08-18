import type { Project, VoterCategory } from './types';

export type PublicVoterSession = { category: VoterCategory; hasVoted: boolean };
export type VoteReceipt = { voteId: string; category: VoterCategory; points: number; createdAt: string; project: Project };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'request_failed');
  return body as T;
}

export const voterApi = {
  verifyCode: (code: string) => request<{ session: PublicVoterSession }>('/api/voter/verify-code', { method: 'POST', body: JSON.stringify({ code }) }),
  session: () => request<{ session: PublicVoterSession }>('/api/voter/session'),
  logout: () => request<{ ok: true }>('/api/voter/logout', { method: 'POST' }),
  projects: () => request<{ projects: Project[] }>('/api/voter/projects'),
  project: (id: string) => request<{ project: Project }>(`/api/voter/projects/${encodeURIComponent(id)}`),
  vote: (projectId: string) => request<{ ok: true }>('/api/voter/vote', { method: 'POST', body: JSON.stringify({ projectId }) }),
  receipt: () => request<{ receipt: VoteReceipt }>('/api/voter/receipt'),
};

