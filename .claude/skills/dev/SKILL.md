---
name: dev
description: >-
  Pre-coding development philosophy: simplicity, minimal diffs, read existing
  patterns before writing code. Use before writing feature code, when the user
  runs /dev, and when implement-issue starts a (CODE) checklist item.
---

# Dev

Coding-only mindset, applied before and during implementation. Issue, branch, and PR workflow stay in `implement-issue` and `git-workflow`.

**Invocation:** read and apply this skill before the first line of feature code. `implement-issue` does that before each `(CODE)` checklist item. `/dev` on its own is the same gate for work that is not an issue.

Product rules: root `CLAUDE.md`. How to write the diff: `.claude/CLAUDE.md` and `.claude/rules/coding-style.md`. Where a personal rule and the application disagree, follow the application.

## Pre-coding gate

Complete these steps before the first line of feature code for the current change.

### 1. Restate the smallest change

One sentence: what is the minimal diff that satisfies this checklist item or request?

### 2. Read existing patterns

Search and read the slice you are about to touch. Slices live in `src/backend_genesis/<capability>/`.

- `models.py` holds the tables. `queries.py` holds every read, including `deleted_at.is_(None)` on the row and on the parents it hangs from.
- The router commits the write and translates errors. A pure rule is a function in the slice (`overlap.py`, `counting.py`, `formats.py`).
- Failures are `DomainError` subclasses in the slice's `errors.py`, each with `code` and `status_code`. Routes list them with `failures(...)`.
- Closed sets are `StrEnum` in `enums.py`.
- "Today" comes from `clock.py`. Weekly slots are São Paulo wall clock. Moment columns are UTC with a zone.
- Tests are `tests.py` next to the feature. They build the app with `create_app(settings)` and sign in through `enter_as` / `admin_headers`.

Match the density and structure of the file next to yours.

### 3. Challenge the plan

For each file or symbol you intend to add, ask whether an existing path can take the change.

- A new slice needs a capability that no current directory owns. Wire its router from `create_app` in `main.py`.
- A new module inside a slice needs a reason `routes.py` or `queries.py` cannot hold it.
- A model change includes the Alembic revision in the same work. `migrations/tests.py` fails without it.

### 4. Apply the simplicity checklist

From `.claude/CLAUDE.md`:

| Principle | Apply before coding |
| --- | --- |
| Every line has a purpose | Drop anything that does not serve this change |
| Deletion beats addition | Look for a removal or a reuse before adding |
| Challenge every addition | A helper, wrapper, or parallel map needs a payoff now |
| No scope creep | No drive-by refactor and no speculative branch |

Output checklist:

1. What is the smallest change that solves the stated problem?
2. Does each new symbol or file have no existing home?
3. Can any planned line be omitted without losing behavior?
4. Is any code preparing for a hypothetical later need? Remove it.

## During coding

- Identifiers are English. Domain prose may stay in Portuguese.
- Raise a `DomainError`. Let the shared handler write `{code, message}`. Do not branch on `message`.
- Who the requester is comes from `auth`. What they may do comes from `participations`, on this request.
- Soft delete is explicit on every read. Physical deletion stays in the two named removal routes.
- Nothing reads the environment at import time. Settings arrive through `create_app`.
- If the work grows past the current checklist item, stop. Add a checklist line or propose a follow-up issue.

## After coding (same item)

Before marking the `(CODE)` item done, confirm the diff still passes the simplicity checklist. Prefer deleting or inlining over adding a helper when fixing a review finding.
