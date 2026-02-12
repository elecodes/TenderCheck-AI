# ADR 026: High Coverage Standard for Domain Logic

## Status
Accepted

## Context
In the final phase of development, we identified that the core business logic (Domain Layer) and critical infrastructure adapters were under-tested (~64% global coverage). Given the critical nature of the application (Tender Analysis), we need to ensure high reliability for:
1.  **Validation Rules**: Ensure all industry-specific rules are correctly applied.
2.  **AI Integration**: Ensure fallback mechanisms work when AI services fail.
3.  **Authentication**: Ensure user access is correctly controlled.

## Decision
We decided to enforce a **Strict High Coverage Standard**:
-   **100% Line Coverage for Domain Layer**: All Entities, Value Objects, Domain Services, and Validation Rules must be fully tested.
-   **>80% Global Line Coverage**: The entire backend codebase must meet this threshold.

## Consequences
### Positive
-   **Confidence**: We can refactor core logic with zero fear of breaking business rules.
-   **Bug Prevention**: Edge cases in `ValidationRuleFactory` and `VectorSearchService` (e.g., empty embeddings, DB failures) were caught and fixed during test writing.
-   **Documentation**: Tests serve as live documentation of the expected behavior.

### Negative
-   **Development Time**: Writing comprehensive tests (especially mocking Turso and Genkit) requires significant effort.
-   **Build Time**: CI/CD pipelines take slightly longer to run the full test suite.

## Implementation
-   Tests are implemented using **Vitest**.
-   External services (Turso, Google AI) are **Mocked** to ensure deterministic tests and avoid costs/latency.
-   Coverage thresholds are enforced via `vitest` configuration and pre-push hooks (Husky).
