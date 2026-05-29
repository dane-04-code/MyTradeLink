/**
 * Quote domain logic — pure, framework-free, no React or DOM.
 *
 * This is the shared core behind the free /tools/quote-template tool (and,
 * later, the tax invoice tool, with the same money/GST maths and business details).
 * Keeping it pure means it can be unit-tested and reused on both client and
 * server without dragging in jsPDF or React.
 *
 * Money is handled in plain numbers (dollars). Australian GST is a flat 10%
 * and entered line prices are treated as GST-EXCLUSIVE — GST is added on top
 * only when the tradie is registered for it (turnover ≥ $75k). Most sole
 * traders aren't, so GST defaults to off.
 */

export const GST_RATE = 0.1;

export type LineItem = {
  /** Stable id for React keys / row removal. */
  id: string;
  description: string;
  /** Quantity (hours, units, days…). */
  qty: number;
  /** Price per unit, GST-exclusive, in AUD dollars. */
  unitPrice: number;
};

export type BusinessDetails = {
  businessName: string;
  abn: string;
  phone: string;
  email: string;
  /** Optional logo as a data URL (read locally, never uploaded). */
  logoDataUrl: string | null;
};

export type Quote = {
  business: BusinessDetails;
  clientName: string;
  clientContact: string;
  jobAddress: string;
  quoteNumber: string;
  /** ISO date strings (yyyy-mm-dd) from <input type="date">. */
  issueDate: string;
  validUntil: string;
  lineItems: LineItem[];
  /** Whether to add 10% GST on top of the subtotal. */
  gstRegistered: boolean;
  notes: string;
};

export type QuoteTotals = {
  subtotal: number;
  gst: number;
  total: number;
};

/** The amount for a single line (qty × unit price), guarding against NaN. */
export function lineTotal(item: Pick<LineItem, "qty" | "unitPrice">): number {
  const qty = Number.isFinite(item.qty) ? item.qty : 0;
  const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
  return qty * price;
}

/** Subtotal, GST and grand total for a quote. GST is 0 when not registered. */
export function calcTotals(
  lineItems: LineItem[],
  gstRegistered: boolean
): QuoteTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const gst = gstRegistered ? subtotal * GST_RATE : 0;
  return { subtotal, gst, total: subtotal + gst };
}

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a dollar amount as Australian currency, e.g. 1234.5 → "$1,234.50". */
export function formatAUD(amount: number): string {
  return AUD.format(Number.isFinite(amount) ? amount : 0);
}

const AU_DATE = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Format an ISO date (yyyy-mm-dd) for display, e.g. "28 May 2026".
 * Returns an empty string for blank/invalid input so the preview stays clean.
 */
export function formatDate(iso: string): string {
  if (!iso) return "";
  // Parse as local date parts to avoid timezone shifting the day.
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return AU_DATE.format(new Date(y, m - 1, d));
}

/** yyyy-mm-dd for a Date, in local time (matches <input type="date"> value). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * A default quote number based on a date, e.g. "Q-20260528".
 * Editable by the tradie — this is just a sensible starting point.
 */
export function defaultQuoteNumber(today: Date): string {
  return `Q-${toISODate(today).replace(/-/g, "")}`;
}

/** A fresh, empty line item with a unique id derived from a seed. */
export function emptyLineItem(seed: string): LineItem {
  return { id: seed, description: "", qty: 1, unitPrice: 0 };
}

/** Empty business details — the starting shape before localStorage hydration. */
export function emptyBusiness(): BusinessDetails {
  return {
    businessName: "",
    abn: "",
    phone: "",
    email: "",
    logoDataUrl: null,
  };
}
