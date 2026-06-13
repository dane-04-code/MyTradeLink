# Outreach Pipeline Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the outreach pipeline foundation: a SQLite contacts database built from scraper CSVs, deduped and ICP-classified, with a markdown dashboard and ad-hoc querying, so all ~2,700 current leads are ingested, visible, and queryable.

**Architecture:** Pure-Python scripts in `pipeline/scripts/` over a single SQLite file (`pipeline/pipeline.db`, gitignored). `schema.sql` is the reproducible source of truth. Four thin Claude Code skills wrap the scripts. The structured data lives in SQLite; the committed, human-readable artifacts are `pipeline/DASHBOARD.md` and `pipeline/exports/contacts.csv`.

**Tech Stack:** Python 3.14 (run as `python`), stdlib `sqlite3` + `csv` (no runtime deps), `pytest` for tests.

**Spec:** `docs/superpowers/specs/2026-06-13-outreach-pipeline-design.md`

---

## Prerequisites

- Run all commands from the repo root `D:\Tradelink`.
- `python --version` is 3.14.x. `python -m pytest --version` is 9.x.
- Source CSVs already exist: `gassafe-scraper/gassafe-leads.csv` (99 rows, columns `business_name,registration_number,address,phone,email,postcode_searched,source_url`) and `niceic-scraper/niceic-leads.csv` (2,610 rows, same columns minus `registration_number`).

## File Structure

```
pipeline/
  schema.sql                  # all 6 tables; idempotent CREATE IF NOT EXISTS
  requirements.txt            # pytest (dev only)
  __init__.py                 # makes `pipeline` a package
  scripts/
    __init__.py
    common.py                 # connect, normalize, region/town, ICP, dedup
    init.py                   # build/migrate db from schema.sql
    ingest.py                 # scraper csv -> contacts
    query.py                  # structured filters -> markdown table
    report.py                 # DASHBOARD.md + exports/contacts.csv
  tests/
    __init__.py
    test_common.py
    test_init.py
    test_ingest.py
    test_query.py
    test_report.py
  DASHBOARD.md                # generated (committed)
  exports/contacts.csv        # generated (committed)
  pipeline.db                 # generated (gitignored)
.claude/skills/
  pipeline-init/SKILL.md
  pipeline-ingest/SKILL.md
  pipeline-query/SKILL.md
  pipeline-report/SKILL.md
```

Phase 1 only populates the `contacts` table, but `schema.sql` defines all six tables now so the database is complete and Phase 2 needs no migration.

---

### Task 1: Package scaffold, schema, and database init

**Files:**
- Create: `pipeline/__init__.py`, `pipeline/scripts/__init__.py`, `pipeline/tests/__init__.py`
- Create: `pipeline/schema.sql`
- Create: `pipeline/scripts/init.py`
- Create: `pipeline/requirements.txt`
- Create: `pipeline/tests/test_init.py`
- Modify: `.gitignore`

- [ ] **Step 1: Create the empty package files**

Create three empty files: `pipeline/__init__.py`, `pipeline/scripts/__init__.py`, `pipeline/tests/__init__.py` (each with a single comment line so the file is non-empty):

```python
# package marker
```

- [ ] **Step 2: Write `pipeline/schema.sql`**

```sql
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
```

- [ ] **Step 3: Write `pipeline/requirements.txt`**

```
pytest>=8
```

- [ ] **Step 4: Add the database to `.gitignore`**

Append to `.gitignore`:

```
# outreach pipeline local database (binary; CSV/markdown snapshots are committed)
/pipeline/pipeline.db
```

- [ ] **Step 5: Write the failing test `pipeline/tests/test_init.py`**

```python
import sqlite3

from pipeline.scripts.init import init_db


def test_init_creates_all_tables(tmp_path):
    db = tmp_path / "test.db"
    init_db(db)
    conn = sqlite3.connect(str(db))
    names = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    )}
    conn.close()
    assert {"contacts", "segments", "variants", "campaigns", "sends", "events"} <= names


def test_init_is_idempotent(tmp_path):
    db = tmp_path / "test.db"
    init_db(db)
    init_db(db)  # second run must not raise
    conn = sqlite3.connect(str(db))
    count = conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
    conn.close()
    assert count == 0
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `python -m pytest pipeline/tests/test_init.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.scripts.init'`

