# ADR 005: Local RAG for Legal Context

**Date**: 2026-01-24
**Status**: Accepted

## Context
We need to provide the AI agent with access to the *Ley de Contratos del Sector Público (LCSP)* to validate proposals against legal standards (e.g., solvency requirements, abnormal low bids).
Initially, we considered building a full **Model Context Protocol (MCP)** Server to serve this knowledge. However, for the scope of this Master's Thesis (TFM) and the 30-day timeline, we evaluated whether the operational complexity of an MCP server was justified.

## Decision
We decided to implement a **Local RAG (Retrieval-Augmented Generation)** service directly within the Infrastructure Layer (`LocalRAGLegalService`), rather than a standalone MCP process.

## Rationale
1.  **Complexity**: An MCP server requires managing a separate process, stdio/SSE communication, and JSON-RPC handling. A local service is just a TypeScript class.
2.  **Latency**: A direct function call in the same memory space is orders of magnitude faster than inter-process communication.
3.  **Deployment**: Zero additional deployment overhead (no need for a separate container or sidecar).
4.  **Flexibility**: We designed `ILegalDataSource` interface (Dependency Inversion), so we can easily swap this "In-Memory" implementation for a real MCP/Vector DB implementation later without changing the Domain logic.

## Resilience Strategy (Mock Mode)
Given the dependency on external APIs (OpenAI), we have implemented a **Circuit Breaker / Mock Fallback** pattern:
-   **Scenario**: If OpenAI returns `429 Quota Exceeded` or `5xx Errors`.
-   **Fallback**: The system automatically switches to a `MockEmbeddingFunction` (deterministic random vectors) and `MockLegalService` (predefined citations).
-   **Benefit**: Allows development and demonstration of the end-to-end pipeline to continue even without active paid credits.

## Frontend Integration
The Frontend (`ComparisonResults.tsx`) consumes the `legalCitations` field from the `ValidationResult` object.
-   **Visual Indicator**: A distinct UI element (purple card) displays the Article ID and text snippet.
-   **Condition**: The UI component only renders if `legalCitations.length > 0`.

## Consequences
### Positive
-   Reduced development time (completed in <2 days).
-   Simplified debugging and testing (standard Unit Tests vs Integration Tests).
-   Zero infrastructure cost ( runs in the same node process).

### Negative
-   The "Legal Knowledge" is currently coupled to this specific backend instance (cannot be easily shared with an IDE or another agent).
-   Memory usage increases slightly as embeddings are cached locally for the MVP.
