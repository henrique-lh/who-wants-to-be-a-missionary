---
description: Run tests, ruff, mypy, slice and contract review, blast-radius/docs sync, security review, and performance review on your changes
---

# Quality Check (full pipeline)

Run the full pre-ship quality pipeline on **your current changes** in `src/`.

Use this command when implementation is done and the branch should be checked before a PR. Leave unrelated refactors alone. A commit the user already asked for is not blocked by this pipeline.

Read [`.claude/quality-check-reference.md`](../quality-check-reference.md) once at the start for scope, tooling, fast-path hints, and the full report template.

## When to use sub-commands alone

| Command | Use when |
| --- | --- |
| `/quality-check-verify` | Quick rerun after fixing tests, ruff, or types |
| `/quality-check-review` | Targeted slice, contract, persistence, code-quality, or blast-radius/docs pass |
| `/quality-check-audit` | Targeted security or performance pass |
| `/quality-check` | Default before a PR — runs all tiers |

## Pipeline (run in this order)

Follow each tier in order. **Stop if a tier fails** and cannot be fixed without user input.

1. **[`quality-check-verify.md`](quality-check-verify.md)** — steps 1–3: tests, ruff, typecheck
2. **[`quality-check-review.md`](quality-check-review.md)** — steps 4–8: slice shape, contract, persistence, code quality, blast-radius/docs
3. **[`quality-check-audit.md`](quality-check-audit.md)** — steps 9–10: security, performance

The verify tier gates the pipeline: tests, ruff, and mypy must pass before review or audit steps run in a full `/quality-check` invocation.

## Final report

When all tiers complete, emit the **full 10-row report** from [`.claude/quality-check-reference.md`](../quality-check-reference.md), aggregating results from every tier.

Report **all** findings from review and audit steps, including minor and non-blocking items. Group by severity when helpful (blocking, should-fix, nitpick).

Leave out review details for steps that pass with zero findings. Elaborate on every step that has issues or required fixes.

If any step fails and cannot be fixed without user input, stop and explain what is blocking.
