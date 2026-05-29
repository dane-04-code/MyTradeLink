# AU Homepage Design Spec

**Date:** 2026-05-29
**Status:** Approved for planning
**Author:** brainstormed with Claude Code

## Goal

Pivot the public homepage at `/` from its current UK positioning to an
Australia-focused landing page aimed at Aussie tradies, and tie it to the free
`/tools` SEO funnel. This is the first piece of the broader Australian
expansion. Full product localisation (AUD Stripe checkout, ABN/GST data fields,
AU trades list) is a separate, later workstream and is explicitly out of scope
here.

## Decisions locked in

| Decision | Choice |
|---|---|
| Routing | **Replace** the homepage. `/` becomes the AU page. UK version stays in git history (recoverable as a future `/uk` if ever wanted). |
| Implementation | **Localise in place** by editing `src/app/page.tsx` strings. No structural refactor, no visual redesign. |
| Pricing display | Show **AUD now**, fix Stripe later. Pro shown as **A$15/mo, A$149/yr (save A$31)**. Free is A$0 forever. |
| Pricing page | Also localise the `/pricing` page display numbers to AUD in the same pass, so the funnel is consistent. |
| Scope | Keep the proven section structure, fully localise content, and **add a "Free tools" section + nav link** surfacing the live tools. |

## Non-goals (explicitly out of scope)

- Real AUD Stripe prices / changing checkout currency. Stripe keeps charging GBP
  for now. This is the known follow-up that the AUD display depends on.
- Adding ABN/GST fields, AU trades list, or AU spelling to the core product
  (onboarding, dashboard, profile schema).
- Refactoring `page.tsx` structure or extracting copy into a content object.
- Changing the design system, colour palette, or layout.

## Files touched

| File | Change |
|---|---|
| `src/app/page.tsx` | Localise all copy to AU; add Free tools section; add Free tools nav + footer link. |
| `src/app/pricing/page.tsx` | Localise display numbers to AUD; "GBP/VAT" footnote to "AUD/GST"; "tradesmen" to "tradies"; optional Free tools footer link. |
| `src/app/layout.tsx` | Update global `metadata` title/description/OG from "UK tradesmen" to AU intent. |

No new dependencies. No schema changes. No new routes.

## Content localisation map (page.tsx)

| Area | UK now | AU |
|---|---|---|
| Audience badge | "Built for UK tradesmen" | "Built for Aussie tradies" |
| Hero trade stack | "Plumbers, sparks, builders, gas engineers" | "Plumbers, sparkies, builders, chippies" |
| Trades ticker | Manchester, Leeds, Bristol, Birmingham, Sheffield, etc. | Plumber Sydney, Sparkie Melbourne, Chippy Brisbane, Builder Perth, Landscaper Adelaide, Concreter Gold Coast, Plasterer Newcastle, Tiler Geelong, Painter Wollongong, Roofer Hobart, Fencer Darwin, Bricklayer Canberra. Format: "Trade · City STATE". |
| Phone mockup persona | Dave Wilson Plumbing, "Plumber · Manchester", "Gas Safe Registered #12345", "Boilers, leaks, bathrooms" | Dave Wilson Plumbing, "Plumber · Sydney", "Licensed Plumber · NSW Lic 12345", "Hot water, blocked drains, bathrooms. Fair prices, on time, fully licensed." |
| Quote ticket card | "Sarah Davies, Manchester M21" | "Sarah Davies, Bondi NSW 2026" |
| Before/After chat | "and the gas safe number?" | "you licensed? got insurance?" |
| For-the-jobs cards | Boiler call-out (Manchester) / Full house rewire (Leeds) / Single-storey extension (Bristol); "Part P and NICEIC" | Hot water emergency (Sydney NSW) / Full house rewire (Melbourne VIC) / Deck and pergola build (Brisbane QLD); "electrical licence and insurance" |
| Feature: Certifications | "Gas Safe, NICEIC, CSCS" | "Electrical, plumbing, White Card, builder's licence. Display them as trust badges." |
| Final CTA headline | "Stop losing jobs to lads with a website." | "Stop losing jobs to the bloke with a website." |
| Final CTA stamp | "Approved · UK Trades" | "Approved · Aussie Trades" |

