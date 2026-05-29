/**
 * Invoice domain logic — pure, framework-free. Builds on the shared quote
 * engine (same business details, line items, GST maths, AUD/date formatting)
 * and adds the invoice-specific bits: invoice number, due date, payment
 * details, and the ATO labelling rule.
 *
 * ATO rule baked in here: an invoice may only be headed "Tax Invoice" if the
 * business is registered for GST. If not registered, it must just say
 * "Invoice" (and carry no GST). See invoiceHeading().
 */

import {
  type BusinessDetails,
  type LineItem,
  type QuoteTotals,
  calcTotals,
  toISODate,
} from "./quote";

export type {
  BusinessDetails,
  LineItem,
  QuoteTotals,
} from "./quote";
export {
  calcTotals,
  formatAUD,
  formatDate,
  toISODate,
  lineTotal,
  emptyLineItem,
  emptyBusiness,
  GST_RATE,
} from "./quote";

/** Bank-transfer details shown on the invoice so the customer can pay. */
export type PaymentDetails = {
  accountName: string;
  bsb: string;
  accountNumber: string;
  /** Optional free-text, e.g. PayID or "Cash on completion". */
  other: string;
};

export type Invoice = {
  business: BusinessDetails;
  clientName: string;
  clientContact: string;
  jobAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  gstRegistered: boolean;
  payment: PaymentDetails;
  notes: string;
};

/** Totals reuse the shared GST-aware calculation. */
export function invoiceTotals(invoice: Invoice): QuoteTotals {
  return calcTotals(invoice.lineItems, invoice.gstRegistered);
}

/**
 * ATO-compliant document heading. Only GST-registered businesses may call
 * their document a "Tax Invoice"; everyone else issues a plain "Invoice".
 */
export function invoiceHeading(gstRegistered: boolean): "TAX INVOICE" | "INVOICE" {
  return gstRegistered ? "TAX INVOICE" : "INVOICE";
}

/** A default invoice number based on a date, e.g. "INV-20260528". */
export function defaultInvoiceNumber(today: Date): string {
  return `INV-${toISODate(today).replace(/-/g, "")}`;
}

/** Empty bank details — the starting shape before the tradie fills them in. */
export function emptyPayment(): PaymentDetails {
  return { accountName: "", bsb: "", accountNumber: "", other: "" };
}
