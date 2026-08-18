export const normalizeVotingCode = (value: unknown) => typeof value === 'string' ? value.trim().toUpperCase() : '';
export const isVotingCode = (value: string) => /^[A-Z0-9]{7}$/.test(value);
export const isProjectId = (value: unknown): value is string => typeof value === 'string' && /^p[0-9]+$/.test(value);
export const isSameOrigin = (requestUrl: string, origin: string | null, fetchSite: string | null) =>
  fetchSite !== 'cross-site' && (!origin || origin === new URL(requestUrl).origin);
