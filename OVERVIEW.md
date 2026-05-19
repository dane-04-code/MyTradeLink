# Mytradelink — Full App Overview

Feed this to any AI agent to give it a complete picture of the product. Pair with `CLAUDE.md` (instructions), `PRD.md` (product spec), `USER-FLOWS.md` (user journeys), and `BRAND.md` (visual/voice).

---

## 1. What it is

Mytradelink is a digital profile page builder for UK tradesmen — Linktree, but built for plumbers, electricians, builders and their peers. A tradesman signs up, runs a 5-step onboarding wizard, and gets a public page at `mytradelink.page/t/<slug>` they share everywhere (van, WhatsApp bio, Facebook, business cards). The page has tap-to-call, WhatsApp, photo gallery, certifications, Google reviews stars, services list, and optionally a quote request form.

**One-line:** "Your business. One link."

---

## 2. Audience & business model

### Tradesman (primary user)
- UK sole trader or small team (1–5 people)
- Trades: Plumber, Electrician, Builder, Painter & Decorator, Carpenter, Roofer, Plasterer, Tiler, Gas Engineer, Heating Engineer, Bricklayer, Landscaper, Gardener, Tree Surgeon, Fencer, Driveway/Paving, Kitchen Fitter, Bathroom Fitter, Locksmith, Glazier, Cleaner, Window Cleaner, Drainage, Damp Proofing, Aerial Installer, Solar/EV Installer, Pest Control, AC Engineer, Scaffolder, Handyman, Removals, Stonemason, Other (32 + Other in `src/lib/trades.ts`)
- Phone-first; rarely on laptops
- Wins work by word-of-mouth + WhatsApp

### Homeowner (page viewer)
- Searches for a local tradesman, wants to verify legitimacy fast, decides in 30 seconds
- 90% of page views are mobile

### Plans
| Plan | Price | Features |
|---|---|---|
| Free | £0 forever | All core sections + Mytradelink badge in footer |
| Pro | £9/mo or £89/yr | Quote request form (with photo upload), emergency callout, intro video, removes the badge |

Watermark in the free-plan footer = primary marketing channel.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, RSC) |
| Database | Neon Postgres (serverless, HTTP driver via `@neondatabase/serverless`) |
| ORM | Drizzle (`drizzle-orm` + `drizzle-kit`) |
| Auth | Clerk |
| File uploads | Uploadthing |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Email | Resend |
| QR codes | `qrcode` npm package, generated client-side |
| Hosting | Vercel (not yet deployed) |
| Styling | Tailwind CSS with custom theme (`tailwind.config.ts`) |
| Fonts | Archivo Black (display) + Plus Jakarta Sans (body), both via `next/font/google` |
| Icons | `lucide-react` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Forms | React Hook Form + Zod (validation), Sonner (toasts) |
| OG images | `next/og` (Satori SVG renderer), edge runtime |

---

## 4. File structure (annotated)

