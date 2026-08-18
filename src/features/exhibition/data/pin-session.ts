export const normalizeVotingCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
