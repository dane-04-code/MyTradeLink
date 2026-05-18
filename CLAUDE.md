# CLAUDE.md — Mytradelink
Instructions for Claude Code. Read this before making any changes.

---

## What We're Building
Mytradelink is a digital profile page builder for UK tradesmen. Think Linktree but built for plumbers and electricians. Dead simple. Mobile first. Non-technical users.

Full details in PRD.md. Read it before building anything new.

---

## Tech Stack
- **Framework:** Next.js 14 App Router
- **Database:** Neon (Postgres) via Drizzle ORM
- **Auth:** Clerk
- **File Uploads:** Uploadthing
- **Payments:** Stripe
- **Emails:** Resend
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

---

## Critical Rules — Never Break These

### Design Rules
- **Mobile first always** — every component built for mobile, then desktop
- **Big text, big buttons** — minimum 16px body text, touch targets minimum 44px
- **No jargon** — plain English. "Your page link" not "Public URL slug"
- **Auto save everything** — never add a save button. Save on every change
- **Orange accent only** — #F97316 is the primary accent colour. Don't introduce new colours
- **No complexity** — if it feels complicated to you, it will confuse a plumber

### Code Rules
- **Never break existing functionality** — always check what exists before modifying
- **Keep components small** — one responsibility per component
- **Server components by default** — only use client components when needed (interactivity, hooks)
- **Loading states always** — every async action needs a loading indicator
- **Error states always** — every async action needs an error state
- **TypeScript strict** — no any types, no ts-ignore

### Database Rules
- **Never drop tables** — only add columns, never remove
- **Always use transactions** for multi-step operations
- **Drizzle only** — never write raw SQL unless absolutely necessary
- **Schema is in src/lib/db/schema.ts** — check it before adding anything

### Auth Rules
- **All /dashboard routes are protected** — Clerk middleware handles this
- **Always get userId from Clerk** — never trust client-side user data
- **Public routes:** /, /sign-in, /sign-up, /t/[slug], /pricing, /api/quote/[slug]

---

## Colour Palette
```
Primary background:  #FFFFFF
Dark background:     #0F172A  (landing page only)
Accent orange:       #F97316
Success green:       #22C55E
Error red:           #EF4444
Text primary:        #0F172A
Text secondary:      #64748B
Border:              #E2E8F0
Card background:     #F8FAFC
```

---

## File Structure
```
src/
  app/
    page.tsx                    Landing page
    onboarding/                 5 step wizard
    dashboard/
      page.tsx                  Main dashboard
      dashboard-client.tsx      Client component for toggles/drag
      quotes/                   Quote requests inbox
      billing/                  Stripe billing portal
    t/[slug]/                   Public profile pages
    pricing/                    Pricing page
    sign-in/                    Clerk sign in
    sign-up/                    Clerk sign up
    api/
      quote/                    Public quote submission
      stripe/checkout            Stripe checkout session
      stripe/portal              Stripe customer portal
      uploadthing/               File upload routes
      webhooks/clerk             Clerk webhook handler
      webhooks/stripe            Stripe webhook handler
  lib/
    db/
      schema.ts                 Drizzle schema — source of truth
      index.ts                  DB connection
    auth.ts                     Auth helpers
    queries.ts                  All DB queries
    sections.ts                 Section definitions and defaults
    slug.ts                     Slug generation and validation
    email.ts                    Resend email functions
    stripe.ts                   Stripe helpers
    trades.ts                   Trade types and labels
    utils.ts                    Shared utilities
    uploadthing.ts              Uploadthing config
```

---

## Database Schema Reference

### users
- id, clerk_id, name, trade, phone, whatsapp_number, location
- areas_covered, about, years_experience
- response_time, payment_methods
- availability_status (taking_on_work | fully_booked)
- google_review_url, facebook_url
- plan (free | paid)
- slug (unique)
- created_at, updated_at

### services
- id, user_id, service_name, description, display_order

### photos
- id, user_id, photo_url, caption
- type (profile | gallery | before | after)
- display_order

### certifications
- id, user_id, name, badge_url

### sections
- id, user_id, section_name, is_enabled, display_order

### quote_requests
- id, user_id, customer_name, customer_phone
- job_description, postcode, photo_urls
- status (new | contacted | closed)
- created_at

---

## Section Names (exact strings — never change these)
```
profile_photo
call_button
whatsapp_button
availability_status
about_me
services_list
photo_gallery
before_after_photos
certifications
google_reviews
quote_form          ← PRO ONLY
areas_covered
payment_methods
facebook_link
emergency_callout   ← PRO ONLY
intro_video         ← PRO ONLY
```

---

## User Flows

### New User Flow
1. Signs up via Clerk (/sign-up)
2. Clerk webhook fires → creates user row + seeds default sections
3. Redirected to /onboarding
4. Completes 5 steps → profile live
5. Redirected to /dashboard

### Returning User Flow
1. Signs in via Clerk (/sign-in)
2. If onboarding not complete → redirect to /onboarding
3. Else → redirect to /dashboard

### Upgrade Flow
1. User clicks upgrade in dashboard
2. → /api/stripe/checkout → Stripe checkout
3. Stripe webhook fires → plan updated to paid in DB
4. User redirected back to dashboard — Pro features unlocked

---

## What NOT To Do
- Don't add unnecessary packages — check if we can do it with what we have
- Don't add new pages without checking PRD first
- Don't change the colour palette
- Don't add modals where a simple inline edit works
- Don't make the UI clever — make it obvious
- Don't add features not in the PRD without asking
- Don't use Prisma — we use Drizzle
- Don't use Supabase — we use Neon
- Don't hardcode user IDs or plan types

---

## Environment Variables Required
```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
UPLOADTHING_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_MONTHLY
STRIPE_PRICE_ANNUAL
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL
```

---

## Current Build Status
- [x] Project scaffolded
- [x] Database schema created
- [x] Clerk auth integrated
- [x] Onboarding wizard (5 steps)
- [x] Dashboard with toggles and live preview
- [x] Public profile page (/t/[slug])
- [x] Quote requests inbox
- [x] Billing page
- [x] Stripe checkout and portal
- [x] Uploadthing routes
- [x] Clerk and Stripe webhooks
- [x] Landing page
- [x] Pricing page
- [ ] Keys added to .env.local
- [ ] Schema pushed to Neon
- [ ] First test run locally
- [ ] Deployed to Vercel
