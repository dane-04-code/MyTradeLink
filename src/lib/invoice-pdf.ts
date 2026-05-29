/**
 * Invoice → PDF. Mirrors the quote PDF (orange header band, line-items table,
 * GST-aware totals, footer funnel hook) but renders an invoice: dynamic
 * "Tax Invoice" / "Invoice" heading, due date, and a bank-transfer payment
 * block. Browser-only for generateInvoicePdf (doc.save); buildInvoiceDoc is
 * environment-agnostic so it can be verified outside a browser.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  type Invoice,
  invoiceTotals,
  invoiceHeading,
  formatAUD,
  formatDate,
} from "./invoice";
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

export function buildInvoiceDoc(invoice: Invoice): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totals = invoiceTotals(invoice);
  const right = PAGE_W - MARGIN;

  /* ---- Header band -------------------------------------------------------- */
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, PAGE_W, 40, "F");

  if (invoice.business.logoDataUrl) {
    try {
      const props = doc.getImageProperties(invoice.business.logoDataUrl);
      const ratio = Math.min(45 / props.width, 20 / props.height);
      doc.addImage(
        invoice.business.logoDataUrl,
        props.fileType,
        MARGIN,
        10,
        props.width * ratio,
        props.height * ratio
      );
    } catch {
      drawBusinessName(doc, invoice.business.businessName);
    }
  } else {
    drawBusinessName(doc, invoice.business.businessName);
  }

  const contactBits = [
    invoice.business.phone,
    invoice.business.email,
    invoice.business.abn ? `ABN ${invoice.business.abn}` : "",
  ].filter(Boolean);
  if (contactBits.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(contactBits.join("   •   "), MARGIN, 33);
  }

  // Right: heading ("TAX INVOICE" / "INVOICE") + meta.
  const heading = invoiceHeading(invoice.gstRegistered);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(heading === "TAX INVOICE" ? 22 : 28);
  doc.setTextColor(...INK);
  doc.text(heading, right, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const meta = [
    invoice.invoiceNumber ? `No. ${invoice.invoiceNumber}` : "",
    invoice.issueDate ? `Issued ${formatDate(invoice.issueDate)}` : "",
    invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "",
  ].filter(Boolean);
  meta.forEach((line, i) => {
    doc.text(line, right, 27 + i * 4.5, { align: "right" });
  });

  /* ---- Bill-to block ------------------------------------------------------ */
  let y = 54;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK_500);
  doc.text("BILL TO", MARGIN, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(invoice.clientName || "—", MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK_500);
  [invoice.jobAddress, invoice.clientContact].filter(Boolean).forEach((line) => {
    y += 5;
    doc.text(line, MARGIN, y);
  });

  /* ---- Line items table --------------------------------------------------- */
  const body = invoice.lineItems
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
  if (ty > PAGE_H - 60) {
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
    invoice.gstRegistered ? "Subtotal (ex GST)" : "Subtotal",
    formatAUD(totals.subtotal)
  );
  if (invoice.gstRegistered) {
    totalRow("GST (10%)", formatAUD(totals.gst));
  }

  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(labelX, ty - 2, valueX, ty - 2);
  ty += 3;
  totalRow(
    invoice.gstRegistered ? "Total due (inc GST)" : "Total due",
    formatAUD(totals.total),
    true
  );

  if (!invoice.gstRegistered) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("Not registered for GST", valueX, ty, { align: "right" });
    ty += 6;
  }

  /* ---- Payment details ---------------------------------------------------- */
  const payLines = paymentLines(invoice);
  if (payLines.length) {
    let py = tableFinalY(doc) + 14;
    if (py > PAGE_H - 50) {
      doc.addPage();
      py = MARGIN + 8;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("HOW TO PAY", MARGIN, py);
    py += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    payLines.forEach((line) => {
      doc.text(line, MARGIN, py);
      py += 5;
    });
    ty = Math.max(ty, py);
  }

  /* ---- Notes -------------------------------------------------------------- */
  if (invoice.notes.trim()) {
    let ny = ty + 4;
    if (ny > PAGE_H - 30) {
      doc.addPage();
      ny = MARGIN + 8;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...INK_500);
    doc.text("NOTES", MARGIN, ny);
    ny += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(invoice.notes.trim(), CONTENT_W), MARGIN, ny);
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
    doc.text("Invoice created free with mytradelink.page", MARGIN, PAGE_H - 9);
    doc.text(`Page ${p} of ${pageCount}`, right, PAGE_H - 9, { align: "right" });
  }

  return doc;
}

/** Build the invoice PDF and trigger a browser download. Client-only. */
export function generateInvoicePdf(invoice: Invoice): void {
  const doc = buildInvoiceDoc(invoice);
  const filename = `${sanitizeFilename(
    invoice.business.businessName || "invoice"
  )}-${sanitizeFilename(invoice.invoiceNumber || "invoice", "invoice")}.pdf`;
  doc.save(filename);
}

/** The non-empty payment lines to print, in display order. */
function paymentLines(invoice: Invoice): string[] {
  const { accountName, bsb, accountNumber, other } = invoice.payment;
  const lines: string[] = [];
  if (accountName) lines.push(`Account name: ${accountName}`);
  if (bsb || accountNumber) {
    lines.push(
      [bsb && `BSB ${bsb}`, accountNumber && `Acc ${accountNumber}`]
        .filter(Boolean)
        .join("    ")
    );
  }
  if (other) lines.push(other);
  return lines;
}

/** Business name in ink, sitting in the orange header band. */
function drawBusinessName(doc: jsPDF, name: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(name || "Your business", MARGIN, 22);
}
