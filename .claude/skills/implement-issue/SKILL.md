---
name: implement-issue
description: >-
  Implement a GitHub issue on this repository with an execution checklist in
  the issue body, item-by-item proof, then open a PR via create-pr. Use when
  the user runs /implement-issue or asks to implement a GitHub issue.
---

# implement-issue

Turn a GitHub issue into a PR with a living **Execution checklist** in the issue body (not in comments).

**Assignee:** always assign `@joaovictornsv` on the issue (and on the PR via `create-pr`).

## Companion skills

| When                          | Skill                                |
| ----------------------------- | ------------------------------------ |
| Before each `(CODE)` item     | `dev`                                |
| Commits / push / branch rules | `git-workflow`                       |
| Open the PR                   | `create-pr`                          |
| File a follow-up issue        | `create-issue`                       |
| A bug with a failing test     | `bugfix`                             |
| A smoke of the running API    | `qa`                                 |
| A product write-up            | `po`                                 |
| Full pre-PR check, when asked | `/quality-check` (not a commit gate) |

## Core rules

1. **Start from latest `main`.** First action: check for a dirty working tree. If dirty, ask the user how to proceed. When clean (or after they decide), `git checkout main && git pull --ff-only` before implementing.
2. **No issue comments for execution status.** Do not post checklist comments. The issue body is the tracker.
3. **Create `## Execution checklist` in the issue body before coding.** Append it. Preserve the original problem statement.
4. **Update the checklist in place** as work progresses (`gh issue edit … --body-file`).
5. **Work item by item.** Mark the current line `(IN PROGRESS)`, implement, prove, then `(DONE)` with proof (or `(BLOCKED)` with a reason).
6. **Assign yourself** at the start. Open the PR with `create-pr` when ready.
7. **Agent owns the PR Agent test plan.** Run every agent test-plan command and mark those boxes `- [x]`. Leave **Human test plan** items unchecked. Never ask the human to run or check agent commands.
8. **Use issue-linked commit messages** when the user asks for a commit (never commit unprompted). Full rules: `git-workflow`. Subject is `#<number> <issue title>` from GitHub (`gh issue view <number> --json title -q .title`), then `- ` bullets for what that commit actually changed. Do not require quality checks before the commit.
9. **Follow the contract** when the issue changes a response. Failures stay `{code, message}`, and callers branch on `code`. Record the decision in `docs/prd/` when it is a product decision. If the issue body lacks **Contrato** and the response changes, add that section when writing the checklist.

## Checklist format

Append if missing (derive items from the acceptance criteria; keep lines concrete, with proof):

```markdown
## Execution checklist

- [ ] (TODO) (SYNC) Checkout `main`, pull latest; if dirty tree, ask user how to proceed.
- [ ] (TODO) (PLAN) Confirm scope and acceptance criteria from the issue body. Read `CLAUDE.md` if the response shape can change.
- [ ] (TODO) (ASSIGN) Assign issue to joaovictornsv.
- [ ] (TODO) (CODE) Implement <specific behavior>. Proof: <focused test or check>.
- [ ] (TODO) (UI) Keep `{code, message}` and branch-on-`code`, or `(SKIP)` with Reason: no response shape change.
- [ ] (TODO) (TEST) Add or update tests for <behavior>, or `(SKIP)` with Reason: no application behavior.
- [ ] (TODO) (DOCS) Update `docs/prd/` when the change records a product decision.
- [ ] (TODO) (VERIFY) `make check` when `src/` changed. Otherwise read the diff against the acceptance criteria.
- [ ] (TODO) (PR) Open PR with `create-pr` (agent checks the Agent test plan; human leaves the Human test plan) and link it here.
```

Status rules:

| State             | Line form                            |
| ----------------- | ------------------------------------ |
| Not started       | `- [ ] (TODO) ...`                   |
| Active            | `- [ ] (IN PROGRESS) ...`            |
| Done              | `- [x] (DONE) ... Proof: ...`        |
| Blocked           | `- [ ] (BLOCKED) ... Reason: ...`    |
| Split / follow-up | `- [x] (SPLIT) ... Follow-up: <url>` |
| Skipped           | `- [x] (SKIP) ... Reason: ...`       |

Put proof on the checklist line (paths, commands, test counts). Do not dump status into issue comments.

## Workflow

### 0. Sync to latest `main` (first action)

Before loading the issue or writing code:

1. Inspect the working tree: `git status`.
2. **If there are uncommitted changes** (staged, unstaged, or relevant untracked files): stop. Summarize what is dirty and ask the user how to proceed. Do not stash, discard, commit, or overwrite without their explicit choice.
3. When the tree is clean (or the user has resolved it):

```bash
git checkout main
git pull --ff-only
```

Then create or switch to the feature branch:

```bash
git checkout -b feature/<N>-<short-slug>
```

Do not start implementation from a stale or dirty tree without the user deciding.

### 1. Load and assign

```bash
gh issue view N --json title,body,assignees,labels
gh issue edit N --add-assignee joaovictornsv
```

### 2. Write or reuse the checklist in the body

```bash
gh issue view N --json body -q .body > /tmp/issue-body-N.md
# Edit /tmp/issue-body-N.md: append or update ## Execution checklist only
gh issue edit N --body-file /tmp/issue-body-N.md
```

If a checklist already exists, reuse it. Refine it only when it is vague or stale. Ensure a **(UI)** line exists (DONE with proof, or SKIP with reason).

### 3. Execute one item at a time

For each item: mark `(IN PROGRESS)` in the body, implement, take focused proof, then mark `(DONE)` with proof (or `(BLOCKED)`). Do not wait until the end to sync the body.

Before each `(CODE)` item, read and apply `dev` (`.claude/skills/dev/SKILL.md`): smallest change, existing patterns in the touched slice, then code.

When committing (only if the user asks), follow `git-workflow`: `#<number> <issue title>` from GitHub, then `- ` bullets for the changes in that commit. No quality gates required before the commit.

### 4. Closeout

1. Run the verification from the checklist (`make check` when `src/` changed, a read of the diff otherwise).
2. Open a PR with `create-pr`. That skill runs the Agent test plan, marks those boxes `- [x]`, and leaves Human test plan items unchecked. Put the PR URL on the `(PR)` checklist line as `(DONE)`.
3. Do not ask the human to run or check agent test-plan commands.
4. Leave the issue body as the single source of execution-checklist truth.
