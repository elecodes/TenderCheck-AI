# 💎 Code Quality & Technical Debt Policy - TenderCheck AI

## 1. Detection of Code Smells
[cite_start]The system must be audited regularly to identify and resolve patterns that indicate poor design or maintainability issues[cite: 652, 653]:
* [cite_start]**Magic Numbers & God Objects**: Avoid hardcoded values without context and classes that take on too many responsibilities.
* [cite_start]**Code Duplication**: Adhere strictly to the **DRY (Don't Repeat Yourself)** principle to ensure logic is centralized.
* [cite_start]**Automated Tooling**: Use **ESLint** and **Sonar** to automatically detect smells and enforce style guides.

## 2. Technical Debt Management
[cite_start]Technical debt must be handled pragmatically to ensure project sustainability:
* [cite_start]**Architecture Decision Records (ADRs)**: Document key decisions and the reasoning behind them to prevent "hidden" debt.
* [cite_start]**Refactoring Strategy**: Apply secure refactoring techniques to keep the **Domain Layer** isolated from infrastructure changes[cite: 654, 1093].
* [cite_start]**Pragmatic Documentation**: Use ADRs to record when a temporary solution is chosen over a permanent one, including the justification and potential risks.

## 3. Engineering Principles
* [cite_start]**SOLID Principles**: Every code change must strive to follow SOLID principles to enhance modularity and testability.
* [cite_start]**Clean Architecture**: Ensure the core business logic is independent of frameworks, UI, and external agencies.
* **Traceability**: Maintain a clear history of changes and decisions within the repository using the "Docs as Code" philosophy.