```
src/
  app/
    page.tsx                  Landing page — dark navy with blueprint grid, Archivo Black hero, URL chip
    layout.tsx                Root layout — Clerk provider, fonts, viewport, toaster
    globals.css               Tailwind base + component classes (.btn-primary, .input, .card)
    sign-in/[[...sign-in]]/   Clerk sign-in catch-all
    sign-up/[[...sign-up]]/   Clerk sign-up catch-all
    pricing/
      page.tsx                Pricing page — feature comparison + FAQ
      pricing-buttons.tsx     Monthly/annual toggle + checkout CTA (client)
    onboarding/
      page.tsx                Server — requireUser + redirect if onboarded
      wizard.tsx              Client — 5-step wizard (business name + trade / contact / photo / about / live)
      actions.ts              Server actions: saveStep1-4, regenerateSlug
    dashboard/
      layout.tsx              Server — requireOnboardedUser, sticky header with Page/Quotes/Analytics/Billing nav
      page.tsx                Server — getFullProfile, mount DashboardClient
      dashboard-client.tsx    THE BIG ONE (1100+ lines) — grouped accordion editor, theme picker, QR code, live preview
      qr-button.tsx           QR code dialog (qrcode lib, PNG download)
      actions.ts              Server actions: toggleSection, reorderSections, updateProfile, updateSlug, CRUD for services/photos/certs
      quotes/
        page.tsx              Server — list quote_requests for user
        quotes-list.tsx       Filter tabs, NEW pill, call/whatsapp actions, mark contacted/closed
        actions.ts            markQuoteStatus server action
      analytics/
        page.tsx              Server (Pro only) — "Weekly worksheet" stat cards + 14-day bars + referrer breakdown
      billing/
        page.tsx              Server — show current plan, Pro upsell or Stripe portal CTA
        billing-actions.tsx   Open Stripe customer portal (client)
    dashboard-demo/
      page.tsx                Unauth clone of /dashboard mounted with DEMO_PROFILE for previewing
    t/[slug]/
      page.tsx                Server — public profile (no auth), short-circuits to DEMO_PROFILE for slug='demo'
      not-found.tsx           Branded 404 with signup CTA
    api/
      uploadthing/             Uploadthing route handlers (5 endpoints: profilePhoto, banner, gallery, certification, quotePhotos)
      quote/[slug]/route.ts   Public POST quote submission (rate-limited, Pro-only gate, honeypot field, emails tradesman)
      event/route.ts          Public POST analytics events (view, call_click, whatsapp_click, quote_open, quote_submit, social_click)
      og/[slug]/route.tsx     Edge runtime — 1200x630 OpenGraph image generated per profile via next/og
      stripe/checkout         Create Stripe Checkout session
      stripe/portal           Open Stripe customer portal
      webhooks/clerk          User created/deleted → seed/cascade DB
      webhooks/stripe         Plan flip on subscription events
  components/
    public-profile.tsx        Renders the public page — 19 section types, banner pinned to top, sticky mobile contact bar
    sticky-contact-bar.tsx    Mobile-only fixed-bottom Call + WhatsApp bar that slides in past scrollY 480
  lib/
    db/
      index.ts                Neon client + Drizzle instance, Proxy for lazy connection
      schema.ts               7 tables (users, services, photos, certifications, sections, quote_requests, page_events)
    auth.ts                   getOrCreateUser (lazy seed if Clerk webhook missed), requireUser, requireOnboardedUser
    queries.ts                getProfileBySlug, getFullProfile, FullProfile type
    sections.ts               19 SectionDefs + 6 groups + default-enabled list
    themes.ts                 5 preset accents + custom hex validation
    trades.ts                 32 UK trades + Other
    structured-data.ts        LocalBusiness JSON-LD schema generator
    slug.ts                   slugify + uniqueSlug (suffix-on-collision)
    email.ts                  Welcome + new-quote Resend wrappers (no-op if RESEND_API_KEY missing)
    stripe.ts                 Stripe client + price IDs
    uploadthing.ts            UploadButton component re-export
    rate-limit.ts             In-memory fixed-window rate limiter + clientIp helper
    analytics.ts              getEventCounts, getSparkline (per-day), getReferrerBreakdown (bucketed)
    tracker.ts                Fire-and-forget client-side event sender (sendBeacon + fetch keepalive fallback)
    demo-profile.ts           Hardcoded FullProfile for /t/demo and /dashboard-demo
    utils.ts                  cn() class merger
  middleware.ts               Clerk middleware — protects /onboarding, /dashboard, /api/me (NOT /dashboard-demo)
drizzle/                      Generated migration SQL files (tracked in git)
```

---

## 5. Database schema

### `users`
Core profile, one row per Clerk-authenticated tradesman.
```
id, clerk_id (unique), email, name, trade, phone, whatsapp_number,
location, areas_covered, about (max 280 chars), years_experience,
response_time, payment_methods, availability_status (taking_on_work | fully_booked),
google_review_url, google_rating (real 0-5), google_review_count (int),
facebook_url, instagram_url, tiktok_url,
intro_video_url, emergency_number, profile_photo_url, banner_image_url,
accent_color (hex, default #F97316), plan (free | paid), slug (unique),
stripe_customer_id, stripe_subscription_id,
onboarding_complete, created_at, updated_at
```

### `services`
N services per user, with descriptions and drag-reorder.
```
id, user_id (FK cascade), service_name, description, display_order, created_at
```

### `photos`
Gallery + before/after pairs.
```
id, user_id (FK cascade), photo_url, caption,
type (profile | gallery | before | after), pair_id (link before to after),
display_order, created_at
```

### `certifications`
Trust badges — Gas Safe, NICEIC, CSCS, etc.
```
id, user_id (FK cascade), name, badge_url, display_order, created_at
```

### `sections`
Which sections the user has enabled and in what order.
```
id, user_id (FK cascade), section_key, is_enabled, display_order
UNIQUE (user_id, section_key)
```

