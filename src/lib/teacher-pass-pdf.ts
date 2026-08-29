import { PDFDocument, StandardFonts } from "pdf-lib";

const CODES_PER_PAGE = 4;
const CODE_FONT_SIZE = 18;
const BASELINE_ADJUSTMENT = 6.2;
const slots = [
  { x: 154.68, y: 577.59 }, // top-left
  { x: 462.82, y: 576.37 }, // top-right
  { x: 154.49, y: 183.45 }, // bottom-left
  { x: 462.63, y: 183.74 }, // bottom-right
] as const;

export async function generateTeacherPassPdf(
  template: ArrayBuffer | Uint8Array,
  codes: readonly string[],
) {
  if (!codes.length) throw new Error("Select at least one teacher code.");

  const templatePdf = await PDFDocument.load(template);
  if (!templatePdf.getPageCount())
    throw new Error("The teacher PDF template is unavailable.");

  const { width, height } = templatePdf.getPage(0).getSize();
  if (Math.abs(width - 612) > 1 || Math.abs(height - 792) > 1)
    throw new Error("Teacher PDF template must be Letter portrait.");

  const output = await PDFDocument.create();
  const font = await output.embedFont(StandardFonts.HelveticaBold);

  for (let start = 0; start < codes.length; start += CODES_PER_PAGE) {
    const [page] = await output.copyPages(templatePdf, [0]);
    output.addPage(page);

    for (const [index, code] of codes
      .slice(start, start + CODES_PER_PAGE)
      .entries()) {
      const slot = slots[index];
      page.drawText(code, {
        x: slot.x - font.widthOfTextAtSize(code, CODE_FONT_SIZE) / 2,
        y: slot.y - BASELINE_ADJUSTMENT,
        size: CODE_FONT_SIZE,
        font,
      });
    }
  }

  return output.save();
}
