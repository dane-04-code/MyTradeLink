/**
 * Shared PDF primitives for the trade-document tools (quote, tax invoice, and
 * any future job sheet). Keeps the brand palette, page geometry and a couple
 * of jsPDF helpers in one place so every generated document looks identical.
 */
import type { jsPDF } from "jspdf";

export type RGB = [number, number, number];

// Brand palette as RGB tuples (jsPDF wants numbers, not hex).
export const ORANGE: RGB = [249, 115, 22]; // #F97316
export const INK: RGB = [15, 23, 42]; // #0F172A
export const INK_500: RGB = [100, 116, 139]; // #64748B
export const LINE: RGB = [226, 232, 240]; // #E2E8F0
export const MUTED: RGB = [248, 250, 252]; // #F8FAFC
export const WHITE: RGB = [255, 255, 255];

// A4 geometry in millimetres.
export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN = 16;
export const CONTENT_W = PAGE_W - MARGIN * 2;

/**
 * autoTable() records where the table finished on `lastAutoTable`, but this
 * version of jspdf-autotable doesn't add it to the jsPDF type. This narrow
 * interface lets us read finalY without resorting to `any`.
 */
interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export function tableFinalY(doc: jsPDF): number {
  return (doc as DocWithAutoTable).lastAutoTable.finalY;
}

/** Slugify a string for use in a download filename. */
export function sanitizeFilename(input: string, fallback = "document"): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}
