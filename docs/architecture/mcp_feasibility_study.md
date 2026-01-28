# 🏗️ Architectural Feasibility Study: Legal Search Engine (RAG)

**Date**: 2026-01-24
**Subject**: Evaluation of Model Context Protocol (MCP) for "Ley de Contratos del Sector Público" (LCSP) Search
**Context**: Master's Thesis (TFM) - 30 Day Timeline

## 1. Executive Summary (The Verdict)
Given the strict **30-day timeline** and the project scope (TFM), **developing a full Custom MCP Server is OVERKILL and risky.**

**Recommendation:** Implement a **Local RAG Service** within the Infrastructure Layer for now.
*   **Why?** faster to build (2 days vs 5-7 days), easier to debug, and zero deployment overhead.
*   **Future Proof:** We will design it using **Dependency Inversion (SOLID)** so it can be swapped for an MCP Client later without changing a single line of Domain logic.

> **⚠️ FINAL IMPLEMENTATION UPDATE (2026-01-28)**: 
> The project pivoted to a **Cloud-Native Architecture**. 
> Instead of a local vector store (Pinecone/Chroma), we implemented **Turso (LibSQL)** which supports native vector search.
> The "Local RAG" approach was preserved logically, but the backing technology is now **Turso + Google Genkit**, ensuring full cloud compatibility with Render.

---

## 2. Technical Evaluation

### Option A: Custom MCP Server (The "Enterprise" Way)
A standalone process exposing the "Ley de Contratos" via the MCP standard.
*   **Pros**: highly decoupled, allows *other* AI agents (e.g., Claude Desktop, IDEs) to query the law.
*   **Cons**: Requires running a separate server process (`stdio` or `SSE`), handling JSON-RPC limits, and complex debugging.
*   **Timeline Impact**: High (Infrastructure setup + Protocol handling).

### Option B: Local RAG Service (The "Efficient" Way)
A class in `src/infrastructure` that wraps a Vector DB (Chroma/Pinecone) and searches the law directly.
*   **Pros**: Simple function call, runs in the same memory space, easy to test with Vitest.
*   **Cons**: Tightly coupled to this specific app instance (not easily shared with other agents).
*   **Timeline Impact**: Low (Use standard libraries).

---

## 3. Proposed Architecture (SOLID Integration)

To satisfy **SOLID** (specifically the **Dependency Inversion Principle**), the Domain Layer must NOT know we are using MCP or a Vector DB.

### Domain Layer (The Contract)
Define the *need* for legal knowledge, not the *implementation*.

```typescript
// backend/src/domain/interfaces/ILegalDataSource.ts
export interface ILegalDataSource {
  /**
   * Semantically searches for legal articles related to a query.
   * @param query - e.g., "Es legal pedir una fianza del 50%?"
   * @returns List of relevant articles from LCSP.
   */
  citationSearch(query: string): Promise<LegalCitation[]>;
}

export type LegalCitation = {
  article: string; // "Art. 105"
  text: string;    // "No se podrá exigir..."
  relevance: number;
};
```

### Infrastructure Layer (The Implementation)
Here we implement the interface. We can build the "Local RAG" version now.

```typescript
// backend/src/infrastructure/services/LocalRAGLegalService.ts
import { ILegalDataSource, LegalCitation } from "../../domain/interfaces/ILegalDataSource";

export class LocalRAGLegalService implements ILegalDataSource {
  constructor(private vectorDb: VectorStoreClient) {}

  async citationSearch(query: string): Promise<LegalCitation[]> {
    // 1. Embed query (OpenAI Embeddings)
    // 2. Query Vector DB (Pinecone/Chroma)
    // 3. Return mapped results
    return results.map(r => ({ ... }));
  }
}
```

### Future Migration (MCP)
If we successfully finish early, we simply create a *new* adapter:

```typescript
// backend/src/infrastructure/adapters/MCPLegalAdapter.ts
export class MCPLegalAdapter implements ILegalDataSource {
  async citationSearch(query: string): Promise<LegalCitation[]> {
    // Connect to external MCP Server via Stdio/SSE
    return mcpClient.callTool("search_law", { query });
  }
}
```

## 4. Technical Scheme: Local RAG (Recommended)

1.  **Ingestion Script (`scripts/ingest_law.ts`)**:
    *   Reads `ley_contratos.pdf`.
    *   Chunks text by "Article".
    *   Generates Embeddings (`text-embedding-3-small`).
    *   Stores in a light vector store (e.g., `LanceDB` local file or `Pinecone` free tier).

2.  **Retrieval Service**:
    *   Injected into `ValidationEngine`.
    *   When the LLM is unsure about a rule (e.g., "Is this solvency requirement excessive?"), it calls `legalService.citationSearch()`.
    *   The retrieval is added to the Prompt Context.

## 5. Strategic Roadmap
1.  **Day 1-2**: enhanced `RequirementsExtractor` (Phase 4 completed).
2.  **Day 3-5 (This Phase)**: Implement logic to read "Oferta".
3.  **Day 6-8 (Comparison)**: Compare Pliego vs Oferta.
4.  **Day 9-10 (Optional RAG)**: implement the simple Local RAG to verify specific suspicious clauses.

**Decision**: Stick to **Local RAG** encapsulated behind `ILegalDataSource`. Do not build a standalone MCP Server unless required for the thesis defense (interoperability demo).
