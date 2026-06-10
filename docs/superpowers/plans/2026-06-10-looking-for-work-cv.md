# Looking-for-work tradie CV - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second account goal (`looking_for_work`) so a young/newly qualified tradie can build a shareable CV page that proves their qualifications and helps them get hired, reusing the existing account and most tables.

**Architecture:** One account, one active `account_goal` (`business` | `looking_for_work`) chosen at onboarding and switchable in settings. The goal selects which section catalog the dashboard shows and which layout the public page renders. Qualifications reuse the `certifications` table, training photos reuse `photos`, skills reuse `services`; the only new table is `education`. No marketplace and no cert verification in this phase.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM + Neon Postgres, Clerk auth, Uploadthing, Tailwind. No app test runner exists, so each task is verified with `npx tsc --noEmit`, `npm run lint`, and (where noted) `npm run build` plus a manual run. If you want unit tests, add Vitest first as a separate task; this plan does not assume it.

**Spec:** `docs/superpowers/specs/2026-06-10-looking-for-work-cv-design.md`

**Resolved product decisions:**
- Switching goal KEEPS all data; only what renders changes.
- Public email uses a NEW `users.public_email` field, never the Clerk login email.

---

## File map

| File | Change | Responsibility |
|---|---|---|
| `src/lib/db/schema.ts` | modify | `account_goal` enum + `users.account_goal`, `users.public_email`, new `education` table, relations, types |
| `drizzle/*` | generated | migration SQL (additive) |
| `src/lib/sections.ts` | modify | goal-aware section defs/groups/defaults + new keys `education`, `skills`, `email_button` |
| `src/lib/quals.ts` | create | UK/AU quick-add qualification lists |
| `src/lib/queries.ts` | modify | fetch `education`; add to `FullProfile`; goal helpers |
| `src/lib/demo-profile.ts` | modify | keep `FullProfile` shape valid (`education: []`, new user fields) |
| `src/lib/auth.ts` | modify | seed/sync sections by goal |
| `src/app/api/webhooks/clerk/route.ts` | modify | seed sections by goal (default business) |
| `src/app/onboarding/actions.ts` | modify | `saveGoal` (+reseed), LFW step actions |
| `src/app/onboarding/page.tsx` | modify | pass `accountGoal` into wizard |
| `src/app/onboarding/wizard.tsx` | modify | goal-select step + branch to LFW wizard |
| `src/app/onboarding/lfw-wizard.tsx` | create | looking-for-work wizard steps |
| `src/app/dashboard/actions.ts` | modify | goal toggle, education/skills/quals CRUD |
| `src/app/dashboard/dashboard-client.tsx` | modify | goal toggle + goal-aware section editor + LFW editors |
| `src/components/public-cv-profile.tsx` | create | public CV layout |
| `src/app/t/[slug]/page.tsx` | modify | branch layout + metadata by goal |

---

## Task 1: Schema - account goal, public email, education table

**Files:**
- Modify: `src/lib/db/schema.ts`
- Generated: `drizzle/` migration

- [ ] **Step 1: Add the enum and user columns**

In `src/lib/db/schema.ts`, after `availabilityEnum` (around line 21) add:

```ts
export const accountGoalEnum = pgEnum("account_goal", [
  "business",
  "looking_for_work",
]);
```

In the `users` table, after the `availabilityStatus` block (line 59) add:

```ts
    accountGoal: accountGoalEnum("account_goal")
      .notNull()
      .default("business"),
    publicEmail: varchar("public_email", { length: 254 }),
```

- [ ] **Step 2: Add the `education` table**

After the `certifications` table block (after line 148) add:

```ts
export const education = pgTable(
  "education",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    institution: varchar("institution", { length: 160 }).notNull(),
    qualification: varchar("qualification", { length: 160 }),
    startYear: integer("start_year"),
    endYear: integer("end_year"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("education_user_idx").on(t.userId),
  })
);
```

- [ ] **Step 3: Add relations and types**

In `usersRelations` (line 230) add `education: many(education),`. After `certificationsRelations` add:

```ts
export const educationRelations = relations(education, ({ one }) => ({
  user: one(users, { fields: [education.userId], references: [users.id] }),
}));
```

At the bottom type exports add:

```ts
export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert;
export type AccountGoal = (typeof accountGoalEnum.enumValues)[number];
```

