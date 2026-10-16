# Coding Style

Personal style preferences, language-agnostic. Applies on top of any language-specific rules — [[python.md]], [[ruby.md]], [[javascript.md]] — and whatever a project's own CLAUDE.md specifies.

## Functional style

- Prefer pure functions and immutable data. Avoid mutation — return a new value instead of mutating in place, even when the language makes mutation the path of least resistance.
- Reach for expressions over imperative temp-variable bookkeeping where the language supports it (ternaries, comprehensions, `reduce`, pattern matching) — but don't force it past the point of readability.

## Naming

- Use named functions when the name adds meaning. Anonymous functions are fine only for genuinely trivial inline callbacks (`.map(x => x.id)`); anything with a distinct purpose gets a name.
- Never use loose enum strings (`"admin"`, `"pending"`, magic string literals compared with `==`). Define a real enum — TS `enum` or a union of literals, Python `Enum`, Ruby frozen constants/symbols with a validating set — and reference that everywhere the value is produced or checked.

## Architecture

Default to feature-oriented / vertical-slice organization: group code by what the system does (`orders/create`, `orders/cancel`) rather than by technical layer (`controllers/`, `services/`, `repositories/`). Add a layer, interface, or abstraction only when it protects a real boundary — not because a diagram or a familiar template calls for it. Full rationale, examples, and the anti-pattern list live in `Feature-Oriented Architecture.md` at the repo root — read that file before scaffolding a new feature or module.

## Hygiene

- Eliminate dead code and commented-out code on sight, whether or not it's something you just wrote. Never commit commented-out code — Git history is the record of what used to be there, not a comment block.
- Delete deprecated files outright rather than leaving shims, re-exports, or `// deprecated` markers, and update every reference to the deleted file in the same change.
- Remove unused imports.
- Before declaring a diff finished, reread it once specifically for stale imports, dead code, and leftover debugging (`console.log`, `print`, `debugger`, commented assertions) introduced during the work.
