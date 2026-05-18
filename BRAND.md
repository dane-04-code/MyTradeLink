# Mytradelink — Brand & Style Guide

Use this when creating marketing content (social posts, ads, landing pages, video thumbnails, sales decks). Anything customer-facing should match this guide.

---

## 1. Brand snapshot

**Mytradelink** is a smart digital profile page builder for UK tradesmen — Linktree built for plumbers, not influencers.

**Positioning:** *Your business. One link.*

**Audience:** UK sole traders and small-team tradespeople (plumbers, electricians, builders, gas engineers, etc.) — typically aged 25–55, earning £60–110k+, on their phone all day, not technical, win work by word-of-mouth.

**Tone:** Confident, no-nonsense, blue-collar professional. Talks like a tradesman, not a SaaS company.

**Brand attributes:**
- Industrial — built like a brick, not soft and fluffy
- Tactile — things feel like real switches and signs
- Honest — no jargon, no hidden anything
- Mobile-first — they're on their phones
- Local — UK-only, UK postcodes, UK trades

---

## 2. Tone & voice

**Do say:**
- "Your business. One link."
- "Stop sending screenshots of screenshots."
- "Built like a brick, made for your phone."
- "Five minutes to set up. Free forever."
- "No card needed."
- "Stop losing jobs to lads with a website."

**Don't say:**
- "Empower your trade business" (corporate)
- "Unlock your potential" (motivational filler)
- "Revolutionary platform" (generic SaaS)
- "Solutions" (vague)
- "Streamline your workflow" (jargon)
- "Game-changer" (cliché)

**Rules:**
- Plain English. Read it aloud — if it sounds like a sales rep, rewrite.
- Use "you" not "users" or "customers".
- Sentences short. Big claims, no padding.
- No emojis in body copy (only in selected callouts like "Your Mytradelink page is live 🎉").
- British spelling (colour not color, organisation not organization).

---

## 3. Colour palette

### Primary
| Name | Hex | Use |
|---|---|---|
| **Brand orange** | `#F97316` | Accents, CTAs, highlights, callouts |
| **Ink 900** | `#0F172A` | Primary text, dark backgrounds, hard outlines |
| **White** | `#FFFFFF` | Default light backgrounds |

### Supporting
| Name | Hex | Use |
|---|---|---|
| Ink 800 | `#1E293B` | Hover states on ink-900 |
| Ink 700 | `#334155` | Body text on white |
| Ink 600 | `#475569` | Secondary text |
| Ink 500 | `#64748B` | Tertiary text, captions, dim labels |
| Line | `#E2E8F0` | Hairline borders |
| Muted | `#F8FAFC` | Surface tint, subtle panel backgrounds |

### Functional
| Name | Hex | Use |
|---|---|---|
| Call green | `#16A34A` | Tap-to-call buttons |
| WhatsApp green | `#25D366` | WhatsApp buttons (do not modify — brand-mandated) |
| Emergency red | `#DC2626` | Emergency callout button only |
| Star yellow | `#FACC15` | Google review stars |
| Facebook blue | `#1877F2` | Facebook social link |

### Per-user theme accents (set by tradesman in dashboard)
| Preset | Hex | Suggested for |
|---|---|---|
| Builder | `#F97316` | Default — all trades |
| Grass | `#16A34A` | Landscapers, gardeners, tree surgeons |
| Hi-vis | `#EAB308` | Road works, construction, scaffolders |
| Sparky | `#2563EB` | Electricians, gas engineers |
| Brick | `#DC2626` | Alarm/security firms, bold brands |

**Rules:**
- Brand orange on ink-900 = primary brand combo. Use for hero moments.
- Don't introduce additional colours — pick from the list.
- Never put brand orange on a tinted/coloured background — only ink-900 or white.

---

## 4. Typography

| Use | Font | Weight | Source |
|---|---|---|---|
| **Display** (headlines, hero numbers, signage feel) | **Archivo Black** | 400 (only weight) | Google Fonts, free |
| **Body** (everything else) | **Plus Jakarta Sans** | 400, 500, 600, 700, 800 | Google Fonts, free |
| **Monospace** (URLs, codes, phone numbers, timestamps) | System monospace stack | — | Built-in |

### Type rules
- Display font (Archivo Black) is ALWAYS used for: page headlines, big numbers (e.g. analytics stats, pricing), the MYTRADELINK wordmark, business names on profiles.
- Body font for everything readable: paragraphs, buttons, labels.
- Caps + wide tracking (e.g. `letter-spacing: 0.22em`) for category eyebrows ("WHAT YOU GET", "WEEKLY WORKSHEET").
- Phone numbers always set in `tabular-nums` so digits align.
- Display font never gets a weight modifier — only one weight exists.

### Headline scale (rough)
- Hero (landing pages, masthead): 88–112 px desktop, 56–80 px mobile
- Big stat (analytics, pricing): 60–88 px
- Page heading: 32–48 px
- Section heading: 20–28 px
- Body: 16 px
- Small / caption: 12–14 px
- Tiny / eyebrow caps: 10–11 px

---

## 5. Visual signature elements

These are the specific aesthetic moves that make a Mytradelink visual recognisable. Use them.

### 5.1 Hard ink-900 outline + 4px hard shadow
Buttons, cards, action panels have a 2-2.5px `#0F172A` outline and a hard 4px-offset `#0F172A` shadow underneath (no blur). On press, they translate down 4px into the shadow. This is the most distinctive shape language in the product — feels like a physical switch.

