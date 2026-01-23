# ADR 002: Frontend Technology Stack

* Status: accepted
* Deciders: Elena, Senior Architect
* Date: 2026-01-23

## Context and Problem Statement
We need a lightweight, performant, and maintainable frontend framework to build the document upload and validation dashboard. The solution must support rapid prototyping while allowing for future complexity (e.g., complex state).

## Decision Drivers
* **Speed of Development**: We have a strict 4-week timeline.
* **Performance**: Applications should load instantly (Perceived Speed).
* **Maintainability**: Strict component standards.

## Considered Options
* **Next.js**: Full-stack framework.
* **Vite + React**: Client-side rendering focused.
* **Vanilla JS**: No framework overhead.

## Decision Outcome
Chosen option: **"Vite + React + TailwindCSS"**.

### Justification
1.  **Vite**: Uses ESBuild for millisecond hot-reloading, essential for our rapid iteration.
2.  **React**: Massive ecosystem and component reusability.
3.  **TailwindCSS**: Utility-first CSS allows us to implement the "Premium Design" aesthetic without writing custom CSS files.

### Positive Consequences
* Fast build times.
* Clear separation of concerns (React for View, Node for Logic).

### Negative Consequences
* Initial setup complexity (configured via `create-vite`).
