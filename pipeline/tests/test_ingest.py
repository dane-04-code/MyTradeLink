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