### `quote_requests`
Customer-submitted leads via the Pro-only quote form.
```
id, user_id (FK cascade), customer_name, customer_phone, job_description,
postcode, photo_urls (jsonb array), status (new | contacted | closed), created_at
```

### `page_events`
Anonymous (IP-hashed) analytics for Pro users.
```
id, user_id (FK cascade), event_type (view | call_click | whatsapp_click | quote_open | quote_submit | social_click),
ip_hash (sha256, 32 chars), referrer (varchar 255), created_at
INDEX (user_id, created_at desc), (user_id, event_type)
```

---

## 6. Section system

Every tradesman page is composed of 19 toggleable, reorderable sections. Each section is defined in `src/lib/sections.ts` with a key, label, description, and optional `paidOnly` flag.

### Sections (`SectionKey` values)
| Key | Group | Pro-only |
|---|---|---|
| `banner_image` | Identity | – |
| `profile_photo` | Identity | – |
| `availability_status` | Identity | – |
| `call_button` | Contact | – |
| `whatsapp_button` | Contact | – |
| `emergency_callout` | Contact | ✔ |
| `about_me` | Trust | – |
| `certifications` | Trust | – |
| `google_reviews` | Trust | – |
| `services_list` | Show your work | – |
| `photo_gallery` | Show your work | – |
| `before_after_photos` | Show your work | – |
| `intro_video` | Show your work | ✔ |
| `quote_form` | Capture leads | ✔ |
| `facebook_link` | Social & links | – |
| `instagram_link` | Social & links | – |
| `tiktok_link` | Social & links | – |
| `areas_covered` | Social & links | – |
| `payment_methods` | Social & links | – |

### Special render rules
- `banner_image` is **always rendered first** on the public page if enabled, regardless of DB `display_order`. It's a hero element by nature.
- Pro-only sections render as `null` for free-plan users (server-side gate, also enforced in API endpoints).
- `quote_form` rejects POSTs from non-paid users at the API level too.

### Default-enabled sections (seeded on signup)
profile_photo, call_button, whatsapp_button, availability_status, about_me, services_list, photo_gallery, certifications, areas_covered.

---

## 7. Theme system

Per-user `accent_color` (hex), chosen in the dashboard from 5 presets or a custom hex picker. The value sets a CSS variable `--accent` on the public profile container, which all section components reference. Call/WhatsApp colours are functional (never themed). Quote-form submit button uses the user's accent.

Presets: Builder (`#F97316`), Grass (`#16A34A`), Hi-vis (`#EAB308`), Sparky (`#2563EB`), Brick (`#DC2626`).

---

## 8. Authentication

Clerk handles sign-in/sign-up. The middleware protects `/onboarding`, `/dashboard/*`, `/api/me/*`.

Two-step auth flow:
1. **Clerk webhook (preferred)** — on `user.created`, creates a `users` row and seeds 19 `sections` rows. Sends welcome email via Resend.
2. **Lazy fallback (`getOrCreateUser` in `lib/auth.ts`)** — if the webhook missed (local dev without ngrok, for example), the first visit to `/dashboard` creates the row + seeds sections inline. Same effect, just no welcome email.

`requireOnboardedUser` additionally redirects to `/onboarding` if `onboarding_complete = false`.

`/dashboard-demo` bypasses auth entirely; it mounts `DashboardClient` with `DEMO_PROFILE`. Server actions are short-circuited inside `dashboard-client.tsx` when `window.location.pathname` starts with `/dashboard-demo` — so toggles/drags/edits update local state but don't round-trip.

---

## 9. Analytics

Pro-only. Anonymous (IP-hashed, no cookies). Fired client-side via `lib/tracker.ts` using `navigator.sendBeacon` (so events survive `tel:` navigation), with a `fetch` keepalive fallback.

Events: `view` (on mount of `/t/<slug>`), `call_click`, `whatsapp_click`, `quote_open`, `quote_submit`, `social_click`.

Rate-limited at 60 events/IP/hour at the API endpoint (`/api/event`).

Aggregations in `lib/analytics.ts`: `getEventCounts(userId, days)`, `getSparkline(userId, eventType, days)`, `getReferrerBreakdown(userId, days)` (bucketed: Direct / WhatsApp / Facebook / Instagram / TikTok / Google / Other).

Dashboard renders as a "Weekly worksheet" — one big hero metric (page views) with a 14-day vertical bar chart, three smaller secondary stats with 7-day mini-bars, then a traffic-source breakdown with ink-900 bars.

---

## 10. Routes (annotated)

