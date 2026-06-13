---
name: pipeline-report
description: Regenerate the outreach pipeline dashboard and CSV snapshot from the database. Use after ingesting contacts or when the user wants an up-to-date overview.
---

# pipeline-report

Regenerates `pipeline/DASHBOARD.md` and `pipeline/exports/contacts.csv` from the
database. From the repo root:

```bash
python -m pipeline.scripts.report
```

Then show the user the totals from `pipeline/DASHBOARD.md`.
