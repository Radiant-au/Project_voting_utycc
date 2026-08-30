import type { VoterCategory } from "../../data/types";

type VotingCode = { code: string; category: VoterCategory };

export const categoryCodes = <T extends VotingCode>(codes: readonly T[], category: VoterCategory) =>
  codes.filter((item) => item.category === category);

export const unprintedCategoryCodes = <T extends VotingCode & { is_printed: boolean }>(codes: readonly T[], category: VoterCategory) =>
  categoryCodes(codes, category).filter((item) => !item.is_printed);

export const selectedCategoryCodes = <T extends VotingCode>(codes: readonly T[], selected: ReadonlySet<string>, category: VoterCategory) =>
  categoryCodes(codes, category).filter((item) => selected.has(item.code));

export const toggleCategoryCodes = <T extends VotingCode>(codes: readonly T[], selected: ReadonlySet<string>, category: VoterCategory) => {
  const categoryItems = categoryCodes(codes, category);
  const next = new Set(selected);
  const clear = categoryItems.length > 0 && categoryItems.every((item) => next.has(item.code));
  for (const item of categoryItems) clear ? next.delete(item.code) : next.add(item.code);
  return next;
};
