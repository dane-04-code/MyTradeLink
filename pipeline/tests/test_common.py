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
