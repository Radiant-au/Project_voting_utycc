import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { generateVisitorPassPdf } from '../src/lib/visitor-pass-pdf.ts';

const template = await readFile(new URL('../public/Visitor_frame.pdf', import.meta.url));
const origin = 'https://vote.utyccfresher.online';

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

console.log('Visitor pass PDF check passed.');