- [ ] **Step 4: Generate and inspect the migration**

Run: `npm run db:generate`
Expected: a new file under `drizzle/` that only ADDs the enum type, two columns, and the `education` table. Confirm there is no `DROP`. Per the project rule (never drop tables/columns), if any drop appears, stop and fix the schema diff.

- [ ] **Step 5: Push to the database**

Run: `npm run db:push`
Expected: applies cleanly. Existing user rows default to `account_goal = 'business'`.

- [ ] **Step 6: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add src/lib/db/schema.ts drizzle
git commit -m "feat(schema): add account_goal, public_email, education table"
```

---

## Task 2: Goal-aware section catalog

**Files:**
- Modify: `src/lib/sections.ts`

- [ ] **Step 1: Add new section keys and the goal scope**

Extend the `SectionKey` union (line 1) with `"education"`, `"skills"`, `"email_button"`. Import the goal type at the top:

```ts
import type { AccountGoal } from "@/lib/db/schema";
```

Add `goals` to `SectionDef`:

```ts
export type SectionDef = {
  key: SectionKey;
  label: string;
  description: string;
  paidOnly?: boolean;
  goals: AccountGoal[]; // which account goals show this section
};
```

- [ ] **Step 2: Tag every existing def with its goals and add the three new defs**

Add `goals: ["business"]` to every current def, EXCEPT the shared identity/contact/credibility ones which get both goals. Shared (`goals: ["business", "looking_for_work"]`): `banner_image`, `profile_photo`, `call_button`, `whatsapp_button`, `availability_status`, `about_me`, `photo_gallery`, `certifications`, `intro_video`. Append the new defs:

```ts
  { key: "education", label: "Training & education", description: "College, course, years", goals: ["looking_for_work"] },
  { key: "skills", label: "Skills", description: "What you can do on the tools", goals: ["looking_for_work"] },
  { key: "email_button", label: "Email button", description: "Let employers email you", goals: ["looking_for_work"] },
```

- [ ] **Step 3: Add looking-for-work groups and defaults, plus goal selectors**

Add a second groups array and default set, and selector helpers. Keep the existing `SECTION_GROUPS` and `DEFAULT_ENABLED` (they become the business set; rename is not required but add the selectors below):

```ts
export const LFW_SECTION_GROUPS: SectionGroup[] = [
  { id: "identity", title: "You", blurb: "Photo, trade, availability.",
    keys: ["banner_image", "profile_photo", "availability_status"] },
  { id: "credibility", title: "Proof", blurb: "Quals, training, skills.",
    keys: ["about_me", "certifications", "education", "skills"] },
  { id: "work", title: "Your work", blurb: "Photos and intro video.",
    keys: ["photo_gallery", "intro_video"] },
  { id: "contact", title: "Get hired", blurb: "How employers reach you.",
    keys: ["call_button", "whatsapp_button", "email_button"] },
];

export const LFW_DEFAULT_ENABLED: SectionKey[] = [
  "profile_photo", "availability_status", "about_me", "certifications",
  "education", "skills", "photo_gallery", "call_button", "whatsapp_button",
  "email_button",
];

export function sectionDefsForGoal(goal: AccountGoal): SectionDef[] {
  return SECTION_DEFS.filter((d) => d.goals.includes(goal));
}
export function sectionGroupsForGoal(goal: AccountGoal): SectionGroup[] {
  return goal === "looking_for_work" ? LFW_SECTION_GROUPS : SECTION_GROUPS;
}
export function defaultEnabledForGoal(goal: AccountGoal): SectionKey[] {
  return goal === "looking_for_work" ? LFW_DEFAULT_ENABLED : DEFAULT_ENABLED;
}
```

- [ ] **Step 4: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: PASS (errors here flag any def missing `goals`; fix them).

```bash
git add src/lib/sections.ts
git commit -m "feat(sections): goal-aware catalog + education/skills/email_button"
```

---

## Task 3: Quals quick-add lists

**Files:**
- Create: `src/lib/quals.ts`

- [ ] **Step 1: Write the country-keyed lists**

```ts
export type QualCountry = "UK" | "AU";

export const QUALS_BY_COUNTRY: Record<QualCountry, string[]> = {
  UK: [
    "NVQ Level 2", "NVQ Level 3", "City & Guilds", "CSCS Card",
    "18th Edition", "Gas Safe Registered", "ECS Card", "Part P",
  ],
  AU: [
    "White Card", "Cert III (Trade)", "State Trade Licence",
    "Working at Heights", "Test & Tag", "First Aid", "EWP Licence",
  ],
};

