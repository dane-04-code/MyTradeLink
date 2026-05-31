# Localisation: AU-leaning brand + per-tool country toggle

Date: 2026-05-31
Status: Approved design, ready for implementation plan

## Problem

The site is half-migrated. Landing copy and the free tools are hardcoded for
Australia (GST, ABN, ATO, AUD, `$`), while `trades.ts` is still the old UK
list. We want the product to work for both an Aussie tradie and a UK
tradesperson without confusing either, and without throwing away the AU focus
that is the confirmed primary market.

We explicitly rejected two heavier options:

- **Full dual-market geo-routing** (`/au` + `/uk`, IP redirect, hreflang). Too
  much work pre-launch and carries real SEO risk (a blind IP redirect traps
  Googlebot on one version).
- **Fully generic everything.** Breaks the tax tools, which are legal documents
  that cannot be correct in both countries at once, and they are the top-of-
  funnel SEO engine.

## Approach

One site, one URL set. No region segment, no middleware redirect, no hreflang,
no SEO migration. Localisation is applied only where it actually matters:

1. **Brand voice: AU-leaning, UK-friendly.** Keep the warm "tradie" tone and AU
   focus. Remove only the hard AU-only claims from shared marketing surfaces
   (homepage hero, tool cards) so a UK visitor is not told the product is not
   for them.
2. **Free tools get a country toggle.** A small `AU / UK` switch inside the tax
   invoice and quote tools flips tax name, rate, currency, business-ID label,
   bank-detail labels and the compliance heading. Defaults to AU, remembers the
   last choice in localStorage. One tool, two correct documents.
3. **The product stays AU-default.** Dashboard, onboarding and public profiles
   keep AUD and AU labelling. No per-user country yet (YAGNI). We revisit if UK
   signups appear.

The line: anything that serves anonymous visitors from both countries (the free
tools) is localisable; the authenticated product is AU-primary for now.

## Components

### 1. Region config module: `src/lib/tax-region.ts` (new)

The single source of truth for what differs between countries. Pure data, no
React.

```ts
export type CountryCode = "AU" | "UK";

export type TaxRegion = {
  code: CountryCode;
  label: string;          // "Australia" / "United Kingdom"
  flag: string;           // "AU" / "GB" emoji or short tag for the toggle
  locale: string;         // "en-AU" / "en-GB"
  currencyCode: string;   // "AUD" / "GBP"
  currencySymbol: string; // "$" / "£"
  taxName: string;        // "GST" / "VAT"
  taxRate: number;        // 0.10 / 0.20
  businessIdLabel: string;     // "ABN" / "VAT No."
  businessIdPlaceholder: string;
  // Payment block: AU uses BSB + account number, UK uses sort code + account no.
  bankCodeLabel: string;       // "BSB" / "Sort code"
  bankCodePlaceholder: string; // "123-456" / "12-34-56"
  registeredHeading: string;   // "TAX INVOICE" / "VAT INVOICE"
  unregisteredHeading: string; // "INVOICE" / "INVOICE"
  authority: string;           // "ATO" / "HMRC" (used in copy)
};

export const TAX_REGIONS: Record<CountryCode, TaxRegion> = { AU: {...}, UK: {...} };
export const DEFAULT_COUNTRY: CountryCode = "AU";
export function getRegion(code: CountryCode): TaxRegion;
```

### 2. Make the money/tax core region-aware: `src/lib/quote.ts`

Today this hardcodes AU. Changes:

- `GST_RATE = 0.1` constant: replace direct use with `region.taxRate`. Keep the
  export as a deprecated AU alias only if something still imports it, otherwise
  remove.
- `calcTotals(lineItems, taxRegistered)` gains a `rate` (or `region`) argument
  instead of the baked 0.1.
- `formatAUD` becomes `formatMoney(amount, region)` using `region.locale` and
  `region.currencyCode`. Provide a thin `formatAUD` shim only if other callers
  outside the tools still need AUD (check usages first).
- `formatDate` already uses `en-AU`; parameterise to `region.locale` so UK shows
  `28 May 2026` consistently (both en-AU and en-GB render the same here, but
  keep it region-driven for correctness).
- `BusinessDetails.abn` field: rename concept to a generic `businessId` OR keep
  the field name and just relabel in the UI. Decision: keep the stored key as
  `abn` to avoid a localStorage migration, relabel via the region config. Note
  this clearly in code so it is not mistaken for AU-only.

