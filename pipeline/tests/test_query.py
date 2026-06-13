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
