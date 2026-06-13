/**
 * Tradie tax logic — pure, framework-free, no React or DOM.
 *
 * Powers the free /tools/tradie-tax-calculator tool. Estimates what an
 * Australian sole-trader tradie should set aside from their profit for:
 *   - income tax (resident individual rates)
 *   - the 2% Medicare levy (with the low-income phase-in)
 *   - GST they collect and have to hand back to the ATO (if registered)
 *
 * These are ESTIMATES for a resident sole trader, not tax advice. We use the
 * resident individual rates that apply for the 2025–26 financial year (the
 * Stage 3 rates that have applied since 1 July 2024). Things this deliberately
 * keeps simple so a plumber can actually use it: no HECS/HELP, no offsets
 * beyond the Medicare phase-in, no PAYG-instalment timing. The whole point is
 * "roughly how much of this should I not spend".
 *
 * Money is in plain dollars. Keeping this pure means it's unit-testable and
 * reusable on client or server without dragging in React.
 */

/** A resident income-tax bracket: tax on income above `from`, at `rate`. */
export type TaxBracket = {
  /** Lower bound (exclusive of the threshold dollar). */
  from: number;
  /** Upper bound, or null for the top bracket. */
  to: number | null;
  /** Marginal rate as a fraction, e.g. 0.30 for 30c in the dollar. */
  rate: number;
};

/**
 * Resident individual income-tax brackets for 2025–26 (same as 2024–25).
 * Source: ATO individual income tax rates. Excludes the Medicare levy, which
 * is calculated separately below.
 */
export const TAX_BRACKETS_2025_26: TaxBracket[] = [
  { from: 0, to: 18200, rate: 0 },
  { from: 18200, to: 45000, rate: 0.16 },
  { from: 45000, to: 135000, rate: 0.3 },
  { from: 135000, to: 190000, rate: 0.37 },
  { from: 190000, to: null, rate: 0.45 },
];

/** The financial year these figures apply to — shown in the UI for trust. */
export const TAX_YEAR_LABEL = "2025–26";

/** Medicare levy rate (2%) and the resident single low-income thresholds. */
export const MEDICARE_RATE = 0.02;
const MEDICARE_LOWER = 27222; // no levy at or below this
const MEDICARE_UPPER = 34027; // full 2% at or above this

/** GST is a flat 10% in Australia; registration is required at $75k turnover. */
export const GST_RATE = 0.1;
export const GST_THRESHOLD = 75000;

/** Income tax payable on a taxable income, before the Medicare levy. */
export function incomeTax(taxableIncome: number): number {
  const income = Math.max(0, taxableIncome);
  let tax = 0;
  for (const bracket of TAX_BRACKETS_2025_26) {
    if (income <= bracket.from) break;
    const upper = bracket.to === null ? income : Math.min(income, bracket.to);
    tax += (upper - bracket.from) * bracket.rate;
  }
  return tax;
}

/**
 * Medicare levy for a resident single. Nil up to the lower threshold, then
 * phased in at 10c per dollar between the thresholds, then a flat 2% above.
 * This matches the ATO's low-income reduction so small earners aren't
 * over-estimated.
 */
export function medicareLevy(taxableIncome: number): number {
  const income = Math.max(0, taxableIncome);
  if (income <= MEDICARE_LOWER) return 0;
  if (income < MEDICARE_UPPER) {
    const phaseIn = (income - MEDICARE_LOWER) * 0.1;
    return Math.min(phaseIn, income * MEDICARE_RATE);
  }
  return income * MEDICARE_RATE;
}

export type TaxEstimate = {
  /** Revenue minus deductible expenses — what's actually taxed. */
  taxableIncome: number;
  incomeTax: number;
  medicare: number;
  /** Income tax + Medicare levy. */
  totalTax: number;
  /** Total tax as a fraction of taxable income (0 when income is 0). */
  effectiveRate: number;
  /** What you keep after income tax + Medicare (GST isn't yours to keep). */
  takeHome: number;
  /**
   * Net GST to hand back: GST charged on sales minus GST credits on
   * GST-applicable expenses. Zero when not registered. Floored at 0 — a
   * refund position isn't money to "set aside".
   */
  gstToSetAside: number;
  /** income tax + Medicare + net GST: the full "don't spend this" figure. */
  totalToSetAside: number;
};

export type TaxInputs = {
  /** Total money invoiced/earned for the year, GST-exclusive. */
  annualRevenue: number;
  /** Deductible business expenses for the year, GST-exclusive. */
  annualExpenses: number;
  /** Whether the tradie is registered for (and charges) GST. */
  gstRegistered: boolean;
  /**
   * Share of expenses that carry GST credits (fraction 0–1). Wages, bank fees,
   * some insurances and overseas software don't. Defaults handled by caller.
   */
  gstCreditableShare: number;
};

/** The full estimate from a tradie's revenue, expenses and GST status. */
export function estimateTax(inputs: TaxInputs): TaxEstimate {
  const revenue = Math.max(0, inputs.annualRevenue);
  const expenses = Math.max(0, inputs.annualExpenses);

  const taxableIncome = Math.max(0, revenue - expenses);
  const tax = incomeTax(taxableIncome);
  const medicare = medicareLevy(taxableIncome);
  const totalTax = tax + medicare;
  const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
  const takeHome = taxableIncome - totalTax;

  let gstToSetAside = 0;
  if (inputs.gstRegistered) {
    const gstCollected = revenue * GST_RATE;
    const creditableExpenses =
      expenses * Math.min(Math.max(inputs.gstCreditableShare, 0), 1);
    const gstCredits = creditableExpenses * GST_RATE;
    gstToSetAside = Math.max(0, gstCollected - gstCredits);
  }

  return {
    taxableIncome,
    incomeTax: tax,
    medicare,
    totalTax,
    effectiveRate,
    takeHome,
    gstToSetAside,
    totalToSetAside: totalTax + gstToSetAside,
  };
}

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

/** Whole-dollar AUD, e.g. 12345.6 → "$12,346". Used across the calculator. */
export function formatAUD0(amount: number): string {
  return AUD.format(Number.isFinite(amount) ? Math.round(amount) : 0);
}
