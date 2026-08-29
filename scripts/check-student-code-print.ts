import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categoryCodes, selectedCategoryCodes, toggleCategoryCodes } from '../src/features/exhibition/pages/admin/code-selection.ts';

const codes = [
  { code: 'STUDENT', category: 'student' as const },
  { code: 'STUD002', category: 'student' as const },
  { code: 'VISITOR', category: 'visitor' as const },
];
const selected = new Set(['VISITOR']);
const allStudents = toggleCategoryCodes(codes, selected, 'student');

assert.deepEqual([...selectedCategoryCodes(codes, allStudents, 'student')].map(({ code }) => code), ['STUDENT', 'STUD002']);
assert.ok(allStudents.has('VISITOR'));
assert.deepEqual([...toggleCategoryCodes(codes, allStudents, 'student')], ['VISITOR']);
assert.equal(categoryCodes(codes, 'student').length, 2);
const page = readFileSync('src/features/exhibition/pages/admin/codes-page.tsx', 'utf8');
assert.match(page, /student-voting-codes\.csv/);
assert.match(page, /Code\\r\\n/);
assert.match(page, /useState<VoterCategory>\("student"\)/);
assert.match(page, /max="800"/);
assert.match(page, /count > 800/);
assert.match(page, /student: 800, visitor: 100, teacher: 90/);
assert.match(page, /Promise\.all\(/);
assert.doesNotMatch(page, /new Date\(\)\.toLocaleString\(\)/);
console.log('student code download checks passed');
