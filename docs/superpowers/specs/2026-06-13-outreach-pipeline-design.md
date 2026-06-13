# Outreach Pipeline: CRM + Experiment Engine

**Date:** 2026-06-13
**Status:** Design approved, spec under review
**Owner:** Dane

---

## 1. Goal

Build a lightweight, markdown-first system that manages cold-outreach contacts at
scale (80,000+ expected) and, more importantly, **finds the single outreach formula
that converts best**, so it can be recycled across the whole list.

The operating strategy, in one line: **test on the first 2 to 3 thousand contacts to
find the winning formula, then roll that champion out to the 80k and keep recycling.**

This makes the system an **experiment engine first, a CRM second**. The CRM exists to
feed the experiments and to make sure no lead or reply is ever lost.

### Primary metric
**Positive-reply rate** per variant. It is the fastest honest signal that a method is
working, and it arrives weeks before a sign-up.

### Secondary metric
**Sign-up rate** per variant, shown alongside on the leaderboard as the lagging "money"
truth-check, so we never crown a method that gets warm replies but no actual sign-ups.

### Also a durable CRM
Finding the formula is the urgent job, but this is a permanent system. Every contact and
every interaction stays queryable for the long haul. The operator will routinely ask
ad-hoc questions ("all electricians in Coventry", "every gas engineer in Manchester we
have not contacted yet", "who replied positively last month") and get an answer as a
clean markdown table. SQLite makes this trivial; ad-hoc querying is a first-class
feature (see `/pipeline-query`), not an afterthought.

---

## 2. Non-goals

- **No open-tracking.** It needs a tracking pixel, which hurts deliverability and lies
  anyway (Apple Mail Privacy Protection auto-opens, Gmail proxies images). We optimize
  on replies. Keeping mail clean matters enormously at 80k volume.
- **No custom web app.** Markdown is the dashboard. A self-contained `dashboard.html`
  export is a possible future nicety, not part of this build.
- **No multi-channel for v1.** Email only. SMS/LinkedIn/etc. are out of scope until the
  email formula is proven.

---

## 3. How the operator interacts

Three surfaces, one engine:

1. **Chat (primary):** Claude runs the skills on request ("scan replies", "what's
   winning", "set up a test on the Coventry gas segment").
2. **Markdown files:** read any time, in any markdown viewer. Generated, never
   hand-edited, so regenerating is always safe.
3. **Telegram (Phase 3):** the Hermes / DeepSeek agent shells out to the same scripts,
   so the engine is operable from a phone.

---

## 4. The sales funnel (contact lifecycle)

Every contact moves through these stages. The **furthest stage reached** is stored on
the contact as `stage`; the full granular history lives in the `events` table. The
funnel report counts contacts at each stage to compute step-to-step conversion, per
variant and per segment.

```
  scraped          raw lead pulled from a scraper source
     |
  qualified        passed ICP rules (sole trader / small firm, valid email)
     |             [excluded leads branch off here with a reason]
     |
  segmented        assigned to a named segment, ready to work
     |
  queued           in a campaign, draft generated, not yet sent
     |
  contacted        at least one touch sent (t1, then t2, t3 on the cadence)
     |
  replied          any reply received  --> classified by an event:
     |                 positive | negative | neutral | auto | bounce
     |
  engaged          positive reply, a real conversation is open
     |
  signed_up        created a Mytradelink profile
     |
  customer         paying (future)

  dead             terminal: hard bounce, unsubscribe, hard no, or not-ICP
```

### Conversion rates the system reports
- contacted -> replied (reply rate)
- replied -> positive (reply quality)
- contacted -> positive (**the primary leaderboard metric**)
- contacted -> signed_up (the money metric)
- positive -> signed_up (how well warm leads close)

All of the above are sliceable by **variant**, **segment**, and **source**.

---

## 5. Database outline (the skeleton)

Single SQLite file: `pipeline/pipeline.db`. Source of truth. The operator never touches
it directly. CSV and markdown snapshots are generated on top for reading, git, and
backup.

> Why SQLite, not CSV: at 80k contacts with constant status updates, dedup, and
> join-heavy "conversion by variant" queries, CSV corrupts and slows badly. SQLite is a
> single local file with none of those problems and zero server to run.

### Table: `contacts`
The master, deduped list of everyone we might contact.

| column          | type    | notes |
|-----------------|---------|-------|
| id              | INTEGER PK | |
| business_name   | TEXT    | |
| email           | TEXT    | unique key for dedup (lowercased) |
| phone           | TEXT    | |
| address         | TEXT    | |
| postcode        | TEXT    | |
| town            | TEXT    | |
| region          | TEXT    | derived from postcode where possible |
| trade           | TEXT    | gas / electrical / plumbing / ... |
| source          | TEXT    | gassafe / niceic / ... |
| reg_number      | TEXT    | nullable (GasSafe has it, NICEIC does not) |
| icp_status      | TEXT    | in / excluded |
| icp_reason      | TEXT    | why excluded, if excluded |
| stage           | TEXT    | furthest funnel stage reached (see section 4) |
| date_added      | TEXT    | ISO timestamp |
| source_url      | TEXT    | provenance |
| raw             | TEXT    | original scraped row as JSON, for re-processing |

Dedup rule: a contact is the same if the **email** matches; secondary check on
`business_name + postcode` to catch shared/missing emails.

### Table: `segments`
A named cohort defined by a filter.

| column      | type | notes |
|-------------|------|-------|
| id          | INTEGER PK | |
| name        | TEXT | e.g. "GasSafe Coventry sole-traders" |
| description | TEXT | |
| definition  | TEXT | the filter as JSON (trade, region, source, icp_status) |
| date_created| TEXT | |

Membership is resolved by running the definition against `contacts` (a view), so a
segment always reflects current data. A `segment_members` table can pin membership if we
ever need frozen cohorts; not needed for v1.

### Table: `variants`
The outreach **formulas** we are testing. This is the unit the experiment engine ranks.

| column         | type | notes |
|----------------|------|-------|
| id             | INTEGER PK | |
| name           | TEXT | e.g. "reply-first concierge, 3-touch" |
| subject        | TEXT | subject template (supports {first_name} etc.) |
| body_t1        | TEXT | touch 1 template |
| body_t2        | TEXT | touch 2 template (nullable) |
| body_t3        | TEXT | touch 3 template (nullable) |
| cta_type       | TEXT | e.g. reply-to-this / book-call / direct-signup |
| sequence_type  | TEXT | 1-touch / 3-touch / etc. |
| status         | TEXT | testing / champion / retired |
| notes          | TEXT | the hypothesis being tested |
| date_created   | TEXT | |

### Table: `campaigns`
A specific variant sent to a specific segment. The experiment instance.

| column      | type | notes |
|-------------|------|-------|
| id          | INTEGER PK | |
| name        | TEXT | |
| segment_id  | INTEGER FK | |
| variant_id  | INTEGER FK | |
| status      | TEXT | drafting / sending / live / closed |
| date_started| TEXT | |
| notes       | TEXT | |

A/B testing: to split-test, create two campaigns over the same segment with different
variants; the engine splits the segment members between them (e.g. odd/even by id) so
each contact gets exactly one variant.

### Table: `sends`
One row per touch actually sent.

| column        | type | notes |
|---------------|------|-------|
| id            | INTEGER PK | |
| contact_id    | INTEGER FK | |
| campaign_id   | INTEGER FK | |
| touch_number  | INTEGER | 1, 2, 3 |
| channel       | TEXT | email |
| gmail_draft_id| TEXT | for matching/threading |
| sent_at       | TEXT | ISO timestamp (null while still a draft) |

### Table: `events`
The outcomes. Append-only history; this is where wins are recorded.

| column      | type | notes |
|-------------|------|-------|
| id          | INTEGER PK | |
| contact_id  | INTEGER FK | |
| campaign_id | INTEGER FK | nullable |
| type        | TEXT | replied / positive / negative / neutral / auto / bounce / signed_up / unsubscribed |
| detected_at | TEXT | ISO timestamp |
| source      | TEXT | gmail_scan / manual |
| evidence    | TEXT | reply snippet, gmail message id, etc. |

Recording an event updates the contact's `stage` to the furthest point implied.

---

## 6. The markdown layer (generated views)

Lives under `pipeline/`. All regenerated by `/pipeline-report`.

- `pipeline/DASHBOARD.md`: totals by source / trade / region, active campaigns, overall
  reply rate, top-line funnel counts.
- `pipeline/leaderboard.md`: every variant ranked by positive-reply rate, with sample
  size and a "trust this yet?" flag (statistical-significance gate), sign-up rate beside
  it. The single most important file.
- `pipeline/replies.md`: digest of every reply found, classified, with snippet and a
  suggested next action.
- `pipeline/segments/<segment>.md`: who is in it, send progress, status breakdown.
- `pipeline/campaigns/<campaign>.md`: variant used, contacts, send progress, outcomes.
- `pipeline/variants/<variant>.md`: the formula itself (human-readable), plus its
  running results. Variants can be authored here and imported, or created via skill.

---

## 7. The skills (re-runnable commands)

Each is a documented Claude Code skill with a clean CLI entrypoint (so the Telegram
agent can call it too).

1. **`/pipeline-init`** — create or migrate `pipeline.db` from the schema. Idempotent.
   This is the "just build the database" command.
2. **`/pipeline-ingest`** — pull new scraper CSVs into `contacts`: normalize, dedupe,
   classify ICP, log exclusions. Reports "342 new, 18 dupes, 5 excluded".
3. **`/pipeline-segment`** — create or refresh a named segment from a filter; write its
   markdown.
4. **`/pipeline-variant`** — define a new outreach formula (subject / bodies / cadence /
   CTA) to test.
5. **`/pipeline-campaign`** — set up an experiment: pick a segment and one or two
   variants, generate personalized emails (evolving the existing
   `outreach/generate_outreach.py`), queue them as Gmail drafts, log sends.
6. **`/pipeline-scan`** — scan Gmail for replies to active campaigns, match to contacts,
   classify sentiment, record events, refresh `replies.md` and dashboards. The core of
   "scan for emails I got back and note the wins".
7. **`/pipeline-report`** — regenerate all dashboards and the leaderboard; state what is
   winning and whether the sample is big enough to believe.
8. **`/pipeline-query`** — ad-hoc CRM querying. The operator asks in plain English
   ("all electricians in Coventry not yet contacted"); the skill turns it into SQL over
   `contacts` + `events`, returns a clean markdown table, and can optionally save the
   result straight into a new segment. This is what makes it a lasting CRM, not just a
   campaign tool.

A meta-skill principle the operator asked for: the system should be able to **build the
scripts and database whenever asked**. `/pipeline-init` plus the schema-as-code make the
database reproducible from scratch at any time.

---

## 8. The experiment engine

- A **variant** is one formula. The leaderboard ranks variants by positive-reply rate.
- **Significance gate:** a variant is not eligible to be called a winner until it has
  enough sends for the difference to be trustworthy (two-proportion test, default 95%
  confidence; show the result as "needs more data" until then). This stops us crowning a
  winner off 10 emails. Logic follows the `marketing-skills:ab-test-setup` approach.
- When a variant clearly wins, mark it `champion`. `/pipeline-campaign` then defaults to
  the champion for the big rollout. Recycle.

---

## 9. Email sending and reply capture (Instantly)

The sending channel is **Instantly**, the dedicated cold-email platform. Sending inboxes
being warmed: `dane@gettradelink.inc` and `sam@gettradelink.inc`. Instantly handles
warmup, per-inbox daily caps, and inbox rotation, which is what keeps deliverability
safe at 80k volume. This replaces the earlier Gmail draft-only idea.

- **Generation:** the campaign step (evolving `outreach/generate_outreach.py`) merges a
  variant's templates with each contact's fields and produces a per-contact send list
  (CSV or via the Instantly API) tagged with `campaign_id` and `variant_id` so outcomes
  map back to the right experiment.
- **Sending:** uploaded into an Instantly campaign. Instantly sends on its warmup-safe
  schedule. We start with the small test segment (2 to 3k) and scale the champion. The
  `sends` table logs what went where; deliverability is governed by Instantly's caps,
  not by a manual draft step.
- **Reply capture:** replies surface in Instantly's unibox and in the mailbox behind the
  sending addresses. `/pipeline-scan` pulls them, ideally via the **Instantly API or a
  reply webhook**; the Gmail integration is the fallback for reading the underlying
  mailbox directly. Claude classifies sentiment, and `record.py` writes the events.
- **Phase 2 open item:** confirm Instantly API access / webhook availability on the
  current plan. If the API is not available, fall back to scanning the mailbox behind
  `dane@` / `sam@` via the Gmail/IMAP integration. Either path feeds the same `events`
  table, so the rest of the system is unaffected.

---

## 10. Directory layout

```
pipeline/
  pipeline.db              # SQLite source of truth (gitignored)
  schema.sql               # schema as code; pipeline-init runs this
  DASHBOARD.md             # generated
  leaderboard.md           # generated
  replies.md               # generated
  segments/*.md            # generated
  campaigns/*.md           # generated
  variants/*.md            # authored + results
  scripts/
    init.py                # build/migrate db
    ingest.py              # scraper csv -> contacts
    segment.py             # build segments
    campaign.py            # generate drafts + log sends
    record.py              # write events (used by pipeline-scan)
    report.py              # regenerate all markdown
    query.py               # ad-hoc query -> markdown table
    common.py             # db helpers, ICP rules, dedup
  exports/                 # CSV snapshots, committed for git + backup
.claude/skills/pipeline-*/ # the slash commands
```

---

## 11. Tech decisions

- **Language:** Python (matches the existing scrapers, no new tooling). SQLite via the
  stdlib `sqlite3`. No heavy dependencies.
- **DB in git:** `pipeline.db` is **gitignored** (binary, churns constantly). The
  committed, diffable record is the CSV snapshots in `pipeline/exports/` plus the
  generated markdown. So git history stays clean and human-readable.
- **Schema as code:** `pipeline/schema.sql` is the single definition; the DB is
  reproducible from it at any time.

---

## 12. Build phases

- **Phase 1 (foundation):** `schema.sql`, `/pipeline-init`, `/pipeline-ingest`,
  `/pipeline-report`, `/pipeline-query`, `DASHBOARD.md`. Outcome: all ~2,700 current
  contacts ingested, deduped, visible, and queryable ("all electricians in Coventry").
- **Phase 2 (the loop):** `/pipeline-segment`, `/pipeline-variant`,
  `/pipeline-campaign`, `/pipeline-scan`, leaderboard with significance gate. Outcome:
  the full test-measure-learn cycle that finds the winning formula.
- **Phase 3 (mobile):** wire the Hermes / DeepSeek Telegram agent to the CLI entrypoints.

---

## 13. Open questions / future

- Instantly API / reply-webhook availability on the current plan (Phase 2). Fallback:
  scan the mailbox behind the sending addresses via Gmail/IMAP. Same `events` table
  either way.
- Sending volume ramp: governed by Instantly warmup caps; start on the 2 to 3k test
  segment, scale the champion.
- **Multi-machine access (Hermes on a VPS):** Phase 1 uses a local SQLite file, which
  only this machine can query live. For the Hermes Telegram agent on a VPS to query the
  same live data, host the DB. Preferred: Neon Postgres (already in use for the app);
  alternative: Turso (hosted SQLite, identical engine). All DB access goes through
  `connect()` in `common.py`, so the swap from local SQLite to a hosted DB is contained.
  Decide and migrate as the first step of Phase 2, before wiring Hermes.
- Region derivation from postcode: simple prefix map for v1; refine later.
- Frozen vs live segment membership: live for v1; add `segment_members` only if needed.
- `dashboard.html` export: build only if reading markdown becomes limiting.
- Capture / anti-bot tooling for the scrapers (operator is sourcing this) feeds
  `/pipeline-ingest` and does not change this design.