- [ ] **Step 7: Write `pipeline/scripts/init.py`**

```python
"""Build or migrate the pipeline SQLite database from schema.sql. Idempotent."""
import argparse
import sqlite3
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parents[1] / "pipeline.db"
SCHEMA = Path(__file__).resolve().parents[1] / "schema.sql"


def init_db(db_path, schema_path=SCHEMA):
    schema_sql = Path(schema_path).read_text(encoding="utf-8")
    conn = sqlite3.connect(str(db_path))
    try:
        conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()
    return db_path


def main():
    parser = argparse.ArgumentParser(description="Initialise the pipeline database.")
    parser.add_argument("--db", default=str(DEFAULT_DB))
    args = parser.parse_args()
    init_db(args.db)
    print(f"Initialised database at {args.db}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `python -m pytest pipeline/tests/test_init.py -v`
Expected: PASS (2 passed)

- [ ] **Step 9: Commit**

```bash
git add pipeline/__init__.py pipeline/scripts/__init__.py pipeline/tests/__init__.py pipeline/schema.sql pipeline/requirements.txt pipeline/scripts/init.py pipeline/tests/test_init.py .gitignore
git commit -m "feat(pipeline): schema + idempotent db init"
```

---

### Task 2: Normalization, region/town, ICP, and dedup helpers

**Files:**
- Create: `pipeline/scripts/common.py`
- Create: `pipeline/tests/test_common.py`

- [ ] **Step 1: Write the failing test `pipeline/tests/test_common.py`**

```python
from pipeline.scripts.common import (
    normalize_email,
    normalize_phone,
    postcode_area,
    derive_region,
    extract_town,
    classify_icp,
    dedup_key,
)


def test_normalize_email_lowercases_and_strips():
    assert normalize_email("  Dave@Example.CO.UK ") == "dave@example.co.uk"


def test_normalize_email_rejects_garbage():
    assert normalize_email("not an email") == ""
    assert normalize_email("") == ""
    assert normalize_email(None) == ""


def test_normalize_phone_collapses_whitespace():
    assert normalize_phone("  01926   279922 ") == "01926 279922"


def test_postcode_area():
    assert postcode_area("CV1 2NT") == "CV"
    assert postcode_area("M1 1AE") == "M"
    assert postcode_area("") == ""


def test_derive_region_known_and_fallback():
    assert derive_region("CV1 2NT") == "West Midlands"
    assert derive_region("ZZ9 9ZZ") == "ZZ"


def test_extract_town_basic():
    assert extract_town("100 Hatherton Street, Walsall, WS1 1AB") == "Walsall"


def test_extract_town_skips_county():
    assert extract_town("5, The Quadrant, COVENTRY, West Midlands, CV1 2EL") == "Coventry"


def test_classify_icp_excludes_no_email():
    status, reason = classify_icp("Dave Wilson Electrical", "")
    assert status == "excluded"
    assert "email" in reason


def test_classify_icp_excludes_large_orgs():
    status, _ = classify_icp("Walsall Housing Group Limited", "info@whg.com")
    assert status == "excluded"


def test_classify_icp_includes_sole_trader():
    status, reason = classify_icp("Dave Wilson Electrical", "dave@example.com")
    assert status == "in"
    assert reason is None


def test_dedup_key_prefers_email():
    assert dedup_key("X@Y.com", "Biz", "CV1") == "x@y.com"


def test_dedup_key_falls_back_to_business_postcode():
    assert dedup_key("", "Dave's Plumbing", "CV1 2NT") == "dave's plumbing|cv1 2nt"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest pipeline/tests/test_common.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.scripts.common'`

- [ ] **Step 3: Write `pipeline/scripts/common.py`**

