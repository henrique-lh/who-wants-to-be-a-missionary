---
name: create-pr
description: >-
  Open a pull request on this repository after the relevant checks, with a
  Summary, an Agent test plan (agent-checked), and a Human test plan (left
  unchecked). Use when opening or updating a PR, or when implement-issue
  reaches the PR step.
---

# create-pr

Open a PR against `main` after the checks that apply to the diff. Structured body, assignee `joaovictornsv`. Application checks run with `make check`.

## Before opening

1. Confirm the branch is pushed and tracks `origin` (`git push -u origin HEAD` if new).
2. Follow `git-workflow`: no force push, no rebase, no squash, PR-only to `main`.
3. Run the checks that match the diff. Fix failures before opening. Do not open a red PR.
   - When `src/` changed: run `make check` (lint, typecheck, and the test suite).
   - When only skills, docs, or other non-application files changed: read the diff against the issue's acceptance criteria. Do not run the suite for a change that cannot fail it.

## Test plan sections

Always split verification into two checklists. Do not mix them.

### Agent test plan

Commands or checks an agent can run. The opening agent must execute them and mark them done. Do not leave agent items unchecked for the human reviewer.

- Run each listed command successfully before opening or updating the PR.
- Write the PR body with `- [x]` for every agent item that passed.
- If a command fails, fix it and re-run. Do not check the box until it passes.
- When editing an existing PR body, keep agent boxes in sync with what you actually ran.

```markdown
## Agent test plan

- [x] `make check`
```

For a skills-only or docs-only PR, list the check you actually did, still checked:

```markdown
## Agent test plan

- [x] Read the new skills against the issue acceptance criteria
```

### Human test plan

Manual steps only. No shell commands. Leave these unchecked (`- [ ]`). The agent never checks human items.

```markdown
## Human test plan

- [ ] Pedir um código em `POST /auth/code` e ler os seis dígitos no log de `make run`
```

For a change with nothing to exercise by hand, one line is enough: `- [ ] N/A: sem chamada nova. Conferir os arquivos da skill.`

## Create

```bash
gh pr create \
  --assignee joaovictornsv \
  --base main \
  --title "TITLE" \
  --body "$(cat <<'EOF'
## Summary
- …

## Agent test plan
- [x] …

## Human test plan
- [ ] …

Closes #N
EOF
)"
```

Title: short summary of the change. Body **Summary** is 1 to 3 bullets of what landed. Use `Closes #N` when this PR fully completes the issue.

If the PR already exists without an assignee:

```bash
gh pr edit N --add-assignee joaovictornsv
```

After create, paste the PR URL onto the issue's `(PR)` execution-checklist line via `gh issue edit` (body-file), not as a status comment.

## Do not

- Force-push to `main`.
- Leave Agent test plan boxes unchecked for the human.
- Ask the human to run lint, typecheck, or the test suite.
