# Coverage Policy & Quality Gates

## 1. Coverage Thresholds
All code must meet the following minimum coverage requirements to pass the CI/CD quality gate:

- **CORE (100% Coverage):** 
  - **Location:** `src/domain/`
  - **Reasoning:** This is the heart of TenderCheckAI. Business logic, entities (Requirement, ValidationResult), and domain rules must be error-free and independent of technology.

- **GLOBAL (80% Coverage):** 
  - **Location:** `src/application/`, `src/infrastructure/`, `src/presentation/`
  - **Reasoning:** Includes use cases, API controllers, and PDF processing logic. High coverage ensures that the orchestration and integration layers are robust.

- **INFRA/STUBS (0% Coverage):** 
  - **Location:** `src/config/`, `src/tests/mocks/`
  - **Reasoning:** Boilerplate code, environment configurations, and test helpers are excluded from coverage metrics.

## 2. Testing Strategy
- **Unit Testing (Vitest):** Mandatory for all Domain entities and Application use cases.
- **Integration Testing:** Required for the `Validation Engine` to verify the interaction between deterministic rules and the AI Reasoning Layer.
- **E2E Testing (Playwright):** Critical flows only (e.g., "User uploads PDF -> System generates Report").
- **AI Testing:** Use mocked LLM responses to test the system's resilience and error handling (Retries/Circuit Breakers).

## 3. Enforcement (Quality Gate)
- **Pre-commit/Pre-push Hooks:** Powered by `Husky`. Pushes will be blocked if thresholds are not met or if any test fails.
- **Complexity Control:** Maintain low cyclomatic complexity. If a function is too complex to test, it must be refactored.
- **Documentation:** Use `Architecture Decision Records (ADRs)` to document any instance where a test was intentionally bypassed for technical reasons.