```python
"""Shared helpers: db connection, normalization, region/town, ICP, dedup.

The ICP rule and region/town parsing are deliberately simple heuristics for v1
and are expected to be refined as real data shows edge cases.
"""
import re
import sqlite3

# UK postcode area -> region. Minimal v1 map; unknown areas fall back to the
# area letters themselves so nothing is lost.
REGION_BY_AREA = {
    "CV": "West Midlands", "B": "West Midlands", "WS": "West Midlands",
    "WV": "West Midlands", "DY": "West Midlands",
    "M": "Greater Manchester",
    "L": "Merseyside",
    "LS": "West Yorkshire", "BD": "West Yorkshire",
    "S": "South Yorkshire",
    "NE": "North East",
    "BS": "South West", "EX": "South West", "PL": "South West",
    "EH": "Scotland", "G": "Scotland",
    "CF": "Wales", "SA": "Wales",
}

# County / metropolitan names that appear in addresses but are not the town.
COUNTIES = {
    "west midlands", "greater manchester", "merseyside", "west yorkshire",
    "south yorkshire", "tyne and wear", "lancashire", "kent", "essex",
    "surrey", "hampshire", "staffordshire", "warwickshire",
}

# Business-name signals that a lead is NOT our ICP (sole trader / small firm).
ICP_EXCLUDE_KEYWORDS = (
    "housing", "association", "council", "borough", "nhs", "trust",
    "university", "academy", "plc",
)

_POSTCODE_RE = re.compile(r"^[A-Z]{1,2}\d", re.IGNORECASE)


def connect(db_path):
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def normalize_email(email):
    if not email:
        return ""
    e = email.strip().lower()
    if "@" not in e or " " in e:
        return ""
    return e


def normalize_phone(phone):
    if not phone:
        return ""
    return re.sub(r"\s+", " ", phone.strip())


def postcode_area(postcode):
    if not postcode:
        return ""
    m = re.match(r"^([A-Za-z]{1,2})", postcode.strip())
    return m.group(1).upper() if m else ""


def derive_region(postcode):
    area = postcode_area(postcode)
    if not area:
        return ""
    return REGION_BY_AREA.get(area, area)


def extract_town(address):
    if not address:
        return ""
    parts = [p.strip() for p in address.split(",") if p.strip()]
    if parts and _POSTCODE_RE.match(parts[-1]):
        parts = parts[:-1]
    if parts and parts[-1].lower() in COUNTIES:
        parts = parts[:-1]
    if not parts:
        return ""
    return parts[-1].title()


def classify_icp(business_name, email):
    if not normalize_email(email):
        return ("excluded", "no valid email")
    name = (business_name or "").lower()
    for kw in ICP_EXCLUDE_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"\b", name):
            return ("excluded", f"not ICP (matched '{kw}')")
    return ("in", None)


def dedup_key(email, business_name, postcode):
    e = normalize_email(email)
    if e:
        return e
    biz = (business_name or "").strip().lower()
    pc = (postcode or "").strip().lower()
    return f"{biz}|{pc}"
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest pipeline/tests/test_common.py -v`
Expected: PASS (12 passed)

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/common.py pipeline/tests/test_common.py
git commit -m "feat(pipeline): normalization, ICP, region/town, dedup helpers"
```

---

### Task 3: Ingest scraper CSVs into contacts

**Files:**
- Create: `pipeline/scripts/ingest.py`
- Create: `pipeline/tests/test_ingest.py`

- [ ] **Step 1: Write the failing test `pipeline/tests/test_ingest.py`**

```python
import csv

from pipeline.scripts.init import init_db
from pipeline.scripts.common import connect
from pipeline.scripts.ingest import ingest_file

FIELDS = ["business_name", "registration_number", "address", "phone",
          "email", "postcode_searched", "source_url"]


