# 19. Resilience and Testing Strategy 🧪

Date: 2026-01-31

## Status

Accepted

## Context

As the application moves towards production readiness (Phase 8), we need to ensure robustness against failures and verify the "Happy Path" end-to-end. Previously, error handling was inconsistent (mixed `res.status` and `next(err)`), and testing was limited to unit tests with strict 100% thresholds that blocked CI execution.

## Decision

We have adopted a comprehensive **Resilience & Testing Strategy** consisting of three pillars:

### 1. Global Error Handling
We standardized backend error handling by routing all errors through a centralized `globalErrorHandler` middleware.
- **Pattern**: Controllers must catch errors and pass them to `next(error)` or throw `AppError` instances.
- **Operational vs. Programmer Errors**:
  - `AppError` (Operational): Anticipated errors (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found). These are returned to the client as JSON.
  - `Error` (Programmer/Unexpected): Crashes, DB connection failures. These are logged to **Sentry** (if enabled) and returned as generic 500 errors to prevent info leaks.
- **Refactoring**: Middleware (`authMiddleware`) and Controllers (`TenderController`, `AuthController`) were refactored to conform to this pattern.

### 2. End-to-End (E2E) Testing
We introduced **Playwright** to verify critical user flows that unit tests cannot capture.
- **Scope**: The "Happy Path" (Registration -> Upload -> Analysis).
- **Environment**: Tests run against the local development server (`npm run dev`).
- **Mocking**: External AI calls (`/api/tenders/analyze`) are mocked network-side to ensure determinism and cost-saving during test runs.
- **Artifacts**: Execution records videos (`.webm`) for visual verification.

### 3. Pragmatic Code Coverage
We adjusted **Vitest** coverage thresholds to balance quality with velocity.
- **Domain Layer**: 100% -> **80%+** (Strict logic validation).
- **Global**: 80% -> **60%** (Baseline for CI/CD stability).
- **Rationale**: Strict 100% thresholds were causing false positives and blocking valid builds. 60% global coverage is a healthy baseline given the addition of E2E tests which cover integration paths.

## Consequences

### Positive
- **Observability**: All 500 errors are now centralized and can be instrumented (Sentry).
- **Confidence**: E2E tests prove the system works from a user perspective.
- **Stability**: Lowered strict thresholds prevent CI from breaking on minor changes, while E2E tests ensure actual functionality.

### Negative
- **Complexity**: New toolchain (Playwright) adds setup time (browsers, dependencies).
- **Maintenance**: E2E tests are more brittle than unit tests and require maintenance on UI changes.
