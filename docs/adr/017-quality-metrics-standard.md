# ADR 017: Adoption of Strategic Quality Metrics (100/80/0)

## Status
Accepted

## Date
2026-01-30

## Context
As the project moves closer to the Master's Thesis defense, we needed a more rigorous yet pragmatic approach to testing. A blanket "80% coverage" rule was insufficient because it treated critical business logic (Domain) the same as boilerplate configuration code. We needed a strategy that prioritizes business risk.

## Decision
We have adopted the **"100/80/0" Strategic Coverage Standard** as defined in `docs/standards/quality_metrics.md`.

### The Standard
1.  **CORE (100%)**: Domain Layer (`src/domain`).
    *   *Reason*: Zero tolerance for logic errors in business rules.
2.  **GLOBAL (80%)**: Application, Presentation, Infrastructure (`src/application`, `src/infrastructure`, `src/presentation`).
    *   *Reason*: Ensures robustness in orchestration and user-facing features without chasing diminishing returns.
3.  **INFRA (0%)**: Configuration & Boilerplate (`src/config`, `test/mocks`).
    *   *Reason*: Testing config files or mocks provides false confidence and wastes time.

## Enforcement
*   **Vitest Config**: Thresholds are explicitly configured in `vitest.config.ts`.
*   **Husky Pre-Push**: A mandatory hook runs `npm run test:coverage` before any push is allowed.

## Consequences
*   **Positive**: Higher confidence in core logic. Reduced time spent testing trivial code. Clearer quality gates for the pipeline.
*   **Negative**: Stricter criteria for the Domain layer requires more disciplined TDD.
