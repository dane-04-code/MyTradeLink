---
name: pipeline-init
description: Create or migrate the outreach pipeline SQLite database from schema.sql. Use when setting up the pipeline for the first time or after the schema changes.
---

# pipeline-init

Builds `pipeline/pipeline.db` from `pipeline/schema.sql`. Idempotent and safe to
re-run. From the repo root:

```bash
python -m pipeline.scripts.init
```
