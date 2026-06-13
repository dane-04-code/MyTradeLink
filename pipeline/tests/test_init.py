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