def _write_csv(path, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for r in rows:
            w.writerow(r)


def test_ingest_dedupes_and_classifies(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    csv_path = tmp_path / "gassafe.csv"
    _write_csv(csv_path, [
        {"business_name": "Dave Wilson Electrical", "registration_number": "111",
         "address": "1 High St, Coventry, CV1 2NT", "phone": "0123",
         "email": "dave@example.com", "postcode_searched": "CV1", "source_url": "u"},
        {"business_name": "Dave Wilson Electrical 2", "registration_number": "112",
         "address": "1 High St, Coventry, CV1 2NT", "phone": "0123",
         "email": "DAVE@example.com", "postcode_searched": "CV1", "source_url": "u"},
        {"business_name": "Walsall Housing Group Limited", "registration_number": "113",
         "address": "2 Hatherton St, Walsall, WS1 1AB", "phone": "0124",
         "email": "info@whg.com", "postcode_searched": "WS1", "source_url": "u"},
    ])
    conn = connect(db)
    counts = ingest_file(conn, "gassafe", csv_path=str(csv_path))
    assert counts == {"new": 1, "dupes": 1, "excluded": 1}
    counts2 = ingest_file(conn, "gassafe", csv_path=str(csv_path))
    assert counts2["new"] == 0 and counts2["excluded"] == 0
    conn.close()


def test_ingest_populates_region_town_trade(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    csv_path = tmp_path / "g.csv"
    _write_csv(csv_path, [
        {"business_name": "Sole Trader Plumbing", "registration_number": "1",
         "address": "5, The Quadrant, COVENTRY, West Midlands, CV1 2EL",
         "phone": "1", "email": "a@b.com", "postcode_searched": "CV1",
         "source_url": "u"},
    ])
    conn = connect(db)
    ingest_file(conn, "gassafe", csv_path=str(csv_path))
    row = conn.execute(
        "SELECT town, region, trade, stage FROM contacts"
    ).fetchone()
    assert row["town"] == "Coventry"
    assert row["region"] == "West Midlands"
    assert row["trade"] == "gas"
    assert row["stage"] == "scraped"
    conn.close()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest pipeline/tests/test_ingest.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.scripts.ingest'`

- [ ] **Step 3: Write `pipeline/scripts/ingest.py`**

```python
"""Ingest scraper CSVs into the contacts table: normalize, classify ICP, dedupe."""
import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path

from pipeline.scripts.common import (
    connect, normalize_email, normalize_phone, derive_region, extract_town,
    classify_icp, dedup_key,
)
from pipeline.scripts.init import init_db, DEFAULT_DB

REPO_ROOT = Path(__file__).resolve().parents[2]

# source name -> (csv path relative to repo root, trade, has registration_number)
SOURCES = {
    "gassafe": ("gassafe-scraper/gassafe-leads.csv", "gas", True),
    "niceic": ("niceic-scraper/niceic-leads.csv", "electrical", False),
}


def parse_row(raw, source, trade, has_reg):
    business = (raw.get("business_name") or "").strip()
    postcode = (raw.get("postcode_searched") or "").strip()
    address = (raw.get("address") or "").strip()
    icp_status, icp_reason = classify_icp(business, raw.get("email", ""))
    return {
        "business_name": business,
        "email": normalize_email(raw.get("email", "")),
        "phone": normalize_phone(raw.get("phone", "")),
        "address": address,
        "postcode": postcode,
        "town": extract_town(address),
        "region": derive_region(postcode),
        "trade": trade,
        "source": source,
        "reg_number": (raw.get("registration_number") or "").strip() if has_reg else "",
        "icp_status": icp_status,
        "icp_reason": icp_reason,
        "source_url": (raw.get("source_url") or "").strip(),
        "raw": json.dumps(raw, ensure_ascii=False),
        "dedup_key": dedup_key(raw.get("email", ""), business, postcode),
    }


def ingest_rows(conn, rows, source, trade, has_reg):
    existing = {r[0] for r in conn.execute("SELECT dedup_key FROM contacts")}
    counts = {"new": 0, "dupes": 0, "excluded": 0}
    now = datetime.now(timezone.utc).isoformat()
    for raw in rows:
        contact = parse_row(raw, source, trade, has_reg)
        key = contact["dedup_key"]
        if key in existing:
            counts["dupes"] += 1
            continue
        existing.add(key)
        contact["date_added"] = now
        conn.execute(
            """INSERT INTO contacts
               (business_name,email,phone,address,postcode,town,region,trade,
                source,reg_number,icp_status,icp_reason,stage,date_added,
                source_url,raw,dedup_key)
               VALUES
               (:business_name,:email,:phone,:address,:postcode,:town,:region,
                :trade,:source,:reg_number,:icp_status,:icp_reason,'scraped',
                :date_added,:source_url,:raw,:dedup_key)""",
            contact,
        )
        if contact["icp_status"] == "excluded":
            counts["excluded"] += 1
        else:
            counts["new"] += 1
    conn.commit()
    return counts


def ingest_file(conn, source, csv_path=None, trade=None, has_reg=None):
    rel, default_trade, default_has_reg = SOURCES[source]
    path = Path(csv_path) if csv_path else REPO_ROOT / rel
    trade = trade or default_trade
    has_reg = default_has_reg if has_reg is None else has_reg
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    return ingest_rows(conn, rows, source, trade, has_reg)


def main():
    parser = argparse.ArgumentParser(description="Ingest scraper CSVs into contacts.")
    parser.add_argument("--source", default="all", choices=["all", *SOURCES.keys()])
    parser.add_argument("--db", default=str(DEFAULT_DB))
    args = parser.parse_args()
    init_db(args.db)
    conn = connect(args.db)
    try:
        sources = list(SOURCES.keys()) if args.source == "all" else [args.source]
        for source in sources:
            counts = ingest_file(conn, source)
            print(f"{source}: {counts['new']} new, {counts['dupes']} dupes, "
                  f"{counts['excluded']} excluded")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest pipeline/tests/test_ingest.py -v`
Expected: PASS (2 passed)

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/ingest.py pipeline/tests/test_ingest.py
git commit -m "feat(pipeline): ingest scraper CSVs with dedup + ICP classification"
```

---

### Task 4: Ad-hoc querying to markdown table

**Files:**
- Create: `pipeline/scripts/query.py`
- Create: `pipeline/tests/test_query.py`

- [ ] **Step 1: Write the failing test `pipeline/tests/test_query.py`**

```python
from pipeline.scripts.init import init_db
from pipeline.scripts.common import connect
from pipeline.scripts.query import query_contacts, to_markdown_table


def _seed(conn):
    rows = [
        ("Spark Electrics", "electrical", "Coventry", "West Midlands", "scraped"),
        ("Volt Bros", "electrical", "Manchester", "Greater Manchester", "scraped"),
        ("Gas Joe", "gas", "Coventry", "West Midlands", "replied"),
    ]
    for biz, trade, town, region, stage in rows:
        conn.execute(
            "INSERT INTO contacts "
            "(business_name,trade,town,region,stage,icp_status,dedup_key) "
            "VALUES (?,?,?,?,?, 'in', ?)",
            (biz, trade, town, region, stage, biz),
        )
    conn.commit()


def test_query_filters_by_trade_and_town(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    conn = connect(db)
    _seed(conn)
    rows = query_contacts(conn, {"trade": "electrical", "town": "Coventry"})
    assert len(rows) == 1
    assert rows[0]["business_name"] == "Spark Electrics"
    conn.close()


def test_query_not_contacted_excludes_replied(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    conn = connect(db)
    _seed(conn)
    rows = query_contacts(conn, {"trade": "gas", "not_contacted": True})
    assert rows == []
    conn.close()


def test_to_markdown_table_renders_rows():
    md = to_markdown_table([{"id": 1, "business_name": "Spark Electrics"}],
                           columns=["id", "business_name"])
    assert "| id | business_name |" in md
    assert "| 1 | Spark Electrics |" in md


def test_to_markdown_table_empty():
    assert to_markdown_table([]) == "_No matching contacts._"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest pipeline/tests/test_query.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.scripts.query'`

- [ ] **Step 3: Write `pipeline/scripts/query.py`**

```python
"""Ad-hoc querying over contacts -> markdown table.

The natural-language -> flags step lives in the pipeline-query skill; this
module takes structured filters and is fully deterministic / testable.
"""
import argparse

from pipeline.scripts.common import connect
from pipeline.scripts.init import DEFAULT_DB

DEFAULT_COLUMNS = ["id", "business_name", "trade", "town", "region",
                   "email", "phone", "stage", "icp_status"]


def build_query(filters, columns=DEFAULT_COLUMNS, limit=None):
    where, params = [], []
    for col in ("trade", "source", "icp_status", "stage"):
        if filters.get(col):
            where.append(f"{col} = ?")
            params.append(filters[col])
    for col in ("town", "region"):
        if filters.get(col):
            where.append(f"LOWER({col}) LIKE ?")
            params.append(f"%{filters[col].lower()}%")
    if filters.get("not_contacted"):
        where.append("stage IN ('scraped','qualified','segmented')")
    sql = f"SELECT {', '.join(columns)} FROM contacts"
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " ORDER BY business_name"
    if limit:
        sql += f" LIMIT {int(limit)}"
    return sql, params


def query_contacts(conn, filters, columns=DEFAULT_COLUMNS, limit=None):
    sql, params = build_query(filters, columns, limit)
    return [dict(r) for r in conn.execute(sql, params)]


def to_markdown_table(rows, columns=DEFAULT_COLUMNS):
    if not rows:
        return "_No matching contacts._"
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join("---" for _ in columns) + " |"
    lines = [header, sep]
    for row in rows:
        cells = ["" if row.get(c) is None else str(row.get(c)) for c in columns]
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Query contacts -> markdown table.")
    parser.add_argument("--db", default=str(DEFAULT_DB))
    parser.add_argument("--trade")
    parser.add_argument("--town")
    parser.add_argument("--region")
    parser.add_argument("--source")
    parser.add_argument("--icp-status", dest="icp_status")
    parser.add_argument("--stage")
    parser.add_argument("--not-contacted", action="store_true", dest="not_contacted")
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    filters = {k: v for k, v in vars(args).items()
               if k not in ("db", "limit") and v}
    conn = connect(args.db)
    try:
        rows = query_contacts(conn, filters, limit=args.limit)
    finally:
        conn.close()
    print(to_markdown_table(rows))
    print(f"\n_{len(rows)} contacts._")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest pipeline/tests/test_query.py -v`
Expected: PASS (4 passed)

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/query.py pipeline/tests/test_query.py
git commit -m "feat(pipeline): ad-hoc contact querying to markdown table"
```

---

### Task 5: Dashboard + CSV snapshot generation

**Files:**
- Create: `pipeline/scripts/report.py`
- Create: `pipeline/tests/test_report.py`

- [ ] **Step 1: Write the failing test `pipeline/tests/test_report.py`**

```python
from pipeline.scripts.init import init_db
from pipeline.scripts.common import connect
from pipeline.scripts.report import generate_dashboard, write_reports


def _seed(conn):
    rows = [("A", "gas", "gassafe", "in"), ("B", "electrical", "niceic", "in"),
            ("C", "electrical", "niceic", "excluded")]
    for biz, trade, source, icp in rows:
        conn.execute(
            "INSERT INTO contacts "
            "(business_name,trade,source,icp_status,stage,dedup_key) "
            "VALUES (?,?,?,?, 'scraped', ?)",
            (biz, trade, source, icp, biz),
        )
    conn.commit()


def test_dashboard_reports_totals(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    conn = connect(db)
    _seed(conn)
    md = generate_dashboard(conn)
    assert "**Total contacts:** 3" in md
    assert "**ICP (in):** 2" in md
    assert "gassafe" in md and "niceic" in md
    conn.close()


def test_write_reports_creates_files(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    conn = connect(db)
    _seed(conn)
    write_reports(conn, tmp_path)
    assert (tmp_path / "DASHBOARD.md").exists()
    assert (tmp_path / "exports" / "contacts.csv").exists()
    conn.close()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python -m pytest pipeline/tests/test_report.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'pipeline.scripts.report'`

- [ ] **Step 3: Write `pipeline/scripts/report.py`**

```python
"""Regenerate the markdown dashboard and CSV snapshot from the database."""
import argparse
import csv
from pathlib import Path

from pipeline.scripts.common import connect
from pipeline.scripts.init import DEFAULT_DB

PIPELINE_DIR = Path(__file__).resolve().parents[1]


def _counts(conn, column):
    return list(conn.execute(
        f"SELECT {column} AS k, COUNT(*) AS n FROM contacts "
        f"GROUP BY {column} ORDER BY n DESC"
    ))


def generate_dashboard(conn):
    total = conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
    in_icp = conn.execute(
        "SELECT COUNT(*) FROM contacts WHERE icp_status='in'"
    ).fetchone()[0]
    lines = ["# Pipeline Dashboard", ""]
    lines.append(f"**Total contacts:** {total}  ")
    lines.append(f"**ICP (in):** {in_icp}  ")
    lines.append(f"**Excluded:** {total - in_icp}")
    lines.append("")
    for title, col in [("By source", "source"), ("By trade", "trade"),
                       ("By region", "region"), ("By stage", "stage")]:
        lines.append(f"## {title}")
        lines.append("")
        lines.append(f"| {col} | count |")
        lines.append("| --- | --- |")
        for r in _counts(conn, col):
            lines.append(f"| {r['k'] or '(blank)'} | {r['n']} |")
        lines.append("")
    return "\n".join(lines)


def export_contacts_csv(conn, out_path):
    cols = ["id", "business_name", "email", "phone", "town", "region",
            "trade", "source", "icp_status", "icp_reason", "stage"]
    rows = conn.execute(f"SELECT {', '.join(cols)} FROM contacts ORDER BY id")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in rows:
            w.writerow([r[c] for c in cols])


def write_reports(conn, out_dir=PIPELINE_DIR):
    out_dir = Path(out_dir)
    (out_dir / "DASHBOARD.md").write_text(
        generate_dashboard(conn), encoding="utf-8"
    )
    export_contacts_csv(conn, out_dir / "exports" / "contacts.csv")


def main():
    parser = argparse.ArgumentParser(description="Regenerate dashboard + exports.")
    parser.add_argument("--db", default=str(DEFAULT_DB))
    parser.add_argument("--out", default=str(PIPELINE_DIR))
    args = parser.parse_args()
    conn = connect(args.db)
    try:
        write_reports(conn, args.out)
    finally:
        conn.close()
    print(f"Wrote {args.out}/DASHBOARD.md and {args.out}/exports/contacts.csv")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `python -m pytest pipeline/tests/test_report.py -v`
Expected: PASS (2 passed)

- [ ] **Step 5: Run the full suite**

Run: `python -m pytest pipeline/tests -v`
Expected: PASS (all tests, 22 total)

- [ ] **Step 6: Commit**

```bash
git add pipeline/scripts/report.py pipeline/tests/test_report.py
git commit -m "feat(pipeline): dashboard + CSV snapshot generation"
```

---

### Task 6: Claude Code skill wrappers

**Files:**
- Create: `.claude/skills/pipeline-init/SKILL.md`
- Create: `.claude/skills/pipeline-ingest/SKILL.md`
- Create: `.claude/skills/pipeline-query/SKILL.md`
- Create: `.claude/skills/pipeline-report/SKILL.md`

- [ ] **Step 1: Write `.claude/skills/pipeline-init/SKILL.md`**

```markdown
---
name: pipeline-init
description: Create or migrate the outreach pipeline SQLite database from schema.sql. Use when setting up the pipeline for the first time or after the schema changes.
---

# pipeline-init

Builds `pipeline/pipeline.db` from `pipeline/schema.sql`. Idempotent and safe to
re-run. From the repo root:

```bash
python -m pipeline.scripts.init
```
```

- [ ] **Step 2: Write `.claude/skills/pipeline-ingest/SKILL.md`**

```markdown
---
name: pipeline-ingest
description: Ingest scraper lead CSVs into the outreach pipeline contacts database (normalize, dedupe, classify ICP). Use when new leads have been scraped or the user asks to load or refresh contacts.
---

# pipeline-ingest

Loads scraper CSVs into `pipeline/pipeline.db`. From the repo root:

```bash
python -m pipeline.scripts.ingest --source all
```

Options: `--source gassafe|niceic|all`. Creates the database if missing, dedupes
by email (then business + postcode), classifies ICP, and prints
"<source>: N new, N dupes, N excluded". After ingesting, run /pipeline-report.
```

- [ ] **Step 3: Write `.claude/skills/pipeline-query/SKILL.md`**

```markdown
---
name: pipeline-query
description: Answer ad-hoc questions about outreach contacts (e.g. "all electricians in Coventry", "gas engineers in Manchester not yet contacted") as a markdown table. Use when the user asks who or how many contacts match some criteria.
---

# pipeline-query

Translate the user's plain-English question into flags, run the query from the
repo root, and show the markdown table it prints.

```bash
python -m pipeline.scripts.query --trade electrical --town Coventry
```

Flag mapping:
- electrician/electrical -> `--trade electrical`; gas/gas engineer -> `--trade gas`
- a place name -> `--town <place>`, or `--region "<region>"` for a wider area
- "not contacted" / "haven't emailed" -> `--not-contacted`
- a source -> `--source gassafe|niceic`
- "excluded / not ICP" -> `--icp-status excluded`; "ICP only" -> `--icp-status in`
- cap rows with `--limit N`

Show the table to the user. (In Phase 2, offer to save the result as a segment.)
```

- [ ] **Step 4: Write `.claude/skills/pipeline-report/SKILL.md`**

```markdown
---
name: pipeline-report
description: Regenerate the outreach pipeline dashboard and CSV snapshot from the database. Use after ingesting contacts or when the user wants an up-to-date overview.
---

# pipeline-report

Regenerates `pipeline/DASHBOARD.md` and `pipeline/exports/contacts.csv` from the
database. From the repo root:

```bash
python -m pipeline.scripts.report
```

Then show the user the totals from `pipeline/DASHBOARD.md`.
```

- [ ] **Step 5: Verify the skills are discoverable**

Confirm the four files exist:

Run: `ls .claude/skills`
Expected: `pipeline-init  pipeline-ingest  pipeline-query  pipeline-report`

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/pipeline-init .claude/skills/pipeline-ingest .claude/skills/pipeline-query .claude/skills/pipeline-report
git commit -m "feat(pipeline): claude code skill wrappers for init/ingest/query/report"
```

---

### Task 7: Real ingest run and committed artifacts

This task runs the real data through the pipeline and commits the generated
markdown + CSV snapshot (the database itself stays gitignored).

- [ ] **Step 1: Initialise and ingest the real CSVs**

Run:
```bash
python -m pipeline.scripts.ingest --source all
```
Expected: two lines like `gassafe: ~90 new, ~0 dupes, ~5 excluded` and
`niceic: ~2400 new, ~50 dupes, ~150 excluded`. Exact numbers will vary; what
matters is that gassafe totals near 99 and niceic near 2,610 across
new+dupes+excluded.

- [ ] **Step 2: Generate the dashboard + snapshot**

Run:
```bash
python -m pipeline.scripts.report
```
Expected: `Wrote .../pipeline/DASHBOARD.md and .../pipeline/exports/contacts.csv`

- [ ] **Step 3: Sanity-check a query**

Run:
```bash
python -m pipeline.scripts.query --trade electrical --town Coventry --limit 5
```
Expected: a markdown table of Coventry electricians (or "_No matching contacts._"
if none were scraped in that town), then a `_N contacts._` line. Try
`--trade gas --not-contacted --limit 5` as well.

- [ ] **Step 4: Confirm the database is gitignored**

Run: `git status --short pipeline/`
Expected: `pipeline/DASHBOARD.md` and `pipeline/exports/contacts.csv` show as
new/modified; `pipeline/pipeline.db` does NOT appear.

- [ ] **Step 5: Commit the generated artifacts**

```bash
git add pipeline/DASHBOARD.md pipeline/exports/contacts.csv
git commit -m "chore(pipeline): ingest current gassafe + niceic leads, generate dashboard"
```

- [ ] **Step 6: Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage (Phase 1 scope):**
- SQLite engine + schema as code -> Task 1 (`schema.sql`, `init.py`).
- `contacts` table with all spec columns -> Task 1 schema (plus `dedup_key`, an
  implementation column for the unique dedup constraint).
- Dedup by email, fallback business+postcode -> Task 2 `dedup_key` + Task 3 ingest.
- ICP classification with reasons -> Task 2 `classify_icp` + Task 3.
- Region/town derivation -> Task 2 `derive_region` / `extract_town`.
- `/pipeline-init`, `/pipeline-ingest`, `/pipeline-query`, `/pipeline-report` ->
  Task 6 skill wrappers over Tasks 1, 3, 4, 5.
- DASHBOARD.md + CSV export, DB gitignored -> Task 5 + Task 1 gitignore + Task 7.
- All ~2,700 contacts ingested and queryable -> Task 7.
- The other five tables (segments/variants/campaigns/sends/events) are created by
  the schema now but populated in Phase 2; intentionally out of Phase 1 scope.

**Placeholder scan:** No TBD/TODO/"handle edge cases" steps; every code step has
complete code; every run step has an expected result.

**Type/name consistency:** `init_db`, `connect`, `dedup_key`, `classify_icp`,
`derive_region`, `extract_town`, `ingest_file`, `query_contacts`,
`to_markdown_table`, `generate_dashboard`, `write_reports`, `DEFAULT_DB`,
`SOURCES` are defined once and referenced with the same signatures throughout.
Column list in `export_contacts_csv` and `DEFAULT_COLUMNS` use only columns
defined in `schema.sql`.
```
