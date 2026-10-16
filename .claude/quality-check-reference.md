# Quality Check — Shared Reference

Shared scope, tooling, and report templates for `/quality-check` and its sub-commands. Read this file at the start of any quality-check tier.

## Scope

1. Use `git status` and `git diff` (staged, unstaged, and untracked) to list changed files.
2. Application code lives in `src/backend_genesis/`. Schema changes live in Alembic revisions next to that package. Product decisions live in `docs/prd/`. The root `CLAUDE.md` is the map of slices, errors, time, and soft delete.
3. Limit code fixes to `src/`. Step 8 (blast-radius and docs sync) may also update the canonical docs listed in that step.
4. If nothing in those trees changed, say so and stop.

## Tooling

Run every command from the repository root. Tests need Docker (PostgreSQL and VersityGW). `make up` starts them.

### Tests

One feature:

```bash
uv run pytest src/backend_genesis/<slice>/tests.py
```

Drop `-n auto` for a single file. The full suite is `make test` (`pytest -n auto`). Specs are `tests.py` beside the feature.

After a fix, re-run the feature file. Re-run `make test` before closing the verify tier when `src/` changed.

### Ruff

```bash
uv run ruff check <paths>
uv run ruff format --check <paths>
```

When `pyproject.toml` ruff settings changed, run `make lint` instead.

Fix with `uv run ruff check --fix <paths>` and `uv run ruff format <paths>`, then re-run the checks on those paths.

### Typecheck

```bash
uv run mypy
```

That is `make typecheck`.

## Common rules

- Every pipeline step is strict. A pass with no findings is valid only when the changed code satisfies the guideline for that step.
- Slice, contract, and blast-radius steps (4–6, 8) flag only what the current diff introduces or extends. Skip them when the diff has no relevant trigger.
- Simplicity is an output standard. When fixing a finding, prefer deleting or inlining over a new helper. Keep the fix inside the current work.
- Fix in place. Re-run the touched tests, ruff, and `uv run mypy` after code fixes.
- A commit the user already asked for is not blocked by this pipeline. `git-workflow` owns that rule. This command does not commit or push on its own.

## Fast-path skip hints

Skipped steps still appear in the report as **pass (skipped)**.

- **No `src/` changes** (docs or agent files only): skip tests, ruff, and mypy. Still run blast-radius/docs when a canonical doc could be stale.
- **Tests-only**: still run the touched `tests.py` and ruff. Skip the slice-shape step when production modules are untouched.
- **No new route, error, or response field**: skip the contract step.
- **No model, query, or datetime change**: skip the persistence step.
- **No contract or docs trigger** (no exported behavior, route, error code, schema, or canonical-doc claim changed): skip blast-radius and docs sync.
- **No in-scope changes at all**: stop before running any tier.

## Report templates

Report every finding from the review and audit steps, including minor ones. Group by severity when helpful (blocking, should-fix, nitpick).

Leave out explanations for steps that pass with zero findings. Elaborate on every step that has issues or required fixes.

If a step fails and cannot be fixed without the user, stop and say what is blocking.

### Full pipeline (`/quality-check`)

```markdown
## Quality check

**Scope:** [N] files in src/

| Step | Status | Notes |
| --- | --- | --- |
| Tests | pass/fail/skipped | |
| Ruff | pass/fail/skipped | |
| Typecheck | pass/fail/skipped | |
| Slice shape | pass/fail/skipped | |
| Contract | pass/fail/skipped | |
| Persistence | pass/fail/skipped | |
| Code quality | pass/fail | |
| Blast-radius + docs | pass/fail/skipped | |
| Security | pass/fail | |
| Performance | pass/fail | |

**Fixes applied:** [brief list, or "none"]

**Remaining issues:** [all unfixed findings, or "none"]
```

### Verify tier (`/quality-check-verify`)

```markdown
## Quality check — verify

**Scope:** [N] files in src/

| Step | Status | Notes |
| --- | --- | --- |
| Tests | pass/fail/skipped | |
| Ruff | pass/fail/skipped | |
| Typecheck | pass/fail/skipped | |

**Fixes applied:** [brief list, or "none"]

**Remaining issues:** [all unfixed findings, or "none"]
```

### Review tier (`/quality-check-review`)

```markdown
## Quality check — review

**Scope:** [N] files in src/

| Step | Status | Notes |
| --- | --- | --- |
| Slice shape | pass/fail/skipped | |
| Contract | pass/fail/skipped | |
| Persistence | pass/fail/skipped | |
| Code quality | pass/fail | |
| Blast-radius + docs | pass/fail/skipped | |

**Fixes applied:** [brief list, or "none"]

**Remaining issues:** [all unfixed findings, or "none"]
```

### Audit tier (`/quality-check-audit`)

```markdown
## Quality check — audit

**Scope:** [N] files in src/

| Step | Status | Notes |
| --- | --- | --- |
| Security | pass/fail | |
| Performance | pass/fail | |

**Fixes applied:** [brief list, or "none"]

**Remaining issues:** [all unfixed findings, or "none"]
```
