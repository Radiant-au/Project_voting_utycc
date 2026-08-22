import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');
const liveDisplay = read('src/features/exhibition/pages/admin/live-display-page.tsx');
const settings = read('src/features/exhibition/pages/admin/settings-page.tsx');
const migration = read('supabase/migrations/20260823090000_live_results_reveal.sql');

assert.match(liveDisplay, /table: 'voting_settings'/);
assert.match(liveDisplay, /revealed \? <>/);
assert.match(liveDisplay, /row\.title/);
assert.match(settings, /Reveal project details/);
assert.match(migration, /results_revealed boolean not null default false/);
assert.match(migration, /alter publication supabase_realtime add table public\.voting_settings/);

console.log('Live results reveal check passed.');