```css
border: 2.5px solid #0F172A;
box-shadow: 0 4px 0 0 #0F172A;
/* active state */
transform: translateY(4px);
box-shadow: 0 0 0 0 #0F172A;
```

### 5.2 Blueprint grid background
On dark hero sections (landing, pricing, sign-up, dashboard surface): a faint 48×48px white grid at ~5–7% opacity, faded out at the edges with a radial mask. Reads as engineering paper / a builder's plan.

### 5.3 45° orange-on-ink hatch
Used for "Pro" or "premium" callouts, the upgrade banner, and the emergency button. A repeating diagonal stripe pattern in brand orange on ink-900. Reads as construction tape / warning stripes / hazard signage.

```css
background: repeating-linear-gradient(45deg, #F97316 0 6px, transparent 6px 18px);
```

### 5.4 URL chip
The marketing centrepiece — the headline "**Your business.** *One link.*" resolves below into a real-looking shareable URL set in monospace, framed like a browser address bar. Used on the landing page hero, the onboarding completion screen, and the dashboard URL bar.

```
mytradelink.app/t/dave-plumber
```

### 5.5 Phone mockup
A 310×640 dark ink-900 phone shape with a notch indicator, rounded 44px corners, drawn in CSS (not a stock photo). Used on the landing hero to show a real-looking finished Mytradelink page inside. Avoid stock-photo phones.

### 5.6 Per-step "eyebrow" rule
Small caps category labels above headlines, in brand orange or ink-500, with wide letter-spacing (~0.22em). E.g. `WEEKLY WORKSHEET`, `HOW IT WORKS`, `WHAT YOU GET`.

### 5.7 Tally / punch-card bar charts
Analytics + traffic source displays use chunky ink-900 bars with a brand-orange cap on the top 3 entries (highlighted days, leading category). Reads like a printed weekly report, not a SaaS dashboard.

---

## 6. Photography & imagery

### Use
- **Real tradesmen at work** — close-ups of hands on tools, faces in PPE, vans, work boots, work-in-progress
- **British contexts** — terraced houses, kitchens with kettles, council estates, work vans with phone numbers painted on them
- **Honest lighting** — daylight, working hours, no glossy studio shots
- **Wide aspects** — 5:2 or 16:9 for banners

### Avoid
- Stock-photo "businessman shaking hands" or "diverse team smiling at laptop"
- Soft tech/SaaS gradients
- 3D rendered abstract shapes
- AI-generated stock photo aesthetics
- Generic American imagery

---

## 7. Logo & wordmark

**MYTRADELINK** wordmark — always set in Archivo Black, uppercase, slight negative tracking (`-0.02em`).

Logomark — a small ink-900 square (8px radius) with a hammer icon inside in brand orange. Used as the favicon and inside the dashboard header next to the wordmark.

```
[🔨] MYTRADELINK
```

Never:
- Use the wordmark in any other font
- Italicise it
- Stretch it horizontally
- Place it on a coloured background other than white or ink-900

---

## 8. Voice in different contexts

### Headlines / hero
Short. Confrontational. Earned. Aim for "would a tradesman read this and nod" rather than "would a marketing person approve this".

> Your business. One link.
> Stop sending screenshots of screenshots.
> Live in five minutes.
> Stop losing jobs to lads with a website.

### Feature copy
Plain explanation. No abstractions.

> Massive, impossible-to-miss. One tap and they're on the phone with you.

### Pricing copy
Honest. Acknowledge the trade-off.

> Start free. Upgrade when you've won the first job.
> Free plan stays free forever. No card needed.
> Cancel anytime. Prices in GBP. VAT included.

### Empty states
Direct, not cute.

> No quotes yet. Share your link — they'll land here.

### Email
First line names what happened. Subject lines never use "regarding" or "important".

> Subject: New quote request from Sarah Davies

---

## 9. Social media — quick suggestions

### Style for graphics
- Square (1:1) or vertical (4:5) for IG/TikTok feed
- Dark ink-900 backgrounds with blueprint grid behind
- Big Archivo Black headlines occupying 40–60% of the canvas
- Brand-orange single-line accents (rules, dots, arrows)
- Real tradesman photo if used (cut out + drop on dark background)

### Hashtag bank
`#UKTradesmen #Plumber #Electrician #Builder #SoleTrader #SmallBusinessUK #TradesmanLife #UKBuilders #GasSafe #Bathroom #BoilerInstall`

### Suggested content pillars
1. **Customer outcomes** — tradesman screenshots a great quote request that came in via their Mytradelink page
2. **Behind the scenes** — how the page builder works in 30s
3. **Trust signals** — testimonials, badges, certifications
4. **Industry stuff** — "did you know 85% of trades have no online presence?"
5. **One-link content** — the URL chip moment as the hero of a static post

---

## 10. Don't list (visual)

If you find yourself doing any of these in a marketing visual, stop:

- Soft brand-tinted drop shadows (`shadow-[0_10px_25px_rgba(249,115,22,0.35)]`-style) — replaced by hard ink-900 4px shadow
- "Floating" elements with no anchoring
- Purple gradients (the universal AI-generated visual smell)
- Roboto, Inter, Arial, system-ui as a display font
- Lorem ipsum
- Stock photos of laptops and lattes
- "Innovative" / "revolutionary" / "seamless"
- Pastel anything
