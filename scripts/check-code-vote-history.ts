import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');
const migration = read('supabase/migrations/20260823110000_code_vote_history.sql');
const page = read('src/features/exhibition/pages/admin/vote-history-page.tsx');
const nav = read('src/features/exhibition/components/admin.tsx');
const locale = read('src/features/exhibition/i18n.tsx');
const receipt = read('src/features/exhibition/pages/voter/vote-success-page.tsx');

assert.match(migration, /left join public\.votes votes on votes\.voting_code_id = codes\.id/);
assert.match(migration, /left join public\.projects projects on projects\.id = votes\.project_id/);
assert.match(migration, /codes\.code ilike/);
assert.match(migration, /input_category is null or codes\.category = input_category/);
assert.match(migration, /input_status is null or codes\.status = input_status/);
assert.match(migration, /if not public\.is_voting_admin\(\)/);
assert.match(migration, /limit 500/);
assert.match(page, /project_title \?\?/);
assert.match(page, /All categories/);
assert.match(page, /All statuses/);
assert.match(nav, /\/admin\/vote-history/);
assert.match(locale, /useState<Locale>\('my'\)/);
assert.match(locale, /setLocale\(stored === 'en' \? 'en' : 'my'\)/);
assert.match(locale, /voteUnavailable:/);
assert.match(locale, /မဲပေးထားသော ပရောဂျက် မရရှိနိုင်ပါ/);
assert.match(receipt, /t\('recordedAt'\)/);

const section = (name: string, next: string) => locale.match(new RegExp(`${name}: \\{([\\s\\S]*?)${next}`))?.[1] ?? '';
const keys = (source: string) => [...source.matchAll(/\b([a-zA-Z][a-zA-Z0-9]*):/g)].map((match) => match[1]).sort();
assert.deepEqual(keys(section('en', '\\n  },\\n  my:')), keys(section('my', '\\n  }\\n} as const')));

console.log('Code vote history checks passed.');
