import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260830090000_printed_voting_codes.sql', 'utf8');
const page = readFileSync('src/features/exhibition/pages/admin/codes-page.tsx', 'utf8');

assert.match(migration, /is_printed boolean not null default false/);
assert.match(migration, /input_query text default null/);
assert.match(migration, /input_is_printed boolean default null/);
assert.match(migration, /codes\.code like '%' \|\| normalized_query \|\| '%'/);
assert.match(migration, /not public\.is_voting_admin\(\)/);
assert.match(migration, /set_voting_code_printed\(text, boolean\)/);
assert.match(migration, /replace_printed_voting_codes\(/);
assert.match(page, /aria-label="Find voting code"/);
assert.match(page, /All print states/);
assert.match(page, /set_voting_code_printed/);

console.log('printed code management checks passed');