export const QUAL_COUNTRIES: QualCountry[] = ["UK", "AU"];
```

- [ ] **Step 2: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add src/lib/quals.ts
git commit -m "feat(quals): UK/AU quick-add qualification lists"
```

---

## Task 4: Fetch education in the profile aggregate

**Files:**
- Modify: `src/lib/queries.ts`
- Modify: `src/lib/demo-profile.ts`

- [ ] **Step 1: Add education to `getFullProfile`**

In `src/lib/queries.ts` import `education` from schema (line 2 block). Add it to the `Promise.all` and the return:

```ts
  const [s, p, c, t, sec, edu] = await Promise.all([
    db.query.services.findMany({ where: eq(services.userId, userId) }),
    db.query.photos.findMany({ where: eq(photos.userId, userId) }),
    db.query.certifications.findMany({ where: eq(certifications.userId, userId) }),
    db.query.testimonials.findMany({ where: eq(testimonials.userId, userId) }),
    db.query.sections.findMany({ where: eq(sections.userId, userId) }),
    db.query.education.findMany({ where: eq(education.userId, userId) }),
  ]);

  return {
    user,
    services: s.sort((a, b) => a.displayOrder - b.displayOrder),
    photos: p,
    certifications: c.sort((a, b) => a.displayOrder - b.displayOrder),
    testimonials: t.sort((a, b) => a.displayOrder - b.displayOrder),
    sections: sec.sort((a, b) => a.displayOrder - b.displayOrder),
    education: edu.sort((a, b) => a.displayOrder - b.displayOrder),
  };
```

- [ ] **Step 2: Keep the demo profile shape valid**

In `src/lib/demo-profile.ts` add `education: []` to the exported `DEMO_PROFILE` object, and add `accountGoal: "business"` and `publicEmail: null` to its `user`. Run `npx tsc --noEmit` and fix any other missing fields it reports on the demo `user`.

- [ ] **Step 3: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add src/lib/queries.ts src/lib/demo-profile.ts
git commit -m "feat(queries): include education in full profile"
```

---

## Task 5: Seed and sync sections by goal

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/app/api/webhooks/clerk/route.ts`

