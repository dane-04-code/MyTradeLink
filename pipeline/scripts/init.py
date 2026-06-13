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