| Route | Public? | What |
|---|---|---|
| `/` | ✔ | Landing — hero + before/after + how it works + features + pricing + CTA |
| `/pricing` | ✔ | Pricing — free vs Pro, monthly/annual toggle, feature comparison, FAQ |
| `/sign-in` | ✔ | Clerk sign-in catch-all |
| `/sign-up` | ✔ | Clerk sign-up catch-all |
| `/t/[slug]` | ✔ | Public profile (slug=`demo` uses hardcoded data) |
| `/t/[slug]/not-found` | ✔ | Branded 404 with signup CTA |
| `/dashboard-demo` | ✔ | Demo dashboard with hardcoded profile, no auth |
| `/onboarding` | Auth | 5-step wizard |
| `/dashboard` | Auth | Page builder + live preview |
| `/dashboard/quotes` | Auth | Quote inbox (free shows Pro upsell) |
| `/dashboard/analytics` | Auth | Analytics worksheet (Pro only, else upsell) |
| `/dashboard/billing` | Auth | Plan + Stripe portal |
| `/api/quote/[slug]` | ✔ POST | Public quote submission (rate-limited, Pro-only gate, honeypot) |
| `/api/event` | ✔ POST | Public analytics event (rate-limited) |
| `/api/og/[slug]` | ✔ | Edge runtime, returns 1200×630 OG image PNG |
| `/api/uploadthing` | Auth-gated middleware | File uploads |
| `/api/stripe/checkout` | Auth | Create checkout session |
| `/api/stripe/portal` | Auth | Open customer portal |
| `/api/webhooks/clerk` | ✔ | Clerk → DB sync (svix-verified) |
| `/api/webhooks/stripe` | ✔ | Stripe → plan flip (signature-verified) |
| `/admin` | Gated by ADMIN_EMAIL | Operator dashboard — signups, MRR, activation, recent activity (returns 404 for everyone else) |

---

## 11. Required environment variables

```
DATABASE_URL                            # Neon Postgres pooled connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY       # Clerk
CLERK_SECRET_KEY                        # Clerk
CLERK_WEBHOOK_SECRET                    # Clerk webhook svix verification
UPLOADTHING_TOKEN                       # Uploadthing base64 token
STRIPE_SECRET_KEY                       # Stripe API
STRIPE_WEBHOOK_SECRET                   # Stripe webhook signature
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY      # Stripe client
STRIPE_PRICE_MONTHLY                    # Stripe price ID for £9/mo
STRIPE_PRICE_ANNUAL                     # Stripe price ID for £89/yr
RESEND_API_KEY                          # Resend (optional — no-op if missing)
RESEND_FROM_EMAIL                       # e.g. "Mytradelink <hello@mytradelink.page>"
NEXT_PUBLIC_APP_URL                     # Canonical URL, e.g. https://mytradelink.page
IP_HASH_SALT                            # Optional — analytics IP hash salt (default: "tradelink")
ADMIN_EMAIL                             # Comma-separated emails allowed to access /admin (operator dashboard)
```

---

## 12. Conventions to follow

(Also in `CLAUDE.md`.)

- **Mobile-first**: 90% of public-page views are phone. Test mobile first.
- **No save buttons anywhere** — every edit auto-saves with optimistic UI + revert-on-error.
- **Plain English** — no "Public URL slug", say "Your page link". No "users", say "you".
- **Server components by default**, client components only when interactive.
- **Drizzle only** — never raw SQL unless absolutely necessary.
- **Never drop tables** — only add columns. Migrations in `drizzle/`.
- **Section keys are sacred** — the strings in `SectionKey` are referenced everywhere. Don't rename.
- **Auto-save debounce** — `FieldEditor` uses a 500ms debounce. Match the pattern.
- **Rate-limit anything public** — `/api/quote/[slug]` and `/api/event` use `lib/rate-limit.ts`.

---

## 13. Current build status (2026-05-18)

