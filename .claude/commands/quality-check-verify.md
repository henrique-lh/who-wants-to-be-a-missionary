---
description: Run pytest, ruff, and mypy on current changes
---

# Quality Check — Verify

Run the **mechanical verification tier** (steps 1–3) on your current changes in `src/`.

Read [`.claude/quality-check-reference.md`](../quality-check-reference.md) first for scope, tooling, fast-path hints, and the verify-tier report template.

Use this command alone for a quick test, ruff, and typecheck pass after a fix. When invoked as part of `/quality-check`, do not proceed to review or audit if this tier fails.

## Pipeline (run in this order)

### 1. Tests

From the repository root, run the feature files the diff touches:

```bash
uv run pytest src/backend_genesis/<slice>/tests.py
```

Then, when `src/` changed, run the suite:

```bash
make test
```

- `make up` first if PostgreSQL is not already answering.
- Fix only failures caused by the current changes, then re-run.
- A model change that ships without a migration fails `src/backend_genesis/migrations/tests.py`. That failure belongs to this step.
- If the diff has no `src/` changes, mark this step **pass (skipped)**.

### 2. Ruff

Follow the Ruff section in [`.claude/quality-check-reference.md`](../quality-check-reference.md).

If no Python or ruff config changed, mark this step **pass (skipped)**.

### 3. Typecheck

From the repository root:

```bash
uv run mypy
```

Fix type errors introduced by the change. Do not finish until this step passes or is skipped (no `src/` Python changes).

## Final report

Emit the **verify-tier report** from [`.claude/quality-check-reference.md`](../quality-check-reference.md).
