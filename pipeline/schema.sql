-- Outreach Pipeline schema. Reproducible source of truth; pipeline-init runs this.
-- Idempotent: safe to run repeatedly.

CREATE TABLE IF NOT EXISTS contacts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  postcode      TEXT,
  town          TEXT,
  region        TEXT,
  trade         TEXT,
  source        TEXT,
  reg_number    TEXT,
  icp_status    TEXT NOT NULL DEFAULT 'in',
  icp_reason    TEXT,
  stage         TEXT NOT NULL DEFAULT 'scraped',
  date_added    TEXT,
  source_url    TEXT,
  raw           TEXT,
  dedup_key     TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_contacts_trade  ON contacts(trade);
CREATE INDEX IF NOT EXISTS idx_contacts_region ON contacts(region);
CREATE INDEX IF NOT EXISTS idx_contacts_town   ON contacts(town);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_stage  ON contacts(stage);

CREATE TABLE IF NOT EXISTS segments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT UNIQUE NOT NULL,
  description  TEXT,
  definition   TEXT,
  date_created TEXT
);

CREATE TABLE IF NOT EXISTS variants (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT UNIQUE NOT NULL,
  subject       TEXT,
  body_t1       TEXT,
  body_t2       TEXT,
  body_t3       TEXT,
  cta_type      TEXT,
  sequence_type TEXT,
  status        TEXT NOT NULL DEFAULT 'testing',
  notes         TEXT,
  date_created  TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  segment_id   INTEGER REFERENCES segments(id),
  variant_id   INTEGER REFERENCES variants(id),
  status       TEXT NOT NULL DEFAULT 'drafting',
  date_started TEXT,
  notes        TEXT
);

CREATE TABLE IF NOT EXISTS sends (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id     INTEGER NOT NULL REFERENCES contacts(id),
  campaign_id    INTEGER NOT NULL REFERENCES campaigns(id),
  touch_number   INTEGER NOT NULL,
  channel        TEXT NOT NULL DEFAULT 'email',
  gmail_draft_id TEXT,
  sent_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_sends_contact  ON sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_sends_campaign ON sends(campaign_id);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id  INTEGER NOT NULL REFERENCES contacts(id),
  campaign_id INTEGER REFERENCES campaigns(id),
  type        TEXT NOT NULL,
  detected_at TEXT,
  source      TEXT,
  evidence    TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_contact ON events(contact_id);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);
