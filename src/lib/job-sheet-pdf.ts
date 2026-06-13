/**
 * Job sheet → PDF. Same brand language as the quote/invoice PDFs (orange
 * header band, ink table, footer funnel hook) but renders a job record:
 * "JOB SHEET" heading, status, customer & site, work done, a materials table
 * with no prices, hours, follow-up, and a sign-off block with signature lines.
 *
 * Browser-only for generateJobSheetPdf (doc.save); buildJobSheetDoc is
 * environment-agnostic so it can be verified outside a browser.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type JobSheet,
  JOB_STATUS_LABELS,
  formatDate,
} from "./job-sheet";
import {
  ORANGE,
  INK,
  INK_500,
  LINE,
  MUTED,
  WHITE,
  PAGE_W,
  PAGE_H,
  MARGIN,
  CONTENT_W,
  tableFinalY,
  sanitizeFilename,
} from "./pdf-theme";

export function buildJobSheetDoc(sheet: JobSheet): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const right = PAGE_W - MARGIN;

  /* ---- Header band -------------------------------------------------------- */
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, PAGE_W, 40, "F");

  if (sheet.business.logoDataUrl) {
    try {
      const props = doc.getImageProperties(sheet.business.logoDataUrl);
      const ratio = Math.min(45 / props.width, 20 / props.height);
      doc.addImage(
        sheet.business.logoDataUrl,
        props.fileType,
        MARGIN,
        10,
        props.width * ratio,
        props.height * ratio
      );
    } catch {
      drawBusinessName(doc, sheet.business.businessName);
    }
  } else {
    drawBusinessName(doc, sheet.business.businessName);
  }

  const contactBits = [
    sheet.business.phone,
    sheet.business.email,
    sheet.business.abn ? `ABN ${sheet.business.abn}` : "",
  ].filter(Boolean);
  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(contactBits.join("   •   "), MARGIN, 33);
  }

  // Right: heading + meta (job no, date, status).
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text("JOB SHEET", right, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const meta = [
    sheet.jobNumber ? `No. ${sheet.jobNumber}` : "",
    sheet.jobDate ? `Date ${formatDate(sheet.jobDate)}` : "",
    `Status: ${JOB_STATUS_LABELS[sheet.status]}`,
  ].filter(Boolean);
  meta.forEach((line, i) => {
    doc.text(line, right, 27 + i * 4.5, { align: "right" });
  });

  /* ---- Customer & site ---------------------------------------------------- */
  let y = 54;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_500);
  doc.text("CUSTOMER & SITE", MARGIN, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(sheet.customerName || "—", MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK_500);
  [sheet.siteAddress, sheet.customerContact].filter(Boolean).forEach((line) => {
    y += 5;
    doc.text(line, MARGIN, y);
  });

  /* ---- Work done ---------------------------------------------------------- */
  if (sheet.workDone.trim()) {
    y += 12;
    y = sectionHeading(doc, "WORK CARRIED OUT", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(sheet.workDone.trim(), CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5;
  }

  /* ---- Materials table ---------------------------------------------------- */
  const materials = sheet.materials.filter((m) => m.description || m.qty);
  if (materials.length) {
    y += 6;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Materials & parts used", "Qty"]],
      body: materials.map((m) => [m.description || "—", m.qty || ""]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 3,
        textColor: INK,
        lineColor: LINE,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: INK,
        textColor: WHITE,
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      alternateRowStyles: { fillColor: MUTED },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 34, halign: "right" },
      },
    });
    y = tableFinalY(doc) + 4;
  }

  /* ---- Hours -------------------------------------------------------------- */
  if (sheet.hours.trim()) {
    y += 8;
    if (y > PAGE_H - 60) {
      doc.addPage();
      y = MARGIN + 8;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(`Hours on site: ${sheet.hours.trim()}`, MARGIN, y);
  }

  /* ---- Follow-up ---------------------------------------------------------- */
  if (sheet.followUp.trim()) {
    y += 10;
    if (y > PAGE_H - 50) {
      doc.addPage();
      y = MARGIN + 8;
    }
    y = sectionHeading(doc, "FOLLOW-UP / NOTES", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(sheet.followUp.trim(), CONTENT_W);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5;
  }

  /* ---- Sign-off ----------------------------------------------------------- */
  let sy = y + 16;
  if (sy > PAGE_H - 45) {
    doc.addPage();
    sy = MARGIN + 16;
  }
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  const colW = (CONTENT_W - 10) / 2;
  // Two signature lines side by side.
  doc.line(MARGIN, sy, MARGIN + colW, sy);
  doc.line(MARGIN + colW + 10, sy, right, sy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_500);
  doc.text("Tradesperson signature & date", MARGIN, sy + 5);
  doc.text("Customer signature & date", MARGIN + colW + 10, sy + 5);

  /* ---- Footer (every page) ----------------------------------------------- */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 14, right, PAGE_H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("Job sheet created free with mytradelink.page", MARGIN, PAGE_H - 9);
    doc.text(`Page ${p} of ${pageCount}`, right, PAGE_H - 9, { align: "right" });
  }

  return doc;
}

/** Build the job sheet PDF and trigger a browser download. Client-only. */
export function generateJobSheetPdf(sheet: JobSheet): void {
  const doc = buildJobSheetDoc(sheet);
  const filename = `${sanitizeFilename(
    sheet.business.businessName || "job-sheet"
  )}-${sanitizeFilename(sheet.jobNumber || "job-sheet", "job-sheet")}.pdf`;
  doc.save(filename);
}

/** A small ink-500 caps section heading; returns the next y to draw at. */
function sectionHeading(doc: jsPDF, label: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_500);
  doc.text(label, MARGIN, y);
  return y + 6;
}

/** Business name in ink, sitting in the orange header band. */
function drawBusinessName(doc: jsPDF, name: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(name || "Your business", MARGIN, 22);
}