Kept as-is: "postcode" (correct in AU), "mortgage", the Call and WhatsApp
buttons (WhatsApp is a real product feature; the product itself is not being
changed here), the URL chip `mytradelink.page/t/dave-plumber`, and all visual
styling.

## New: Free tools section + nav

- **Header nav:** add a "Free tools" link to `/tools`, sitting beside the
  existing "Pricing" link (same styling as the Pricing link).
- **Footer:** add a "Free tools" link.
- **Homepage section:** a new section placed after "For the jobs" and before
  "Pricing", styled with the existing job-ticket card language, showing the two
  live tools:
  - Quote Template, links to `/tools/quote-template`
  - Tax Invoice Generator, links to `/tools/tax-invoice-generator`
  - A line indicating more tools are on the way, and a link to `/tools`.
- Renumber the `SectionMarker` sequence so the ghost numbers stay in order
  (Free tools becomes its own numbered section; Pricing and following shift).

## Pricing changes

### Homepage `PricingBlock`
- Free card price: `£0` to `A$0`, "forever".
- Pro card price: `£9` to `A$15`, "per month".
- Pro sub: "£89/year, save £19" to "A$149/year, save A$31".
- Free card feature "Certifications and Google reviews" stays; wording stays
  AU-neutral.

### `/pricing` page
- FreeCard: `£0` to `A$0`.
- ProCard: `£9` to `A$15`; "Or £89/year — two months free." to
  "Or A$149/year — save A$31."
- Footnote: "Prices in GBP. VAT included." to "Prices in AUD. GST included."
- "tradesmen" to "tradies" in the FAQ copy.
- Optional: add Free tools link to the footer for consistency.

> Known mismatch accepted: the Pro buttons still trigger GBP Stripe checkout.
> The AUD figures are display-only until AUD Stripe prices are wired up (the
> flagged follow-up). Acceptable pre-launch because Free is the primary CTA and
> there are zero paying customers.

## Metadata (layout.tsx)

- `title`: keep "Mytradelink — Your business. One link." (brand line is market
  neutral).
- `description` and `openGraph.description`: change "wins UK tradesmen jobs" to
  AU intent, e.g. "A professional page that wins Australian tradies more work.
  Set up in 5 minutes." Apply to both the base and `openGraph` copies.

## Verification

- `tsc --noEmit` passes (exit 0), no `any`, no ts-ignore.
- Grep the working tree for stale UK signals and confirm none remain on the
  landing/pricing/layout: `UK`, `Gas Safe`, `NICEIC`, `Part P`, `Manchester`,
  `Leeds`, `Bristol`, `tradesmen`, `£`, `GBP`, `VAT`.
- Load `/` and `/pricing`, eyeball at 375px (mobile) and desktop:
  - Hero, ticker, before/after, how it works, features, free tools, pricing,
    final CTA all render.
  - Free tools links resolve to the two live tool pages.
  - Mobile sticky CTA still present and tappable.
  - AUD prices show on both pages and match (A$15 / A$149).
- Confirm CLAUDE.md rules held: orange-only accent, 16px+ body, 44px+ touch
  targets, mobile first.

## Risks

- **Pricing mismatch** between AUD display and GBP checkout. Mitigated: documented
  as the explicit follow-up; Free is the main path; zero paying users today.
- **Authenticity of AU terms.** Trade slang and state-based licensing are
  approximations; worth a native sanity check before any paid traffic. Licensing
  is state-based, so the page uses generic "licensed" framing rather than a
  single national body.
- **Large file.** `page.tsx` is ~1,200 lines; many string edits. Mitigated by a
  full UK-signal grep in verification.
