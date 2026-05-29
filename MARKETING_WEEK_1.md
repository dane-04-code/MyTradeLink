# Mytradelink — Week 1 Marketing Plan

**Goal:** Get the first 30–50 UK tradesmen onto Mytradelink and have 10+ real conversations with them. Feedback is the deliverable. Revenue is not.

**Audience — two segments, UK-wide:**

| Segment | Who | Buyer | How they buy |
|---|---|---|---|
| **Solo tradesmen** | 1-person plumbers, sparks, gas engineers, builders, decorators | The tradesman himself, on his phone, between jobs | Emotional + immediate. WhatsApp / FB DM / TikTok. Decides in 5 min. |
| **Small/medium firms** | 2–50 staff. Multi-van plumbing/electrical/heating/building firms | MD, office manager, or marketing person | Considered. Email, LinkedIn DM, trade press. Decides in days/weeks. |

Both live on **Facebook groups** and **WhatsApp**. Only the medium firms touch LinkedIn or read trade press. Don't waste effort sending solos LinkedIn invites — they won't see them.

> **Product gap to resolve before scaling firms:** Mytradelink is one-user-one-page. A 10-engineer firm naturally wants 10 pages under one billing account (a team feature). For Week 1, pitch firms on a *single company profile* (their MD or main number as the contact) and log demand for the multi-user version. If 5+ firms ask for it this week, that's your Week 2 build.

---

## Week 1 Targets

| Metric | Target |
|---|---|
| Sign-ups (solo + firm combined) | 30–50 |
| Solo tradesmen signed up | 25–40 |
| Firms signed up | 5–10 |
| Onboarding completion | ≥ 60% |
| Published profiles | 20+ |
| Feedback calls (15 min) | 10+ (mix of both segments) |
| Qualitative friction points logged | Top 3 per segment |
| Firms asking for multi-user / team feature | Counted — informs Week 2 build |
| Pro upgrades | 0 expected — don't optimise for this |
| Public testimonials / before-after screenshots | 3–5 |

---

## Strategy in One Line

**Manually sign up the first 50 yourself.** Concierge onboarding in exchange for a 15-min feedback call. Then mine those calls for the messaging that lets the next 500 sign themselves up.

This is Idea #47 (founder-led sales) + #15 (engineering as marketing — the product *is* the lead magnet) + #110 (do things that don't scale).

---

## Pre-Week Setup (Sunday before — 2 hrs)

Things to have ready before Monday:

- [ ] **Demo profile live.** Pick a fake but realistic plumber, e.g. `mytradelink.page/dave-the-plumber-leeds`. Fully populated. This is the link you send every prospect.
- [ ] **Feedback form** — Tally or Google Form. 5 questions max. "What confused you? What's missing? Would you pay £X? Would you recommend it?"
- [ ] **Cal.com 15-min slot** — labelled "Mytradelink feedback chat — free Pro for life if you do this."
- [ ] **PostHog or Vercel Analytics** wired up. Track: sign-up, onboarding step drop-off, profile publish, quote request.
- [ ] **Free Pro coupon code** in Stripe — `FEEDBACK50` — 100% off, capped at 50 redemptions.
- [ ] **Prospect list — 300 total, UK-wide:**
  - **200 solo tradesmen** from Checkatrade, Rated People, MyBuilder, Gas Safe Register, NICEIC. Mix of trades (plumbers, sparks, gas, builders, decorators) and regions (London, Manchester, Birmingham, Leeds, Glasgow, Bristol, Belfast — spread so you learn what travels).
  - **100 small/medium firms** (2–50 staff) from Companies House (filter SIC codes 43210 electrical, 43220 plumbing/heating, 41202 construction), trade association directories (NICEIC, Gas Safe, FMB, NAPIT, ECA), and LinkedIn search. Pull MD/owner name + company email.
- [ ] **Two outreach scripts** (see below) — one for solos (WhatsApp tone), one for firms (email tone).
- [ ] **3 short-form video hooks shot** on phone — talking head, vertical, 15–30s. "If you're a UK plumber, I'll build you a free page like this in 60 seconds." Show demo profile on screen.

---

## Day-by-Day

### Monday — Foundation + first 20 DMs

**Morning (2 hrs)**
- Finalise demo profile + screenshots
- Finalise outreach script (3 variants: WhatsApp, Facebook DM, email)
- Set up tracking links (use UTM tags: `?utm_source=fb_group&utm_campaign=week1`)

**Afternoon (3 hrs)**
- **Solo tradesmen (20 messages):** 10 Facebook DM, 5 WhatsApp (numbers from Checkatrade), 5 email.
- **Firms (10 emails):** Personalised emails to MDs/owners — different tone, different value prop (see firm script below).
- Post in **2 UK-wide trade Facebook groups** (soft post — see template below). DO NOT spam. Read group rules first. Good groups: "UK Tradesmen", "Plumbers Chat UK", "Electricians UK", "UK Builders Network".
- Post on **PlumbersForums.co.uk** — "I built a free tool, would value blunt feedback" thread