New users are created as `business` (today's behaviour), so seeding stays business by default. Goal changes reseed via Task 6's action. The idempotent `syncSections` must only add rows for the user's CURRENT goal's catalog.

- [ ] **Step 1: Make initial seed and sync goal-aware in `auth.ts`**

Replace the `SECTION_DEFS`/`DEFAULT_ENABLED` imports with the goal selectors:

```ts
import { sectionDefsForGoal, defaultEnabledForGoal } from "@/lib/sections";
```

Where the user is first created (line ~57), seed from the user's goal (a brand-new user is `business`):

```ts
    sectionDefsForGoal("business").map((def, idx) => ({
      userId: newUser.id,
      sectionKey: def.key,
      isEnabled: defaultEnabledForGoal("business").includes(def.key),
      displayOrder: idx,
    }))
```

In `syncSections` (line ~68-86), scope to the user's goal:

```ts
  const goal = user.accountGoal;
  const defs = sectionDefsForGoal(goal);
  const enabledDefaults = defaultEnabledForGoal(goal);
  // ...existing "have" set logic...
  const missing = defs.filter((d) => !have.has(d.key));
  // insert missing with isEnabled: enabledDefaults.includes(def.key)
```

Ensure the `user` row (with `accountGoal`) is in scope in `syncSections`; if it currently only receives a userId, pass the loaded user or read `accountGoal` first.

- [ ] **Step 2: Make the Clerk webhook seed goal-aware**

In `src/app/api/webhooks/clerk/route.ts` swap the imports for `sectionDefsForGoal`/`defaultEnabledForGoal` and seed with `"business"` (line ~64), mirroring Step 1.

- [ ] **Step 3: Type-check and commit**

Run: `npx tsc --noEmit`
Expected: PASS.

```bash
git add src/lib/auth.ts src/app/api/webhooks/clerk/route.ts
git commit -m "feat(auth): seed and sync sections by account goal"
```

---

## Task 6: Onboarding goal fork

**Files:**
- Modify: `src/app/onboarding/actions.ts`
- Modify: `src/app/onboarding/page.tsx`
- Modify: `src/app/onboarding/wizard.tsx`
- Create: `src/app/onboarding/lfw-wizard.tsx`

- [ ] **Step 1: Add the `saveGoal` action that also reseeds sections**

In `src/app/onboarding/actions.ts` add (uses a transaction per the project's multi-step rule):

```ts
import { sections, education } from "@/lib/db/schema";
import { sectionDefsForGoal, defaultEnabledForGoal } from "@/lib/sections";
import type { AccountGoal } from "@/lib/db/schema";

export async function saveGoal(goal: AccountGoal) {
  const user = await requireUser();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ accountGoal: goal, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    // reseed: delete sections not in the new catalog, add missing ones
    const defs = sectionDefsForGoal(goal);
    const keys = new Set(defs.map((d) => d.key));
    const existing = await tx.query.sections.findMany({
      where: eq(sections.userId, user.id),
      columns: { sectionKey: true },
    });
    const have = new Set(existing.map((r) => r.sectionKey));
    const toAdd = defs.filter((d) => !have.has(d.key));
    if (toAdd.length) {
      await tx.insert(sections).values(
        toAdd.map((def, i) => ({
          userId: user.id,
          sectionKey: def.key,
          isEnabled: defaultEnabledForGoal(goal).includes(def.key),
          displayOrder: 100 + i,
        }))
      );
    }
    // leave out-of-catalog sections in place but they will not render for this goal
  });
  revalidatePath("/onboarding");
  return { ok: true };
}
```

Add `saveLfwBasics({ name, trade, location })` (mirror `saveStep1`+`saveStep2` writing `name`, `trade`, `slug`, `location`).

Also add the SHARED field CRUD here, in a new `src/app/onboarding/lfw-actions.ts` (or alongside in `actions.ts`), because BOTH the onboarding wizard (Task 6) and the dashboard (Task 7) call them, and the wizard is built first: `addEducation/updateEducation/deleteEducation`, `addSkill/deleteSkill` (writing to `services`), and reuse the existing certification create/delete actions for quals. Extract the goal-reseed logic used by `saveGoal` into a shared `reseedSectionsForGoal(tx, userId, goal)` helper (place in `src/lib/sections-server.ts`) so Task 7's `setAccountGoal` reuses it (DRY). Each action follows the `requireUser` + `revalidatePath` pattern.

- [ ] **Step 2: Pass the current goal into the wizard**

In `src/app/onboarding/page.tsx`, include `accountGoal` in the `initial` object passed to the wizard (read from the loaded user).

- [ ] **Step 3: Add the goal-select first screen to `wizard.tsx`**

Add a `goal` field to the wizard `State` and render a goal-select screen as step 1 when `goal` is unset. Two large cards using the existing button styling (`border-2 border-ink-900 bg-brand` for the chosen state). On select, call `saveGoal(goal)`; if `looking_for_work`, render `<LfwWizard initial={...} />` instead of the business steps; otherwise continue the existing Step1-5 flow (renumbered after the goal screen). Reuse `Progress`, `Field`, `Header`, `BlueprintGrid` (export them or move to a shared file `onboarding/ui.tsx` if `lfw-wizard.tsx` needs them - prefer extracting shared bits to `onboarding/ui.tsx`).

Card copy: "I'm looking for work" / "I'm promoting my business".

- [ ] **Step 4: Build `lfw-wizard.tsx`**

A client component mirroring `wizard.tsx` structure with steps: (1) basics - name, trade (reuse `TRADES`), location; (2) qualifications - country toggle from `quals.ts`, quick-add chips + custom add, each with optional Uploadthing badge image (reuse the `certifications` create action from Task 7); (3) education - institution, qualification, years (Task 7 action); (4) skills - chip input (Task 7 action); (5) photos - optional gallery upload; (6) live screen reusing the existing Step5 share UI. Auto-save on each step via the actions. Use the same input/button classes as `wizard.tsx`. No new colours; orange accent only.

- [ ] **Step 5: Verify build and manual run**

Run: `npm run build`
Expected: compiles. Then `npm run dev`, create a test account, pick "looking for work", complete the wizard, confirm the page goes live.

- [ ] **Step 6: Commit**

```bash
git add src/app/onboarding
git commit -m "feat(onboarding): goal fork + looking-for-work wizard"
```

---

## Task 7: Dashboard - goal toggle and LFW editors

**Files:**
- Modify: `src/app/dashboard/actions.ts`
- Modify: `src/app/dashboard/dashboard-client.tsx`

- [ ] **Step 1: Add server actions**

In `src/app/dashboard/actions.ts` add, following the existing `requireUser` + `revalidatePath("/dashboard")` pattern:
- `setAccountGoal(goal)` - calls the shared `reseedSectionsForGoal(tx, userId, goal)` helper created in Task 6 Step 1 (DRY; do not duplicate the reseed logic).

The education/skills CRUD actions were already created in Task 6 Step 1 (`lfw-actions.ts`); the dashboard imports those same actions. Do not redefine them here.

- [ ] **Step 2: Make the section editor goal-aware**

In `dashboard-client.tsx`, replace any `SECTION_GROUPS`/`SECTION_DEFS` usage with `sectionGroupsForGoal(profile.user.accountGoal)` and `sectionDefsForGoal(...)` so a looking-for-work account sees the CV sections and a business account is unchanged.

- [ ] **Step 3: Add a goal toggle in settings**

Add a small control (segmented toggle, two options) bound to `setAccountGoal`. Plain-English copy: "I'm looking for work" / "I'm promoting my business". Show a one-line note that switching changes which sections show, and that nothing is deleted.

- [ ] **Step 4: Add the education and skills editors**

Render an Education editor (list + add/edit/delete, institution/qualification/years) and a Skills editor (chip add/remove) only when `accountGoal === "looking_for_work"`. Follow the existing certifications/services editor components in this file for layout, auto-save, loading and error states.

- [ ] **Step 5: Verify and commit**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. Manually toggle goal in the dashboard and confirm the section list and editors switch.

```bash
git add src/app/dashboard
git commit -m "feat(dashboard): goal toggle + education/skills editors"
```

---

## Task 8: Public CV layout

**Files:**
- Create: `src/components/public-cv-profile.tsx`
- Modify: `src/app/t/[slug]/page.tsx`

- [ ] **Step 1: Build the CV layout component**

Create `public-cv-profile.tsx` taking `{ profile: FullProfile }`, rendering the CV order from the spec: banner+photo / name / trade / location / "Available for work" badge; about + intro video; qualifications (reuse the certification tile markup from `public-profile.tsx`); training & education (from `profile.education`); skills chips (from `profile.services`); training photos (reuse the gallery markup); contact buttons (call, WhatsApp, and email from `profile.user.publicEmail`). Respect `isSectionEnabled(profile, key)` for each block. Reuse existing sub-markup/classes from `public-profile.tsx`; do not introduce new colours. Mobile first.

- [ ] **Step 2: Branch the public page by goal**

In `src/app/t/[slug]/page.tsx`, after loading `profile`, render `<PublicCvProfile profile={profile} />` when `profile.user.accountGoal === "looking_for_work"`, else the existing `<PublicProfile profile={profile} />`. For `looking_for_work`, swap the JSON-LD from `localBusinessJsonLd` to a minimal `Person` schema (name, jobTitle = trade, address locality = location); add a small `personJsonLd` helper in `src/lib/structured-data.ts`. Update `generateMetadata` title for that goal to e.g. `"<name> - <trade> looking for work | Mytradelink"`.

- [ ] **Step 3: Verify and commit**

Run: `npm run build`
Expected: compiles. Manually open the test looking-for-work account's `/t/<slug>` and confirm the CV layout renders with quals, education, skills, photos and contact, and that an existing business page is unchanged.

```bash
git add src/components/public-cv-profile.tsx src/app/t/[slug]/page.tsx src/lib/structured-data.ts
git commit -m "feat(public): looking-for-work CV layout"
```

---

## Final verification

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] Manual: a business account is completely unchanged end to end (onboarding, dashboard, public page).
- [ ] Manual: a new looking-for-work account can onboard, add quals/education/skills/photos, toggle goal both ways without data loss, and its public CV renders.
- [ ] Update `CLAUDE.md` schema + section-key reference and `src/lib/db/schema.ts` build-status notes if the project keeps those current.

## Out of scope (Phase 2, separate specs)
- Employer marketplace / directory / search.
- Qualification verification against registers.
- PDF export of the CV.
