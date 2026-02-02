# ADR 017: Adoption of Strategic "Honest Coverage" (100/60/0)

## Status
Accepted (Amended)

## Date
2026-01-30 (Updated 2026-02-02)

## Context
As the project moves closer to the Master's Thesis defense, we needed a more rigorous yet pragmatic approach to testing. A blanket "80% coverage" rule was insufficient because it treated critical business logic (Domain) the same as boilerplate configuration code. We needed a strategy that prioritizes business risk.

## Decision
We have adopted the **"100/60/0" Strategic Coverage Standard** (also known as **"Honest Coverage"**). While the initial aim was 80% global coverage, we pivoted to 60% to maintain a focus on high-fidelity testing of core logic rather than inflating metrics with boilerplate.

## The Standard
1.  **CORE (100%)**: Domain Layer (`src/domain`).
    *   *Reason*: Zero tolerance for logic errors in business rules. This is our "Hard Base".
2.  **GLOBAL (60%)**: Application, Presentation, Infrastructure.
    *   *Reason*: We prioritize "Honest Coverage". Reaching 80% in these layers would require testing thousands of lines of 3rd party adapters (Genkit, Turso) or generic boilerplate that is already validated via E2E tests. By setting the threshold at 60%, we ensure the critical orchestration logic is tested without chasing diminishing returns.
3.  **INFRA (0%)**: Configuration & Mocks.
    *   *Reason*: Testing config files or mocks provides false confidence and wastes time.

## Enforcement
*   **Vitest Config**: Thresholds are explicitly configured in `vitest.config.ts`.
*   **Husky Pre-Push**: A mandatory hook runs `npm run test:coverage` before any push is allowed.

## Consequences
*   **Positive**: Higher confidence in core logic. Reduced time spent testing trivial code. "Honest" metrics that reflect real testing effort.
*   **Negative**: A 60% global coverage might seem low to external auditors who don't understand the "Honest Coverage" philosophy, requiring clear justification.