**Evening**
- Reply to anyone who responded
- Book any feedback calls into the diary

**Solo outreach script (WhatsApp — copy/paste, then personalise):**
> Hi [Name], saw your work on Checkatrade — your bathroom photos are sharp.
>
> I'm a UK lad who just built a tool called Mytradelink. It's a one-link profile page for tradesmen — like a digital version of the van wrap + business card combined. Customers click your number, WhatsApp, or request a quote, all from one page.
>
> Here's an example: mytradelink.page/dave-the-plumber-leeds
>
> I'm giving the first 50 tradesmen free Pro for life in exchange for an honest 15-min chat about what's missing. No catch, no sales call.
>
> Want me to build yours for you? Send me 3 job photos and your number — I'll do it tonight, you check it in the morning.

**Firm outreach script (email — to MD / owner / office manager):**

> Subject: A free quote-capture page for [Company name]
>
> Hi [Name],
>
> I run Mytradelink — a one-link profile page that captures phone calls, WhatsApp messages and quote requests for trades businesses. Think a much simpler, mobile-first version of your website's contact page, designed for customers to use in 10 seconds on their phone.
>
> Example: mytradelink.page/dave-the-plumber-leeds
>
> I'm offering the first 20 UK trades firms a free Pro account for 12 months in exchange for a 15-min feedback call. Two things I'm specifically trying to learn:
>
> 1. Whether firms like yours want one company profile or one-per-engineer (currently it's one-per-account — I'm logging demand for a team version).
> 2. What you'd actually pay for it if it brought in even one extra job a month.
>
> Worth 15 minutes? Reply with a time that suits, or grab a slot here: [Cal.com link].
>
> Cheers,
> [Your name]

---

### Tuesday — White-glove builds

For every tradesman who said yes:
- **You build their profile manually** from photos + the 10-min phone call. Don't make them do the onboarding wizard yet — you're learning where it breaks.
- Note every question they ask during the build. Those questions ARE the FAQ + onboarding copy.
- Send finished link with: "Share this in your next quote — would love to know if anyone messages you through it."

**Also:**
- 20 more solo cold messages + 10 more firm emails
- Post in **2 new Facebook groups** (regional ones too — "Glasgow Tradesmen", "London Plumbers Network", etc.)
- Post in **r/DIYUK**, **r/PlumbingUK**, **r/electricians** — angle: "Built a free Linktree for tradesmen — looking for brutal feedback"
- **LinkedIn (firms only):** post once on your founder profile — "Built Mytradelink for UK trades firms — DM if you want a free Pro account for your engineers."

---

### Wednesday — First "build in public" content drop

You should now have 5–10 finished profiles. Time for social proof.

- **TikTok / Instagram Reel** — screen-record yourself building a profile in 60 seconds. Caption: "Built this plumber a profile page in 60 seconds. He's already had 2 quote requests."
- **LinkedIn post** (for any contractors / agencies / suppliers who might amplify — not the tradesmen themselves): "Day 3 of building Mytradelink — 12 profiles live, here's what every tradesman asked me."
- **Twitter/X thread** — same content, different audience (other founders → boosts your reach).
- 20 more cold DMs
- 5 more feedback calls

---

### Thursday — First paid test (£100 cap)

- **Facebook/Instagram ad** — £100 total budget, 3-day burn. Targeting:
  - Location: **United Kingdom (all)**
  - Age: 25–55
  - Interests: Screwfix, Toolstation, City & Guilds, Gas Safe Register, NICEIC, Plumbing, Electrician, Self-employed
  - Creative: the 15-sec video from Day 1 or Day 3
  - CTA: "Get your free page → mytradelink.page"
- Retargeting pixel on landing page (set up for week 2)
- 20 more solo DMs + 10 more firm emails
- Post in **2 more FB groups** (vary the wording — never repost identical text)
- **LinkedIn outbound (firms):** 15 connection requests with a personalised note to MDs of small electrical/plumbing firms.

---

### Friday — Iterate visibly

By now you'll have feedback. Common complaints will cluster — fix the top 1 or 2 cosmetic ones today and **tell people you fixed them**.

- WhatsApp every signed-up user: "Hey — you mentioned X. Just shipped it. Have a look."
- Post a "what changed this week" update in the FB groups you posted in earlier — this builds the "this founder actually listens" reputation that travels fast in trade communities.
- 5 more feedback calls
- 20 more cold DMs (Friday afternoon = quiet day for trades, decent response rate)

---

### Saturday — Tradesman peak day

UK tradesmen often work Saturdays and check their phones constantly between jobs.

- **WhatsApp blast day** — message any solo prospect who didn't reply on Mon–Fri. Saturday afternoons = high open rate for self-employed trades.
- Post a TikTok/Reel showing one tradesman's actual results: "Steve had 3 quote requests this week from his Mytradelink page."
- **Screwfix / Toolstation car-park leaflet drop** — do this in *your* home city only. 200 leaflets, A6, QR code straight to the landing page. Cheap (~£30 from Solopress). It's a one-city experiment to learn if the channel converts at all — if it does, Week 2 you can buy a national list of branch managers and try a posted version.

