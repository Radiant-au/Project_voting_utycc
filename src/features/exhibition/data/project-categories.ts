export type ProjectCategory = 'Information Science' | 'Computer Engineering' | 'Electronic Engineering' | 'Precision Engineering' | 'Advanced Material Engineering';

export const projectCategories = ['Information Science', 'Computer Engineering', 'Electronic Engineering', 'Precision Engineering', 'Advanced Material Engineering'] as const satisfies readonly ProjectCategory[];

export const projectCategoryShortNames: Record<ProjectCategory, string> = {
  'Information Science': 'IS',
  'Computer Engineering': 'CE',
  'Electronic Engineering': 'EcE',
  'Precision Engineering': 'PrE',
  'Advanced Material Engineering': 'AME',
};

export const projectCategoryOptions = [
  ['All', 'All'],
  ...projectCategories.map((category) => [projectCategoryShortNames[category], category] as const),
] as const;

export const isProjectCategory = (value: string): value is ProjectCategory =>
  projectCategories.includes(value as ProjectCategory);
