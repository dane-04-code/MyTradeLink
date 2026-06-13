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