---

### Sunday — Tally, decide, plan Week 2

- Pull every feedback note into one doc. Cluster by theme. Pick the top 3 friction points.
- Look at the analytics. Which channel drove the most sign-ups? Which drove the most *engaged* sign-ups (i.e. published their profile)?
- **Double down on the one channel that worked best for Week 2.** Cut the rest.
- Write a public Week 1 recap post — number of sign-ups, what you learned, what you're shipping next week. Post in FB groups, on TikTok, on Twitter/LinkedIn. This recap *is* the marketing for Week 2.

---

## Channels Ranked by Expected ROI (Week 1)

| Channel | Effort | Why it'll work — or won't |
|---|---|---|
| Channel | Effort | Best for | Why it works |
|---|---|---|---|
| **Cold WhatsApp / DM (Checkatrade, MyBuilder)** | High | Solos | Trades live on WhatsApp. Personalised + offering free Pro is a near-irresistible hook. **Bet hard on this.** |
| **UK trade Facebook groups** | Medium | Solos + small firms | Where tradesmen actually hang out. Soft posts only — read group rules first. |
| **Cold email to firms (Companies House + trade assoc.)** | Medium | Firms | Solos won't read email; MDs and office managers do. Bulk-personalise with a tool like Smartlead or Instantly. |
| **LinkedIn DMs to MDs/owners** | Medium | Firms only | Firms are on LinkedIn; solos aren't. Connection request + personalised note beats InMail. |
| **Trade forums (PlumbersForums, ElectriciansForums)** | Low | Solos | One good founder thread drips traffic for years. |
| **TikTok / Instagram Reels** | Medium | Solos | Trades watch a *lot* of short-form video. Slow burn but free. |
| **Reddit (r/DIYUK, r/PlumbingUK, r/electricians)** | Low | Solos | Smaller UK trade subs but engaged. Good for feedback, mediocre for volume. |
| **Facebook/Instagram ads (UK-wide)** | Low (£100) | Solos | Small test to learn CAC, not to drive Week 1 volume. |
| **Screwfix/Toolstation leaflets** | Low | Solos | Long-shot guerrilla play. Cheap enough to try once in your home city. |
| **Twitter / "build in public"** | Low | Neither directly | Only useful for amplifying content to other founders who might amplify back. |

---

## What NOT to Do Week 1

- ❌ Don't run Google Ads yet — you'll learn nothing for £100 there.
- ❌ Don't write SEO blog posts. No volume, no learning.
- ❌ Don't pitch press. You don't have a story yet.
- ❌ Don't optimise the funnel based on guesses. Talk to 10 tradesmen first.
- ❌ Don't pitch firms a team feature you haven't built. Pitch them the single company profile + log demand for multi-user.
- ❌ Don't add features mid-week unless they're 30-min fixes. You're testing the existing product.
- ❌ Don't spam the same Facebook group twice in one week.
- ❌ Don't worry about Pro conversions. Week 1 is for free sign-ups + feedback only.

---

## Templates

### Facebook group soft post (use sparingly — once per group, max)

> Built something for UK tradesmen and would love some brutal feedback before I push it any wider.
>
> Mytradelink — one link for your phone, WhatsApp, photos, reviews, and quote form. Sort of a digital business card / van wrap combo. Customers tap one link instead of you texting them six things.
>
> Example: mytradelink.page/dave-the-plumber-leeds
>
> Free for the first 50 lads who try it — I'll even build the page for you if you send photos.
>
> If it's rubbish, tell me. If you've already got something better, tell me that too.

### Feedback call — 5 questions (15 mins, recorded)

1. Walk me through how you currently get new customers.
2. When you saw the demo page for the first time — what was the first thing you thought?
3. What's missing? Be brutal.
4. If this saved you 1 quote a month, what would that be worth to you?
5. Who do you know that would actually pay for this?

---

## Success Criteria for Week 2 Go/No-Go

By Sunday night, you should be able to answer:

1. **Did 30+ tradesmen sign up?** If no — the demo profile or landing copy isn't clear. Fix before scaling.
2. **Did 60%+ complete onboarding?** If no — the wizard has a broken step. Fix before scaling.
3. **Did at least 5 tradesmen say "I'd pay £X for this"?** If no — find out why before spending another £ on ads.
4. **Did you spot one channel that worked 3x better than the others?** If yes — Week 2 is "do that thing, 10x more." If no — Week 2 is "talk to 20 more tradesmen until you find a channel."

---

## Resources Needed

- **Your time:** ~4–6 hrs/day for 7 days
- **Cash:** ~£150 (£100 ads + £30 leaflets + £20 Tally/Cal/coffee)
- **Tools:** Tally, Cal.com, PostHog (or Vercel Analytics), Stripe coupon, Loom for video DMs
- **Mindset:** Treat every sign-up like a focus group of 1. The first 50 users are research participants, not customers.
