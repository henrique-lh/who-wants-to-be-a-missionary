---
description: Run security and performance checks on current changes
---

# Quality Check — Audit

Run the **security and performance tier** (steps 9–10) on your current changes in `src/`.

Read [`.claude/quality-check-reference.md`](../quality-check-reference.md) first for scope, fast-path hints, and the audit-tier report template.

Use this command alone for a targeted security or performance pass. When invoked as part of `/quality-check`, run only after the verify and review tiers pass.

Steps 9 and 10 are independent. Review them in parallel when running the full pipeline.

There is no separate security or performance manual. The checks below are the rules the application already follows, from the root `CLAUDE.md`.

## Pipeline

### 9. Security

Review every changed file under `src/`. Read the whole file when the diff touches auth, a participation, a document, or a delete.

Flag:

- A permission decision taken from the token, or cached on it. `auth` answers who is asking. `participations` answers what they may do, from the database, on that request.
- `GLOBAL_ADMIN` stored as a participation. The global administrator is the Genesis email.
- A query that returns a soft-deleted row, or a child of a soft-deleted parent, to a caller who asked for the live set.
- A new physical delete. The only ones are the named `POST` routes in `students/removal.py` and `documents/removal.py`.
- An access code, refresh token, or secret written to a log, a response, or the repository. `.env` is local. Nothing secret is committed.
- A route that skips the participation check the neighboring route in the same slice performs.
- A failure body that is not `{code, message}`, or a branch on `message`.

If none of these apply to the diff, mark this step **pass**.

### 10. Performance

Review every changed file. Flag:

- A query with no bound that can grow with the table (a list of students, documents, or lessons with no project or class-group scope).
- A new filter or join column with no index, on a path that runs per request.
- Lazy relationship access inside a loop on an async session (one query per row).
- Sync network or disk I/O inside an async route.
- A timer whose job is to keep the process awake. The free host hibernates, and a ping opens a database connection billed by the hour.
- Loading an original photograph where the caller asked for a roster. The lesson route serves the reduced copy.

If none of these apply to the diff, mark this step **pass**.

## Final report

Emit the **audit-tier report** from [`.claude/quality-check-reference.md`](../quality-check-reference.md).
