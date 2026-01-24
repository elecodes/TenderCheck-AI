# ADR 004: Professional Knowledge MCP Server

## Status
Accepted

## Context
TenderCheck AI needs to validate proposals not just against the "Pliego" (PDF) but also against internal "Standards" (Security, Quality, UX).
Hardcoding these standards into the prompt is inefficient (Token Limits) and hard to maintain.
We need a dynamic way to retrieve *relevant* standards based on the context of the analysis.

## Decision
We decided to implement a **Model Context Protocol (MCP)** Server (`packages/knowledge-mcp`) that acts as a standalone "Knowledge Base".

### Key Components:
1.  **Protocol**: MCP (Model Context Protocol) via `stdio`. This allows universal connectivity to any AI client (Cursor, Claude, or our own Backend).
2.  **Database**: **LanceDB**. Chosen for being serverless, zero-config, and storing data locally in files (`data/lancedb`). Perfect for privacy and ease of setup.
3.  **Embeddings**: **Hybrid Strategy**.
    *   **Primary**: OpenAI `text-embedding-3-small` (High fidelity).
    *   **Fallback**: Local `Xenova/all-MiniLM-L6-v2` (Runs on CPU via ONNX).
    *   *Rationale*: Ensures the system works even without API credits or internet, while preferring quality when possible.
4.  **Ingestion**: A script (`npm run ingest`) that scans `docs/standards/*.md` and indexes them automatically.

## Consequences
### Positive
*   **Decoupling**: Standards are just Markdown files. Updating the policy = updating the MD file + running `ingest`. No code changes.
*   **Privacy**: All embeddings and data stay on the local machine (or within the private cloud).
*   **Extensibility**: The MCP server can be easily extended to index other folders (e.g., "Previous Winning Proposals").

### Negative
*   **Complexity**: Adds a new process (MCP Server) that the backend must spawn and manage.
*   **Dependencies**: Requires `apache-arrow` and `onnxruntime` native binaries for local AI.

## Validation
*   Verified by `verify.js` script: The server correctly retrieved "Coverage Policy" from `metrics_policy.md` when queried using semantic search.
