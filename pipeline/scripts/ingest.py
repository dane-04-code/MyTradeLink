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
