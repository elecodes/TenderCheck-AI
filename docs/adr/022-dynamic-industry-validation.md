# ADR 022: Dynamic Industry Validation

* Status: accepted
* Deciders: Elena, Antigravity
* Date: 2026-02-09

## Context and Problem Statement

Initially, the tender scope validation was hardcoded for "Digital Services" with a fixed set of positive/negative keywords. This made it difficult to adapt the system for other industries (e.g., Construction, Healthcare) without changing the source code.

## Decision Drivers

* Extensibility: Support multiple industries without code changes.
* Data-Driven Design: Manage validation criteria via database presets.
* Fallback Resilience: Maintain a default "Digital Services" check if no industry is specified or database fails.

## Considered Options

1. **Hardcoded Switch Case**: Easy to implement but requires code changes for ogni new industry.
2. **Configuration File (JSON)**: Better, but still requires a redeploy to add new industries.
3. **Database-Driven Factory (Chosen)**: Store industry keywords in a table and use a Factory pattern to instantiate rules at runtime.

## Decision Outcome

Chosen option: **Database-Driven Factory**, because it provides the highest flexibility for end-users to define new validation templates directly in the database.

### Positive Consequences

* New industries can be added via simple SQL inserts.
* The `ScopeValidationRule` is now a generic, reusable component.
* Supports a default fallback to ensure the system remains functional if data is missing.

### Negative Consequences

* Adds a database dependency to the validation flow (mitigated by caching/fallbacks).
* Minor performance overhead due to database lookup (mitigated by singleton DB connection).
