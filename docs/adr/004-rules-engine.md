# ADR-004: Validation Rules Engine
**Date**: 2026-01-23

## Status
Accepted

## Context
TenderCheck AI needs to validate tender documents against a set of constraints (e.g., "Must be a digital service", "Must have a budget > X"). These constraints vary in complexity and may change over time. Hardcoding these checks into a single service would violate the **Open/Closed Principle** (OCP) and make testing difficult.

## Decision
We will implement a **Rules Engine** pattern using the **Strategy Pattern**.

1.  **`IRule` Interface**: Defines a common contract for all validation rules.
    ```typescript
    interface IRule {
      id: string;
      validate(analysis: TenderAnalysis): Promise<ValidationResult | null>;
    }
    ```
2.  **`ValidationEngine`**: A service that iterates through a collection of injected `IRule` implementations.
3.  **Composition**: Rules are injected into the engine at runtime (Dependency Injection).

## Consequences

- **Positive**:
    - **Extensibility**: New rules can be added by creating a new class without modifying the engine.
    - **Testability**: Each rule can be unit tested in isolation. The engine can be tested with mock rules.
    - **Maintainability**: Complex logic is broken down into small, focused classes (Single Responsibility Principle).

- **Negative**:
    - **Complexity**: Slightly more boilerplate (new file per rule) compared to a simple function with many `if` statements.

## Compliance
This decision aligns with the "Refactoring for SOLID" objective and the Clean Architecture principles defined in `PROJECT_PLAN.md`.
