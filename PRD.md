# TradeLink — Product Requirements Document
Version 1.0 | DL Systems

---

## 1. Product Overview

### What is TradeLink?
TradeLink is a smart digital profile page builder built specifically for UK sole trader and small team tradesmen. It gives tradesmen a professional public page in under 5 minutes — one link they share everywhere to win more jobs.

Think Linktree, but built for a plumber not an influencer.

### The Problem
- 85% of tradespeople don't know how to use digital tools effectively
- They can't afford or maintain a full website
- They lose jobs because customers can't quickly verify they're legit
- Their current solution is a messy WhatsApp thread and word of mouth

### The Solution
A dead simple profile builder. Toggle sections on/off. Auto saves. Live preview. Built for someone who is on their phone all day and isn't technical.

### The Value Proposition
"Your business. One link." — A professional page that wins you jobs. Set up in 5 minutes.

---

## 2. Target Users

### Primary User — The Tradesman
- Solo trader or small team (1-5 people)
- UK based
- Trades: Plumber, Electrician, Builder, Landscaper, Painter, Carpenter, Roofer, Gas Fitter, Tiler, Plasterer
- Uses Facebook and WhatsApp daily
- On their phone all day, rarely on a laptop
- Not technical — needs everything to be dead obvious
- Earns £60,000-£110,000+ annually — £9/month is nothing to them
- Wins work through word of mouth and referrals

### Secondary User — The Homeowner (views public profile)
- Searching for a reliable local tradesman
- Wants to verify legitimacy quickly
- Wants easy contact — call or WhatsApp
- Wants to see past work and reviews
- Makes decision in under 30 seconds

---

## 3. Business Model

| Plan | Price | Features |
|------|-------|----------|
| Free | £0/month | Core profile sections, TradeLink watermark footer |
| Pro | £9/month or £89/year | No watermark, quote form with photo upload, emergency callout button, intro video |

### Watermark Strategy
Free plan pages show a small footer: "Powered by TradeLink — Get your free page"
This is the primary marketing engine. Every customer who views a tradesman's page becomes a potential new user.

### Revenue Targets
- Month 1 — First paying customer
- Month 3 — £500 MRR
- Month 6 — £1,000 MRR
- Month 12 — £2,500 MRR

---

## 4. Core Features

### 4.1 Onboarding (5 Step Wizard)
Dead simple. One screen per step. Big text. Big buttons.

**Step 1 — Who are you?**
- Full name (required)
- Trade (required) — dropdown: Plumber, Electrician, Builder, Landscaper, Painter, Carpenter, Roofer, Gas Fitter, Tiler, Plasterer, Other

**Step 2 — How do customers reach you?**
- Phone number (required)
- WhatsApp number (optional — defaults to phone if blank)
- Town/City (required)

**Step 3 — Put a face to the name**
- Profile photo upload (optional but strongly encouraged)
- Helper text: "Tradesmen with a photo get 3x more enquiries"

**Step 4 — Tell them about yourself**
- About me text area (optional)
- Placeholder: "Been a plumber for 15 years. Based in Manchester. No job too small."
- 280 character limit — keep it simple

**Step 5 — You're live!**
- Show their public profile link
- Big copy button
- Share to WhatsApp button
- Share to Facebook button
- "Go to my dashboard" button

### 4.2 Dashboard
Split view on desktop. Single column on mobile.

**Left panel — Section Manager**
List of all available sections as cards. Each card has:
- Toggle on/off (auto saves instantly)
- Drag handle to reorder
- Edit button to manage content
- Lock icon on paid-only sections with upgrade prompt

**Right panel — Live Preview**
Real time preview of their public profile page as it will appear to customers. Updates instantly as they toggle sections.

**Top bar**
- Their public link with copy button
- Preview on phone button
- Upgrade to Pro button (free users only)

### 4.3 Profile Sections (Toggleable)

**Free Sections**
| Section | Description |
|---------|-------------|
| Profile Photo | Their face or logo |
| Call Button | Green, full width, tappable |
| WhatsApp Button | Green, full width, opens WhatsApp chat |
| Availability Status | Toggle: Taking on work / Fully booked |
| About Me | 2-3 sentence bio |
| Services List | List of services they offer with optional descriptions |
| Photo Gallery | Job photos, swipeable on mobile |
| Before & After Photos | Side by side comparison photos |
| Certifications & Badges | Gas Safe, NICEIC, CSCS, etc |
| Google Reviews Link | Link to their Google profile with star rating display |
| Areas Covered | List of towns/postcodes they work in |
| Payment Methods | Cash, Bank Transfer, Card, etc |
| Facebook Link | Link to their Facebook page |

