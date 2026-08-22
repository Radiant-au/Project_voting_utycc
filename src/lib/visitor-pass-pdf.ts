import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const QR_SIZE = 125;
const CODE_FONT_SIZE = 18;
const PASSES_PER_PAGE = 3;
const slots = [
  { qr: { x: 97, y: 312 }, code: { x: 141.38, y: 265, width: 136.74 } },
  { qr: { x: 364.4, y: 312 }, code: { x: 408.8, y: 265, width: 136.74 } },
  { qr: { x: 633.9, y: 312 }, code: { x: 678.24, y: 265, width: 136.74 } },
] as const;

export async function generateVisitorPassPdf(
  template: ArrayBuffer | Uint8Array,
  codes: readonly string[],
  siteOrigin: string,
) {
  if (!codes.length) throw new Error('Select at least one visitor code.');

  const templatePdf = await PDFDocument.load(template);
  if (!templatePdf.getPageCount()) throw new Error('The visitor PDF template has no pages.');

  const output = await PDFDocument.create();
  const font = await output.embedFont(StandardFonts.HelveticaBold);
  const origin = siteOrigin.replace(/\/$/, '');

  for (let start = 0; start < codes.length; start += PASSES_PER_PAGE) {
    const [page] = await output.copyPages(templatePdf, [0]);
    output.addPage(page);

    for (const [slotIndex, code] of codes.slice(start, start + PASSES_PER_PAGE).entries()) {
      const slot = slots[slotIndex];
      const accessUrl = new URL(`/access?code=${encodeURIComponent(code)}`, origin).toString();
      const qr = await output.embedPng(await QRCode.toDataURL(accessUrl, {
        errorCorrectionLevel: 'M',
        margin: 4,
        width: 600,
        color: { dark: '#000000', light: '#FFFFFF' },
      }));
      const textWidth = font.widthOfTextAtSize(code, CODE_FONT_SIZE);

      page.drawImage(qr, { ...slot.qr, width: QR_SIZE, height: QR_SIZE });
      page.drawText(code, {
        x: slot.code.x + (slot.code.width - textWidth) / 2,
        y: slot.code.y,
        size: CODE_FONT_SIZE,
        font,
      });
    }
  }

  return output.save();
}
