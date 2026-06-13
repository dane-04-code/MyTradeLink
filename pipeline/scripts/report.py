"""Regenerate the markdown dashboard and CSV snapshot from the database."""
import argparse
import csv
from pathlib import Path

from pipeline.scripts.common import connect
from pipeline.scripts.init import DEFAULT_DB

PIPELINE_DIR = Path(__file__).resolve().parents[1]


def _counts(conn, column):
    # Breakdowns count the workable list (ICP 'in') only; excluded leads are
    # reported in the header totals, not in the per-dimension tables.
    return list(conn.execute(
        f"SELECT {column} AS k, COUNT(*) AS n FROM contacts "
        f"WHERE icp_status='in' "
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
    lines.append("_Breakdowns below count ICP (in) contacts only._")
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
