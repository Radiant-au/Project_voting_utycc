import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');
const categories = read('src/features/exhibition/data/project-categories.ts');
const migration = read('supabase/migrations/20260820170000_canonical_project_categories.sql');
const form = read('src/features/exhibition/pages/admin/project-form-page.tsx');
const projects = read('src/features/exhibition/pages/voter/projects-page.tsx');
const status = read('src/features/exhibition/pages/voter/projects-page.tsx');
const voteRoute = read('src/app/api/voter/vote/route.ts');
const locale = read('src/features/exhibition/i18n.tsx');

assert.match(categories, /Earth & Environment/);
assert.match(categories, /Design & Technology/);
assert.match(migration, /category = 'Design & Technology'/);
assert.match(migration, /projects_category_check/);
assert.match(form, /isProjectCategory\(form\.category\)/);
assert.match(projects, /projectCategoryOptions/);
assert.match(status, /voterApi\.status\(\)/);
assert.match(status, /votingOpen !== true/);
assert.match(voteRoute, /voting_closed/);
assert.match(locale, /window\.localStorage/);

const section = (name: string, next: string) => locale.match(new RegExp(`${name}: \{([\\s\\S]*?)${next}`))?.[1] ?? '';
const keys = (source: string) => [...source.matchAll(/\b([a-zA-Z][a-zA-Z0-9]*):/g)].map((match) => match[1]).sort();
assert.deepEqual(keys(section('en', '\\n  },\\n  my:')), keys(section('my', '\\n  }\\n} as const')));

console.log('Voting feature checks passed.');