### 3. Invoice logic: `src/lib/invoice.ts`

- `invoiceHeading(taxRegistered, region)` returns the region heading
  (`registeredHeading` / `unregisteredHeading`) instead of the hardcoded
  "TAX INVOICE" / "INVOICE".
- `PaymentDetails.bsb`: keep the stored key, relabel to `region.bankCodeLabel`
  ("BSB" vs "Sort code") in the UI and PDF.

### 4. Shared form chrome: `src/app/tools/_components/doc-form.tsx`

- Add a `CountryToggle` control (AU / UK), rendered at the top of each tool
  form. Persists to localStorage key `mytradelink:country`, defaults to
  `DEFAULT_COUNTRY`.
- `BusinessDetailsSection`: ABN field label + placeholder, phone/email
  placeholders come from the region (currently `0400 000 000`,
  `dave@example.com.au`).
- `LineItemsEditor`: the hardcoded `$` prefix and the local `en-AU` `AUD`
  formatter become region-driven (`region.currencySymbol`,
  `formatMoney(..., region)`).
- `GstToggle`: title/description text references `region.taxName` and rate
  (e.g. "Add GST (10%)" vs "Add VAT (20%)").

### 5. Tool pages and PDF output

- `tax-invoice-generator/page.tsx`, `quote-template/page.tsx` and the PDF
  rendering (`pdf-theme.ts` / wherever jsPDF assembles the doc) read the active
  region for headings, currency, tax label and bank-detail labels.
- The active country lifts to the page-level client state so the live preview
  and the generated PDF stay in sync with the toggle.

### 6. Marketing copy: `src/app/page.tsx` and tool configs

Targeted edits, not a rewrite:

- Homepage hero / shared sections: keep the "tradie" voice, remove hard AU-only
  claims ("ATO-compliant", "ABN") from the headline area.
- Homepage tools section + `tools.ts` card descriptions: describe tools so they
  read for both markets (e.g. "Make a compliant tax invoice in under a minute,
  Australia or UK"). Keep SEO meta AU-led (primary market) but mention UK in the
  body so pages can also catch UK search.

### 7. Reconcile `trades.ts`

Currently labelled "UK trades" while the site is AU. Make it one
AU-appropriate list that is still UK-readable (the trades overlap heavily).
Update the file comment. This is shown in onboarding to the tradie (AU-primary
audience), so AU-first naming is correct.

## Data flow

```
CountryToggle (client, localStorage "mytradelink:country")
   -> active CountryCode lifted to tool page state
   -> getRegion(code) -> TaxRegion
        -> form chrome   (labels, placeholders, currency symbol)
        -> calcTotals    (taxRate)
        -> formatMoney   (locale, currency)
        -> invoiceHeading / payment labels
        -> live preview + generated PDF
```

No server involvement, no cookies for the product, no IP detection.

## Error / edge handling

- Unknown or missing localStorage country -> `DEFAULT_COUNTRY` (AU).
- Switching country mid-edit only changes labels, tax rate and formatting;
  entered numbers and text are preserved (no data loss). The tax amount
  recalculates from the new rate, which is correct.
- Stored `abn` / `bsb` keys are reused across both countries by design; a value
  typed under one country persists when toggling. Acceptable for a free tool;
  documented in code.

## Testing

- Unit (pure lib): `calcTotals` with AU 10% and UK 20%; `formatMoney` for AUD
  and GBP; `invoiceHeading` for both regions registered/unregistered.
- Component: toggling country updates the GST/VAT toggle label, currency symbol
  in line items, and business-ID label.
- Manual: generate a tax invoice in AU (Tax Invoice, GST 10%, ABN, BSB, `$`) and
  UK (Invoice, VAT 20%, VAT No., Sort code, `£`); confirm the PDF matches.

## Out of scope (explicitly)

- Geo-detection, `/au` `/uk` routing, hreflang, middleware changes.
- Per-user country on the authenticated product (dashboard/profile stay AUD).
- New languages or non-English translation.

## Risks

- The money core (`quote.ts`) is imported in several places; the `formatAUD` ->
  `formatMoney` change must be traced to every caller before removing the AU
  alias. First implementation step is to grep all usages.
- PDF assembly may have its own hardcoded `$`/labels; audit the PDF path
  alongside the form.
