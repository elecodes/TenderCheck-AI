# ADR 035: Reaching 100% Domain Coverage

## Date
2026-03-04

## Status
Accepted

## Context
As part of the project's quality standards, we aimed to reach 100% function and branch coverage for the `src/domain` layer. This layer contains the core business logic (Rules, Entities, Repositories, and Extractors) and must be absolutely reliable.

Previously, coverage was at ~77%. Specific gaps were identified in:
- `ScopeValidationRule`: Undefined requirements case.
- `RequirementsExtractor`: Empty text and terminal punctuation branches.
- `AppError`: Factory methods and the implicit branch in the constructor.

## Decision
We decided to implement exhaustive unit tests to hit every line and branch in the domain layer. 

Key strategies implemented:
1.  **Mocking Restricted Environments**: For `AppError`, we mocked the absence of `Error.captureStackTrace` to cover the fallback branch used in non-V8 environments (or transpilation-injected checks).
2.  **Explicit Branch Testing**: Forced `undefined` on optional properties (like `analysis.requirements`) to test AMBIGUOUS fallback logic.
3.  **Keyword Boundary Testing**: Added tests for `RequirementsExtractor` with text that ends abruptly without punctuation to verify regex split behavior.

## Consequences
- **Absolute Reliability**: The core logic is now fully verified against edge cases.
- **CI Gate**: The pipeline now enforces 100% domain coverage, preventing any regressions in the core layer.
- **Maintenance**: Adding new domain features now requires 100% coverage by default, maintaining the high quality bar.