**Done**
- Landing, pricing, sign-in, sign-up pages (PRD §9)
- 5-step onboarding wizard with share-to-WhatsApp/Facebook on step 5
- Dashboard with grouped accordion, theme picker, banner upload, QR code, mobile Edit/Preview tabs, live phone preview
- Public profile renderer with 19 sections, sticky mobile contact bar, banner-pins-to-top, ActionButton design system
- Quote inbox with filter tabs, status flow, copy-number, WhatsApp shortcut, free-plan upsell
- Billing page with plan card, feature breakdown, Stripe portal button
- Analytics page (Pro) — "Weekly worksheet" with 14-day vertical bar chart, traffic sources, empty state
- Pro-only gating wired throughout (UI + API)
- LocalBusiness JSON-LD on public profile
- Dynamic OG image generation per profile (`/api/og/[slug]`)
- IP-rate-limited quote endpoint with honeypot + 3/hr/IP cap
- Anonymous (IP-hashed) analytics tracking from public profile to `/api/event`
- Demo route `/dashboard-demo` for unauth previewing
- All schema columns + section keys + section groupings settled
- Drizzle migrations in `drizzle/0000_*`, `0001_add_page_events.sql`, `0002_add_google_rating.sql`
- Clerk-only auth with lazy fallback if webhook missed
- Neon DB live, schema pushed
- Uploadthing wired with real token (uploads functional)

**Not yet done**
- Vercel deployment (env vars + custom domain)
- Stripe price IDs not yet created in real Stripe account
- Resend API key not wired (welcome + quote emails silently no-op)
- Empty-state polish in editors (services, photos, certifications when count = 0)
- Email template aesthetics (welcome + new quote use minimal inline-style HTML, could be richer)
- Business hours / auto-availability flip (suggested but not built)
- Customer testimonials section (suggested but not built)
- Company logo as separate field from profile photo (suggested but not built)
- Google Places API auto-sync for review rating (declined — manual entry only for v1)

**Known constraints**
- Safari development mode breaks due to its Trusted Types / CSP enforcement on inline scripts; works fine in built mode and in Chrome/Firefox dev. Use Chrome for local dev.
- Uploadthing region is `sea1` (Singapore) on the free tier; first UK viewer cold-cache hit is ~250ms slower until edge cache warms. Fine for v1.
- Dev-only auto-create of user rows (`getOrCreateUser`) skips the welcome email — that's only sent via the Clerk webhook in prod.

---

## 14. Where to find things in code (quick lookup)

| Looking for… | File |
|---|---|
| The big dashboard editor | `src/app/dashboard/dashboard-client.tsx` |
| Public profile renderer | `src/components/public-profile.tsx` |
| Section definitions | `src/lib/sections.ts` |
| Theme presets | `src/lib/themes.ts` |
| Demo profile (Dave Wilson Plumbing) | `src/lib/demo-profile.ts` |
| All DB queries | `src/lib/queries.ts`, `src/app/**/actions.ts` |
| Schema | `src/lib/db/schema.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Analytics queries | `src/lib/analytics.ts` |
| Event tracking (client) | `src/lib/tracker.ts` |
| Rate limiter | `src/lib/rate-limit.ts` |
| Tailwind config (brand colours, fonts) | `tailwind.config.ts` |
| Drizzle config | `drizzle.config.ts` |

---

## 15. How to extend (cheat sheet)

### Add a new section
1. Add the key to `SectionKey` union in `src/lib/sections.ts`
2. Add a `SectionDef` entry (label, description, optional `paidOnly`)
3. Add the key to the appropriate `SECTION_GROUPS` array
4. Add a case in `PublicProfile`'s switch in `src/components/public-profile.tsx`
5. Add a case in `SectionDetail`'s switch in `src/app/dashboard/dashboard-client.tsx`
6. If it needs new DB columns: edit `schema.ts`, `drizzle-kit generate --name`, `db:push`
7. If it needs an upload endpoint: add to `src/app/api/uploadthing/core.ts`
8. Add to `DEMO_PROFILE` and `DEMO_PROFILE.sections` so `/t/demo` shows it

### Add a new analytics event
1. Add to the `eventTypeEnum` in `src/lib/db/schema.ts`
2. Add to the `TrackEventType` union in `src/lib/tracker.ts`
3. Add to the schema validation in `src/app/api/event/route.ts`
4. Call `trackEvent(slug, "new_event")` from the relevant component
5. Add to the stats query in `src/lib/analytics.ts` if displaying on the analytics page

### Add a new theme preset
1. Add a `Theme` entry to `THEME_PRESETS` in `src/lib/themes.ts`
2. That's it — the dashboard picker reads from this list

---

## 16. Reference docs

- `CLAUDE.md` — instructions for Claude (or any AI agent) when modifying this codebase. Critical rules.
- `PRD.md` — Product Requirements Document v1.
- `USER-FLOWS.md` — Detailed user journey diagrams.
- `BRAND.md` — Brand and style guide for marketing.
- `README.md` — Setup instructions.
