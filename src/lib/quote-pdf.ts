/**
 * Quote → PDF. Renders a Quote (see ./quote) into a branded, one-page A4
 * document using jsPDF, then triggers a download. Browser-only (it calls
 * doc.save), so only import it from client components / event handlers.
 *
 * The layout deliberately mirrors the on-screen live preview: orange header
 * band, business identity, a clean line-items table, a GST-aware totals block,
 * notes, and a subtle "made with mytradelink.page" footer that doubles as the
 * funnel hook. Helvetica (jsPDF's built-in) keeps the file tiny and the text
 * crisp and selectable — no rasterised DOM screenshots.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type Quote,
  calcTotals,
  formatAUD,
  formatDate,
} from "./quote";
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

/**
 * Build the quote document and return the jsPDF instance (no download).
 * Split out from generateQuotePdf so the rendering can run/verify outside a
 * browser, where doc.save() isn't available.
 */
export function buildQuoteDoc(quote: Quote): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totals = calcTotals(quote.lineItems, quote.gstRegistered);
  const right = PAGE_W - MARGIN;

  /* ---- Header band -------------------------------------------------------- */
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, PAGE_W, 40, "F");

  // Left: logo if supplied, otherwise the business name in ink-on-orange.
  if (quote.business.logoDataUrl) {
    try {
      // Fit the logo into a 45×20mm box (top-left of the band) preserving
      // its aspect ratio, and detect its format from the data URL.
      const props = doc.getImageProperties(quote.business.logoDataUrl);
      const ratio = Math.min(45 / props.width, 20 / props.height);
      doc.addImage(
        quote.business.logoDataUrl,
        props.fileType,
        MARGIN,
        10,
        props.width * ratio,
        props.height * ratio
      );
    } catch {
      // If the image is unreadable, fall back to the text name below.
      drawBusinessName(doc, quote.business.businessName);
    }
  } else {
    drawBusinessName(doc, quote.business.businessName);
  }

  // Left, under the name: contact line.
  const contactBits = [
    quote.business.phone,
    quote.business.email,
    quote.business.abn ? `ABN ${quote.business.abn}` : "",
  ].filter(Boolean);
  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(contactBits.join("   •   "), MARGIN, 33);
  }

  // Right: big "QUOTE" + meta.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text("QUOTE", right, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const meta = [
    quote.quoteNumber ? `No. ${quote.quoteNumber}` : "",
    quote.issueDate ? `Issued ${formatDate(quote.issueDate)}` : "",
    quote.validUntil ? `Valid until ${formatDate(quote.validUntil)}` : "",
  ].filter(Boolean);
  meta.forEach((line, i) => {
    doc.text(line, right, 27 + i * 4.5, { align: "right" });
  });

  /* ---- Client block ------------------------------------------------------- */
  let y = 54;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_500);
  doc.text("QUOTE FOR", MARGIN, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(quote.clientName || "—", MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK_500);
  const clientLines = [quote.jobAddress, quote.clientContact].filter(Boolean);
  clientLines.forEach((line) => {
    y += 5;
    doc.text(line, MARGIN, y);
  });

  /* ---- Line items table --------------------------------------------------- */
  const body = quote.lineItems
    .filter((it) => it.description || it.qty || it.unitPrice)
    .map((it) => [
      it.description || "—",
      String(it.qty || 0),
      formatAUD(it.unitPrice),
      formatAUD((it.qty || 0) * (it.unitPrice || 0)),
    ]);

  autoTable(doc, {
    startY: y + 8,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Description", "Qty", "Unit price", "Amount"]],
    body: body.length ? body : [["—", "0", formatAUD(0), formatAUD(0)]],
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
      1: { cellWidth: 18, halign: "right" },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 34, halign: "right" },
    },
  });

  /* ---- Totals block ------------------------------------------------------- */
  let ty = tableFinalY(doc) + 8;
  // If the totals would overflow the page, start a fresh one.
  if (ty > PAGE_H - 50) {
    doc.addPage();
    ty = MARGIN + 8;
  }

  const labelX = right - 60;
  const valueX = right;

  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(...INK);
    doc.text(label, labelX, ty);
    doc.text(value, valueX, ty, { align: "right" });
    ty += bold ? 8 : 6;
  };

  totalRow(
    quote.gstRegistered ? "Subtotal (ex GST)" : "Subtotal",
    formatAUD(totals.subtotal)
  );
  if (quote.gstRegistered) {
    totalRow("GST (10%)", formatAUD(totals.gst));
  }

  // Divider above the grand total.
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(labelX, ty - 2, valueX, ty - 2);
  ty += 3;
  totalRow(
    quote.gstRegistered ? "Total (inc GST)" : "Total",
    formatAUD(totals.total),
    true
  );

  if (!quote.gstRegistered) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("Not registered for GST", valueX, ty, { align: "right" });
    ty += 6;
  }

  /* ---- Notes -------------------------------------------------------------- */
  if (quote.notes.trim()) {
    let ny = Math.max(ty + 4, tableFinalY(doc) + 14);
    if (ny > PAGE_H - 40) {
      doc.addPage();
      ny = MARGIN + 8;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("NOTES & TERMS", MARGIN, ny);
    ny += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(quote.notes.trim(), CONTENT_W);
    doc.text(wrapped, MARGIN, ny);
  }

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
    doc.text("Quote created free with mytradelink.page", MARGIN, PAGE_H - 9);
    doc.text(`Page ${p} of ${pageCount}`, right, PAGE_H - 9, {
      align: "right",
    });
  }

  return doc;
}

/** Build the quote PDF and trigger a browser download. Client-only. */
export function generateQuotePdf(quote: Quote): void {
  const doc = buildQuoteDoc(quote);
  const filename = `${sanitizeFilename(
    quote.business.businessName || "quote"
  )}-${sanitizeFilename(quote.quoteNumber || "quote")}.pdf`;
  doc.save(filename);
}

/** Business name in ink, sitting in the orange header band. */
function drawBusinessName(doc: jsPDF, name: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(name || "Your business", MARGIN, 22);
}
