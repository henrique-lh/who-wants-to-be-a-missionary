# Feature-Oriented Architecture

## Rule

Prefer **feature-oriented / vertical-slice architecture** when creating or modifying code.

Organize code around **features, capabilities, and user-facing behaviors**, not primarily around technical categories such as controllers, services, repositories, validators, DTOs, or models.

### Prefer

```text
orders/
  create/
  cancel/
  get/
  list/

users/
  create/
  update/
  authenticate/
```

over:

```text
controllers/
services/
repositories/
validators/
dto/
models/
```

## Feature locality

Keep code that exists primarily to implement a feature close to that feature.

A feature should ideally form a vertical slice through the application:

```text
entry point
    ↓
feature logic
    ↓
domain/business logic
    ↓
persistence/external services
```

A developer working on one feature should be able to discover most of the relevant code by starting in that feature's directory.

## Avoid premature abstractions

Do **not** introduce abstractions merely because they are conventional or associated with Clean Architecture, Hexagonal Architecture, or layered architecture.

Do not automatically create:

* `Service` classes
* `Repository` interfaces
* `UseCase` classes
* `DTO` layers
* `Mapper` classes
* generic repositories
* interfaces for single implementations
* generic `utils`, `helpers`, or `common` modules

Before introducing an abstraction, identify the concrete problem it solves.

Prefer the simpler implementation when there is no meaningful benefit from the abstraction.

## Abstractions are allowed

Feature-oriented architecture does not prohibit architectural patterns.

Introduce interfaces, ports, repositories, domain objects, or other boundaries when they provide a concrete benefit, such as:

* isolating an external system;
* supporting multiple implementations;
* protecting an important domain boundary;
* significantly improving testability;
* reducing meaningful coupling;
* encapsulating substantial domain complexity.

The question is:

> What concrete problem does this abstraction solve?

If there is no good answer, do not introduce it.

## Shared code

Do not extract feature-specific code into `shared/`, `common/`, `utils/`, or `helpers/` prematurely.

Keep code local to the feature until there is genuine reuse.

Extract shared code only when:

1. multiple features actually depend on it;
2. the abstraction has a coherent responsibility;
3. its semantics are stable;
4. duplication creates meaningful maintenance cost.

Do not create generic dumping-ground modules.

## Tests

Prefer tests organized around features and behaviors.

Prefer:

```text
orders/
  create/
    handler.py
    tests.py

  cancel/
    handler.py
    tests.py
```

over organizing tests exclusively around technical layers.

Tests should primarily describe **what the feature does**, rather than the internal structure of its classes.

## New features

When implementing a new feature:

1. Find the closest existing feature.
2. Follow the repository's established feature-oriented conventions.
3. Create the smallest viable vertical slice.
4. Keep feature-specific logic inside the feature.
5. Add tests alongside the feature when consistent with the project.
6. Introduce abstractions only when justified by a concrete requirement.
7. Extract shared code only when genuine reuse exists.

## Existing code

Do not restructure an existing codebase merely to impose this rule.

Preserve established conventions unless:

* the user explicitly requests a refactor;
* the current structure prevents the requested change;
* there is a demonstrated architectural problem;
* the change can be made locally without unnecessary migration.

Prefer incremental evolution over architectural rewrites.

## Architecture composition

Feature-oriented architecture can coexist with Clean Architecture, Hexagonal Architecture, DDD, or other patterns.

If those patterns are useful, apply them **inside the relevant feature** rather than automatically making technical layers the top-level organization.

For example:

```text
orders/
  create/
    handler.py
    use_case.py
    ports.py
    adapters/
      postgres.py
      payment.py
```

is acceptable when those boundaries solve real problems.

The feature remains the primary organizational boundary.

## Decision rule

When choosing between implementations, prefer the one that provides:

1. high feature locality;
2. low coupling;
3. low accidental complexity;
4. easy navigation;
5. independent changeability;
6. clear business behavior;
7. appropriate testability.

Do not optimize for the number of architectural patterns or abstractions used.

## Default behavior

Unless the project explicitly specifies another architecture:

> **Start with a vertical slice around the feature. Add architectural boundaries only when complexity, reuse, or a meaningful dependency boundary justifies them.**

Before creating a new layer, class, interface, or abstraction, ask:

> **What concrete problem does this boundary solve?**

If there is no strong answer, prefer not to create it.