**Pro Only Sections**
| Section | Description |
|---------|-------------|
| Quote Request Form | Name, phone, job description, postcode, photo upload |
| Emergency Callout Button | Red button with premium callout messaging |
| Intro Video | Short video introduction — embed or upload |

### 4.4 Public Profile Page (/t/[slug])
- Mobile first — 90% of views will be on a phone
- Renders only enabled sections in the order set in dashboard
- No login required to view
- Loads fast — no heavy assets
- Clean, professional design — white background, orange accents
- Free plan: small footer watermark
- Pro plan: no watermark

**Page hierarchy:**
1. Profile photo + Name + Trade + Location
2. Trust badges (certifications)
3. Call button + WhatsApp button (massive, impossible to miss)
4. Availability status badge
5. About me
6. Services list
7. Photo gallery / Before & After
8. Google reviews link
9. Quote request form (Pro)
10. Areas covered
11. Payment methods
12. Facebook link
13. Footer watermark (Free only)

### 4.5 Quote Requests (/dashboard/quotes)
- List of all incoming quote requests
- Each shows: customer name, phone, job description, postcode, photos, date received
- Status: New → Contacted → Closed
- Email notification sent to tradesman on new request
- Only available to Pro users

### 4.6 Billing (/dashboard/billing)
- Shows current plan
- Upgrade/downgrade options
- Stripe customer portal for card management
- Annual vs monthly toggle

---

## 5. Design Principles

### For the Dashboard (Tradesman facing)
- **Mobile first** — they're on their phone
- **Big text, big buttons** — nothing small or fiddly
- **No jargon** — plain English everywhere
- **Auto save** — never show a save button, just save it
- **Instant feedback** — every action has immediate visual confirmation
- **Dark orange (#F97316) accent** — bold, trades feeling, professional

### For the Public Profile (Homeowner facing)
- **Fast loading** — under 2 seconds
- **Trust first** — certifications and photo above the fold
- **One tap contact** — call and WhatsApp impossible to miss
- **Clean and professional** — makes the tradesman look legit
- **Mobile optimised** — full width buttons, swipeable gallery

### Colour Palette
- Primary background: #FFFFFF
- Dark background (landing): #0F172A
- Accent orange: #F97316
- Success green: #22C55E
- Text primary: #0F172A
- Text secondary: #64748B
- Border: #E2E8F0

---

## 6. Technical Requirements

### Stack
- Next.js 14 (App Router)
- Neon (Postgres database)
- Drizzle ORM
- Clerk (authentication)
- Uploadthing (file uploads)
- Stripe (payments)
- Resend (emails)
- Vercel (hosting)

### Performance
- Public profile pages must load in under 2 seconds
- Images must be optimised and lazy loaded
- No auth required to view public profiles

### Security
- All dashboard routes protected by Clerk middleware
- API routes validate Clerk session
- Quote form has rate limiting to prevent spam
- Stripe webhooks validated with secret

### SEO
- Public profile pages are server rendered for SEO
- Meta title: "[Name] — [Trade] in [Location] | TradeLink"
- Meta description auto generated from their about section
- OG image generated from profile

---

## 7. Email Notifications

### Welcome Email (on signup)
- Subject: "Your TradeLink page is live 🎉"
- Their public link
- 3 tips to get their first enquiry
- Link to dashboard

### New Quote Request (Pro users)
- Subject: "New quote request from [Customer Name]"
- Customer details
- Job description
- Link to view in dashboard

---

## 8. Slug System
- Auto generated from their name on signup (e.g. "john-smith-plumbing")
- Editable from dashboard
- Must be unique — validation on save
- URL format: tradelink.co.uk/t/[slug]

---

## 9. Pages Summary

| Route | Description | Auth Required |
|-------|-------------|---------------|
| / | Landing page | No |
| /sign-up | Clerk signup | No |
| /sign-in | Clerk signin | No |
| /onboarding | 5 step wizard | Yes |
| /dashboard | Main dashboard | Yes |
| /dashboard/quotes | Quote requests | Yes (Pro) |
| /dashboard/billing | Billing management | Yes |
| /t/[slug] | Public profile | No |
| /pricing | Pricing page | No |

---

## 10. Out of Scope (V1)
- Directory/search for homeowners to find tradesmen
- Mobile app
- Team accounts
- Analytics dashboard
- Automated review requests
- Invoice generation
- Job scheduling
