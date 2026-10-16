---
name: create-issue
description: >-
  Create or update GitHub issues for this repository from a feature request,
  a bug, or a follow-up. Use when the user asks to create or update a GitHub
  issue. Do not invent labels.
---

# create-issue

Open GitHub issues for this repository with a consistent body and only labels that already exist. Issues come from the user's request.

## Before creating

1. Confirm the remote with `gh repo view --json nameWithOwner`. It is `henrique-lh/backend-genesis`.
2. Check existing issues so you do not duplicate: `gh issue list --state all --limit 50`.
3. If the issue changes a response the front-end reads, read `CLAUDE.md`: failures are `{code, message}`, and the front branches on `code`.

## Allowed labels (do not invent)

Use only labels `gh label list` already returns. The ones that fit most issues:

- `enhancement` for a new capability
- `bug` for something that is broken
- `documentation` for docs and agent skills
- `accessibility` when the barrier is for people with disabilities

Leave the issue unlabeled if none of those fit. Do not create new labels.

## Feature and documentation issues

1. Title: short and specific. Match the language of the request. Existing issues on this repo are in Brazilian Portuguese.
2. Body must include these headings:

```markdown
## Por que agora

<the problem or the gap>

## Escopo

<what lands, as bullets>

## Critérios de aceite

<what must be true when the issue is done>

## Contrato

O corpo de erro continua `{code, message}`. Quem chama decide pelo `code`. Uma mudança de contrato entra em `docs/prd/` no mesmo trabalho.
<!-- If the HTTP response does not change, write: N/A: a resposta HTTP não muda. -->

## Depende de

<other issues, or "Nada">
```

3. Create with `gh` (HEREDOC for the body). Add `--label` only from the allowed set. Add `--assignee joaovictornsv` when the user is driving the work.

```bash
gh issue create \
  --title "TITLE" \
  --label "documentation" \
  --assignee joaovictornsv \
  --body "$(cat <<'EOF'
…body…
EOF
)"
```

4. Return the issue URL to the user.

## Bugs and follow-ups

- Title: short, specific.
- Body: **O que acontece**, **Esperado**, **Passos / contexto**, **Critérios de aceite**, **Contrato** (same wording as above, or `N/A: a resposta HTTP não muda`).
- Label: `bug`, plus `accessibility` when that fits.
- Do not reopen a product decision recorded in `docs/prd/`. Point at a follow-up.

## Update an existing issue

```bash
gh issue edit N --body "…"
# or add a comment:
gh issue comment N --body "…"
```

Prefer editing the body when the change is the execution checklist from `implement-issue`. Comments are for conversation, not status.

## After create

- Return the issue URL to the user.
- Do not start implementing unless asked (`implement-issue`).

## Do not

- Invent labels.
- File the issue on any repository other than this one.
- Omit the **Contrato** section from new issue bodies.
