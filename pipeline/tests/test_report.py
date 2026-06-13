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
