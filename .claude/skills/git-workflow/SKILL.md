---
name: git-workflow
description: >-
  Git workflow rules for agents in this repository: no force push, no rebase,
  no squash, no amend after push, issue-linked commit messages, PR-only merges.
  Use when committing, amending, resetting, rebasing, pushing, opening or
  merging PRs, or when the user asks about git workflow, branch history, or
  commit format. No pre-commit quality gates are required before commits.
---

# Git Workflow Rules

These rules apply to every agent working in this repo. No exceptions.
No history-rewrite loopholes. No quality-gate requirements before commits.

## Forbidden operations

| Operation                                                        | Why                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `git push --force` / `--force-with-lease`                        | Rewrites remote history. Never do this.                                                 |
| `git rebase` (interactive or non-interactive)                    | Rewrites commit history. Use merge commits instead.                                     |
| Squash merging                                                   | Each commit is a meaningful unit of work. Preserve the full commit chain.               |
| `git reset --hard`                                               | Destroys local work irreversibly.                                                       |
| `git reset --soft` / `--mixed` to rewrite already-pushed commits | If the commit is already on the remote, do not rewrite it. Create a new commit instead. |
| `git commit --amend` on already-pushed commits                   | Same as above: creates divergence that requires a force push.                           |
| `git push` to `main`/`master` directly                           | Always go through a PR.                                                                 |
| Editing `.git/config` or git identity settings                   | Never touch git configuration.                                                          |

## Safe operations

- `git commit --amend` is allowed only when the commit has not been pushed to the remote yet (for example fixing a typo right after committing locally, before push).
- `git reset --soft HEAD~1` is allowed only when the commit has not been pushed to the remote yet.
- `git pull --ff-only` is the preferred way to update from remote.
- `git merge` (regular, non-squash) is fine for integrating branches.

## No requirements before commits

Do not gate commits on lint, typecheck, tests, or any other quality pipeline. When the user asks to commit:

1. Stage the relevant files.
2. Commit with the message format below.
3. Do not insist on running quality checks first.

Quality checks belong later (before or during the PR via `create-pr`), not as a prerequisite for `git commit`. Still never commit secrets, tokens, credentials, or `.env` files.

Still only create commits when the user explicitly asks (or a skill the user invoked explicitly includes committing).

## Workflow

1. Always branch from `main` (or the base branch specified by the user or issue). Branch names use `feature/<name>`.
2. Make focused commits: one logical change per commit.
3. Push with `git push` (or `git push -u origin HEAD` for new branches). Never add `--force` flags.
4. If you need to fix something after pushing, create a new commit with the fix. Do not amend or rebase.
5. Open PRs for review. Never merge your own PR unless the user explicitly asks.

## Commit messages

### Issue-linked commits

When committing in the context of a specific GitHub issue, always include the issue ID and title from GitHub in the commit subject, followed by a blank line and bullet points describing the specific changes in that commit.

```text
#39 automatizar versão da API

- reads the version from the installed package
```

Rules:

- **Subject line:** `#<number> <issue title>`. Fetch the title from GitHub (`gh issue view <number> --json title -q .title`) so it matches the issue exactly.
- **Body:** one or more `- ` bullets naming the concrete changes in that commit (not the whole issue scope).
- **One logical change per commit:** each commit gets bullets only for what that commit actually changes.
- **HEREDOC:** pass multi-line messages with a HEREDOC so newlines are preserved:

```bash
git commit -m "$(cat <<'EOF'
#39 automatizar versão da API

- reads the version from the installed package
EOF
)"
```

Commits outside a specific issue context (docs-only housekeeping, merge commits, and so on) do not need this format. Those still follow the existing `commit` skill: conventional commits, a body that says why, no AI mentions.

## When in doubt

If a git operation feels destructive or history-rewriting, do not run it. Ask the user instead.
