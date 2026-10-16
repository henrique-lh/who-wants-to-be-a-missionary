---
description: Run slice, contract, persistence, code-quality, and blast-radius/docs checks on current changes
---

# Quality Check — Review

Run the **code review tier** (steps 4–8) on your current changes in `src/`.

Read [`.claude/quality-check-reference.md`](../quality-check-reference.md) first for scope, common rules, fast-path hints, and the review-tier report template.

Use this command alone for a targeted slice / contract / persistence / code-quality / blast-radius pass. When invoked as part of `/quality-check`, run only after the verify tier passes.

The authority for product behavior is the root `CLAUDE.md`. The authority for how to write the diff is `.claude/CLAUDE.md` and `.claude/rules/coding-style.md`. Where a personal rule and the application disagree, the application wins: one directory per capability under `src/backend_genesis/`, reads in `queries.py`, writes in the router that commits, failures are `DomainError` subclasses, and closed sets are `StrEnum` in `enums.py`.

## Pipeline (run in this order)

### 4. Slice shape

Review changed Python under `src/backend_genesis/`.

If the diff does not add or move production code, mark this step **pass (skipped)**.

**Be rigorous.** Flag any of these in the diff:

- A new `services/`, `repositories/`, or `utils/` package. Cross-cutting code stays at the package root (`config.py`, `database.py`, `errors.py`, `clock.py`, `main.py`). Everything else is a slice.
- A read that decides whether a row still exists, written in a router instead of `queries.py`.
- A write that commits outside the router that owns the request. A service class appears only where the logic will not fit in the router. A pure rule is a pure function (`students/overlap.py`, `absences/counting.py`, `documents/formats.py`).
- A new file that ignores the slice vocabulary already in use: `models.py`, `enums.py`, `constants.py`, `errors.py`, `queries.py`, `routes.py`, and extra routers named for what they do (`photos.py`, `removal.py`, `scope.py`). Tests are `tests.py` next to the feature.
- Domain vocabulary in Portuguese inside identifiers. Prose and docstrings may use the Institute's words. Code stays English (`enrolment`, `class_group`, `guardian`).

If the change matches the surrounding slice, mark this step **pass**.

### 5. Contract

Review new or changed routes, errors, and response models.

If the diff has none of those, mark this step **pass (skipped)**.

The patterns already in the tree:

- Every deliberate failure is a `DomainError` subclass owned by the slice, with `code` and `status_code`. The body is `{code, message}` (`ErrorBody` in `errors.py`).
- The route declares those failures with `failures(...)` so OpenAPI carries them. `make error-codes` walks the class tree. A code that exists only in a comment is invisible to the front-end.
- `code` is stable. `message` is text for a person and may be reworded. Nothing in this repository branches on `message`.
- A request the framework rejects is `malformed_request`. A new failure uses the same handler, not a one-off `JSONResponse`.
- Authentication answers who the requester is. What they may do comes from `participations`, read from the database on the request. A token does not carry scope.

If the diff only uses this contract, mark this step **pass**.

### 6. Persistence

Review model, query, and datetime changes.

**Be pragmatic.** Skip with **pass (skipped)** when the diff has no model, query, or clock change.

Flag:

- A read that omits `deleted_at.is_(None)` on the row, or on a parent the row hangs from. There is no global filter.
- A unique constraint that is not a partial index `where deleted_at is null`.
- A physical `DELETE`. Removal of a student or a document is `POST` to the named path in `students/removal.py` or `documents/removal.py`.
- `datetime.now` or `date.today` for "what day is it at the Institute". That question goes through `clock.py`. Weekly slots are São Paulo wall clock without a zone. Moment columns are UTC with a zone.
- A model change with no Alembic revision in the same diff. `migrations/tests.py` fails when the schema and the models disagree. `make migration m="..."` is part of the change.
- A `StrEnum` value compared as a raw literal when `enums.py` in that slice already names it.

If the diff follows these rules, mark this step **pass**.

### 7. Code quality

Read `.claude/CLAUDE.md` (Less Is More, Coding) and `.claude/rules/coding-style.md`.

Review changed files under `src/` against those guidelines and against the surrounding file.

**Be rigorous.** Flag bugs, behavior that disagrees with `CLAUDE.md`, naming that breaks the file around it, duplication past a third copy, dead code, commented-out code, leftover prints, a new abstraction with a single caller, and scope past the current change.

Apply the simplicity check to the diff:

- Note net lines as a signal, not a rule.
- List new files and functions. Each one needs a reason the existing module could not hold it.
- Flag drive-by refactors.

Read the full file when the diff is hard to judge alone. Legacy issues inside a file you are already changing are in scope. Legacy issues in untouched files are not.

Match what the package already does:

- Python 3.12 types: `list[str]`, `X | None`. Import from `typing` only what builtins cannot say.
- Google docstrings on modules, classes, and functions, as the neighboring file does.
- Async SQLAlchemy 2. The application is built by `create_app(settings)`. Nothing reads the environment at import time.
- Tests call `create_app` with their own `Settings` and enter through `enter_as` / `admin_headers` in `conftest.py`.

If the diff satisfies this, mark this step **pass**.

Simplicity lives in this step. Step 8 is caller and doc consistency.

### 8. Blast-radius and docs sync

Check whether the **current diff** leaves a broken caller or makes a canonical doc false.

**Be pragmatic.** Run the full check only when a trigger below is present. Otherwise mark **pass (skipped)**.

#### When this applies

- A public function, route, or response field changes name, arity, or behavior.
- An error `code` or a `StrEnum` value other slices already store is renamed or removed.
- A column or relationship changes meaning.
- A command, path, or rule described in a canonical doc is now wrong.

Skip when the diff is comments-only, formatting-only, or tests that do not change production behavior.

#### Code impact

1. List the contract surfaces the diff changed.
2. Search callers under `src/backend_genesis/`.
3. Fix call sites that still use the old name, arity, code, or column, and broken imports the change introduced.
4. Leave unrelated cleanups and untouched legacy callers alone.

A new router is included from `create_app` in `main.py`, the same way the existing slices are.

#### Docs impact

| Doc | Check when |
| --- | --- |
| `CLAUDE.md` | Slices, commands, errors, time, or soft delete changed |
| `README.md` | A domain rule this change contradicted |
| `docs/prd/` | The change records or contradicts a product decision |
| `.claude/skills/**`, `.claude/commands/**`, `.claude/quality-check-reference.md` | An agent workflow this change proves stale |

Update a doc when this change made a claim false. Leave style rewrites and new policy alone. If the doc change is large or contested, report it instead of rewriting it.

#### Outcome

- **pass** — callers and listed docs match the change
- **fail** — a broken caller or a false doc remains
- **pass (skipped)** — no trigger in the diff

## Final report

Emit the **review-tier report** from [`.claude/quality-check-reference.md`](../quality-check-reference.md).
