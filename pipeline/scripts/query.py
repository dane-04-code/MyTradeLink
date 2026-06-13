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
    if limit is not None:
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
