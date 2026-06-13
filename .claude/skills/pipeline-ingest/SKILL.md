---
name: pipeline-ingest
description: Ingest scraper lead CSVs into the outreach pipeline contacts database (normalize, dedupe, classify ICP). Use when new leads have been scraped or the user asks to load or refresh contacts.
---

# pipeline-ingest

Loads scraper CSVs into `pipeline/pipeline.db`. From the repo root:

```bash
python -m pipeline.scripts.ingest --source all
```

Options: `--source gassafe|niceic|all`. Creates the database if missing, dedupes
by email (then business + postcode), classifies ICP, and prints
"<source>: N new, N dupes, N excluded". After ingesting, run /pipeline-report.
