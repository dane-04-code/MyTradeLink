# TradeLink

A smart digital profile page builder for UK tradesmen. Think Linktree for plumbers, electricians, builders, landscapers, etc.

## Stack
- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- Neon Postgres + Drizzle ORM
- Clerk (auth)
- Uploadthing (image uploads)
- Stripe (subscriptions)
- Resend (transactional email)

## Project layout
```
src/
  app/
    page.tsx                     Landing page
    onboarding/                  5-step wizard
    dashboard/                   Editor + live preview + quotes + billing
    t/[slug]/                    Public profile page
    pricing/                     Pricing page
    api/
      uploadthing/               Uploadthing route handlers
      quote/                     Public quote-form endpoint
      stripe/checkout            Create Stripe Checkout sessions
      stripe/portal              Open Stripe billing portal
      webhooks/clerk             Sync new users to DB + welcome email
      webhooks/stripe            Flip plan to paid/free on subscription events
    sign-in/, sign-up/           Clerk pages
  components/public-profile.tsx  Mobile-first profile renderer
  lib/
    db/                          Drizzle schema + client
    auth.ts                      requireUser / requireOnboardedUser
    queries.ts                   getProfileBySlug etc.
    sections.ts                  Section catalog
    email.ts                     Resend helpers
    stripe.ts                    Stripe client + price IDs
    slug.ts                      slugify + uniqueSlug
    trades.ts                    Allowed trades list
```

## Setup

1. Copy env: `cp .env.example .env.local` and fill in keys.
2. Run a Postgres migration:
   ```
   npm run db:push
   ```
3. Configure webhooks:
   - **Clerk** → `/api/webhooks/clerk` (subscribe to `user.created`, `user.deleted`)
   - **Stripe** → `/api/webhooks/stripe` (subscribe to `checkout.session.completed`, `customer.subscription.*`)
4. Configure Uploadthing app and paste `UPLOADTHING_TOKEN`.
5. Create two Stripe prices and put the IDs in `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_ANNUAL`.
6. Set `NEXT_PUBLIC_APP_URL` to your deploy URL.
7. Dev:
   ```
   npm run dev
   ```

## Notes
- Public profile pages (`/t/[slug]`) have no auth requirement and load fast.
- Paid plan unlocks: quote form photos, emergency button, intro video, removes TradeLink footer.
- Sections auto-save on toggle / reorder / edit (no save button).
- Free plan still gets a fully working quote form (without photo attachments).
