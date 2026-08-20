import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectFallbackImage } from '../src/features/exhibition/data/project-images.ts';
import { isProjectImage, PROJECT_IMAGE_MAX_BYTES } from '../src/lib/cloudinary/project-image.ts';

assert.match(projectFallbackImage('p1'), /^https:\/\/images\.unsplash\.com\/photo-/);
assert.ok(isProjectImage(new File(['image'], 'project.png', { type: 'image/png' })));
assert.ok(!isProjectImage(new File(['image'], 'project.gif', { type: 'image/gif' })));
assert.ok(!isProjectImage(new File([new Uint8Array(PROJECT_IMAGE_MAX_BYTES + 1)], 'large.jpg', { type: 'image/jpeg' })));

const adminProjects = readFileSync('src/features/exhibition/pages/admin/projects-page.tsx', 'utf8');
const voterData = readFileSync('src/lib/voter/data.ts', 'utf8');
assert.match(adminProjects, /projectFromRow/);
assert.match(voterData, /import 'server-only'/);
assert.match(voterData, /getVoterSupabase/);
console.log('admin project checks passed');
