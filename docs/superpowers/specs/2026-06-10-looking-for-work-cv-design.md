# Looking-for-work tradie CV - design spec

Date: 2026-06-10
Status: Approved (design), pending implementation plan
Owner: Dane

## Summary

Add a second account goal to Mytradelink: **looking for work**. Alongside the
existing business advertising page, a young or newly qualified tradie can create
a shareable CV page that proves they are legit and helps them get hired. It
reuses the existing account, auth, slug URLs, uploads and most tables. The only
substantial new code is making the section system and the public page aware of
the account goal.

This spec covers **Phase 1: the CV page only.** A future Phase 2 (employer
marketplace / directory) is explicitly out of scope and gets its own spec.

## Goals

- A tradie with no business, no customers and no reviews can still build a
  credible page in a few minutes from a phone.
- The page does two jobs: helps them **get hired** and **proves they are legit**
  via their qualifications and cards.
- It is shareable as a single link (van, TikTok bio, job application, text to a
  gaffer).
- Reuse the existing product; do not build a separate system.

## Non-goals (Phase 1)

- Employer marketplace / search / directory (Phase 2, separate spec).
- Verifying qualifications against registers. v1 certs are self-uploaded.
- PDF export of the CV.
- Showing both goals on one page at once. One active goal per account.

## Account goal model

- One account, one active **goal**, chosen at creation, switchable later in
  settings.
- Goals: `business` (every existing account) and `looking_for_work`.
- Switching goal swaps which section catalog and which public layout the account
  uses. There is no separate "graduate" flow; going self-employed is just a
  toggle from `looking_for_work` to `business`.

## Data model

Additive only. Never drop or rename existing columns/tables.

- `users.account_goal` - new enum `account_goal` (`business` | `looking_for_work`),
  not null, default `business`. Existing rows become `business` automatically.
- New table `education`:
  - `id`, `user_id` (fk, cascade), `institution` (varchar), `qualification`
    (varchar, e.g. "Level 3 NVQ Plumbing"), `start_year` (int, nullable),
    `end_year` (int, nullable), `display_order` (int), `created_at`.
- **Reuse, no schema change:**
  - `certifications` -> qualifications and cards (name + uploaded badge/photo).
  - `photos` -> training-work images (type `gallery`).
  - `services` -> skills list (each row is one skill chip; `service_name` holds
    the skill, `description` unused). Semantic reuse to avoid a new table.
  - `users` fields reused: `name`, `trade`, `location`, `profile_photo_url`,
    `banner_image_url`, `about`, `intro_video_url`, `phone`, `whatsapp_number`,
    `email`, `availability_status`.
- `availability_status` is reused as-is; the UI relabels it per goal
  ("Available for work" / "Not currently looking" vs the business labels).

## Section system (mode-aware)

`src/lib/sections.ts` becomes goal-aware. A `SectionDef` gains a `goals` scope
(which account goals it applies to). There are separate `DEFAULT_ENABLED` sets
and separate `SECTION_GROUPS` per goal.

New section keys for `looking_for_work`:

- `education` - college/training list.
- `skills` - skill chips.
- `email_button` - tap-to-email (employers often prefer email).

Reused keys in `looking_for_work` mode: `banner_image`, `profile_photo`,
`availability_status` (relabelled), `about_me`, `certifications`,
`photo_gallery`, `call_button`, `whatsapp_button`, `intro_video`.

Hidden in `looking_for_work` mode (business-only): `services_list`,
`before_after_photos`, `google_reviews`, `quote_form`, `areas_covered`,
`payment_methods`, `emergency_callout`, social links optional.

Default enabled for a new `looking_for_work` account:
`profile_photo`, `availability_status`, `about_me`, `certifications`,
`education`, `skills`, `photo_gallery`, `call_button`, `whatsapp_button`,
`email_button`.

## Public CV page

`/t/[slug]` reads `account_goal` and renders the CV layout when it is
`looking_for_work`, otherwise the existing business layout. Subcomponents are
shared where possible (certification tiles, photo grid, contact buttons).

CV layout, mobile first, top to bottom:

1. Banner + profile photo, name, trade label, location, "Available for work"
   badge.
2. Short intro (about), optional 30s intro video.
3. Qualifications and cards (badge tiles).
4. Training and education (institution, qualification, years).
5. Skills (tag chips).
6. Training work photos (gallery).
7. Contact: call, WhatsApp, email.

## Onboarding fork

- New first step: "What brings you here?" two large cards, "I'm looking for work"
  and "I'm promoting my business."
- `business` path: existing 5-step wizard, unchanged.
- `looking_for_work` path: short wizard - basics (name, photo, trade, location),
  then quals and cards, then education, then skills, then optional photos.
- All other critical rules unchanged (auto-save, big touch targets, orange
  accent, plain English).

## UK and AU qualifications quick-add

To minimise typing for a non-technical 19 year old, the quals step offers a
country choice (UK / AU) and a quick-add dropdown of common items, plus "add
your own" with a photo upload.

- UK: NVQ Level 2, NVQ Level 3, City and Guilds, CSCS card, 18th Edition,
  Gas Safe, ECS card.
- AU: White Card, Cert III in <trade>, state trade licence, Working at Heights,
  Test and Tag.

Lists live in a new `src/lib/quals.ts` (or extend `trades.ts`), keyed by country.

## Build sequence (for the implementation plan)

1. Schema: add `account_goal` enum + column, add `education` table, generate
   additive migration.
2. `sections.ts`: goal scoping on defs, new keys, per-goal groups and defaults.
3. `queries.ts`: education CRUD, skills via services, fetch shaped by goal.
4. `quals.ts`: UK/AU quick-add lists.
5. Onboarding: goal-select step + looking-for-work wizard.
6. Dashboard: goal toggle in settings, looking-for-work section editor,
   education and skills editors.
7. Public page: CV layout renderer reusing shared components.

## Open questions

- Does switching goal hide the other goal's data or keep it (for switching back)?
  Recommendation: keep all data, only change what renders. Confirm during plan.
- Email contact: add a public-safe email field or reuse `users.email`?
  Recommendation: a separate `public_email` to avoid exposing the login email.
  Confirm during plan.
