---
name: pipeline-query
description: Answer ad-hoc questions about outreach contacts (e.g. "all electricians in Coventry", "gas engineers in Manchester not yet contacted") as a markdown table. Use when the user asks who or how many contacts match some criteria.
---

# pipeline-query

Translate the user's plain-English question into flags, run the query from the
repo root, and show the markdown table it prints.

```bash
python -m pipeline.scripts.query --trade electrical --town Coventry
```

Flag mapping:
- electrician/electrical -> `--trade electrical`; gas/gas engineer -> `--trade gas`
- a place name -> `--town <place>`, or `--region "<region>"` for a wider area
- "not contacted" / "haven't emailed" -> `--not-contacted`
- a source -> `--source gassafe|niceic`
- "excluded / not ICP" -> `--icp-status excluded`; "ICP only" -> `--icp-status in`
- cap rows with `--limit N`

Show the table to the user. (In Phase 2, offer to save the result as a segment.)
