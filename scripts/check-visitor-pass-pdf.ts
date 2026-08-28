import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { PDFDocument } from 'pdf-lib';
import { generateTeacherPassPdf } from '../src/lib/teacher-pass-pdf.ts';
import { generateVisitorPassPdf } from '../src/lib/visitor-pass-pdf.ts';

const template = await readFile(new URL('../public/Visitor_frame.pdf', import.meta.url));
const teacherTemplate = await readFile(new URL('../public/Teacher_frame.pdf', import.meta.url));
const origin = 'https://vote.utyccfresher.online';
const execFile = promisify(execFileCallback);

for (const [codes, expectedPages] of [
  [['AAAAAAA'], 1],
  [['AAAAAAA', 'BBBBBBB', 'CCCCCCC', 'DDDDDDD'], 2],
] as const) {
  const output = await generateVisitorPassPdf(template, codes, origin);
  const pdf = await PDFDocument.load(output);
  assert.equal(pdf.getPageCount(), expectedPages);
  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    assert.ok(Math.abs(width - 842.25) < 0.01 && Math.abs(height - 595.5) < 0.01);
  }
}

const checkDir = await mkdtemp(join(tmpdir(), 'teacher-pass-pdf-'));
try {
  for (const [codes, expectedPages] of [
    [['TEA0001'], 1],
    [['TEA0001', 'TEA0002', 'TEA0003', 'TEA0004'], 1],
    [['TEA0001', 'TEA0002', 'TEA0003', 'TEA0004', 'TEA0005'], 2],
  ] as const) {
    const output = await generateTeacherPassPdf(teacherTemplate, codes);
    const pdf = await PDFDocument.load(output);
    assert.equal(pdf.getPageCount(), expectedPages);
    const outputPath = join(checkDir, `${codes.length}.pdf`);
    await writeFile(outputPath, output);
    const { stdout } = await execFile('pdftotext', [outputPath, '-']);
    for (const code of codes) assert.match(stdout, new RegExp(code));
  }
} finally {
  await rm(checkDir, { recursive: true, force: true });
}

console.log('Visitor and teacher pass PDF checks passed.');
