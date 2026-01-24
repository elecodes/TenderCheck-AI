# Professional Knowledge MCP Server Design

## 🎯 Goal
Create a modular **Model Context Protocol (MCP)** server that acts as the "External Brain" for TenderCheck AI (and future projects).
It will allow the AI agent to semantically search and retrieve proprietary knowledge (Security Standards, SOLID principles, Project Context) without hallucinating.

## 🏗 Architecture

### Tech Stack
*   **Runtime**: Node.js + TypeScript (To match project ecosystem).
*   **Framework**: `@modelcontextprotocol/sdk` (Official SDK).
*   **Vector Database (Local)**: `LanceDB` (Zero-config, embedded, fast) or `ChromaDB` (Docker). *Decision: LanceDB for simplicity/portability.*
*   **Embeddings**: `Xenova/all-MiniLM-L6-v2` (Local execution via ONNX, free, runs on CPU/Mac).

### Data Structure
The server will watch a root directory `knowledge-base/` with subfolders:
```text
knowledge-base/
├── security/       # OWASP, GDPR guidelines
├── solid/          # Clean Code principles
├── ux/             # Design systems, accessibility
└── tfm-context/    # "Ley de Contratos", Project specifics
```

## 🛠 Tools Exposed

### 1. `consult_my_standards(topic: string)`
*   **Description**: Semantic search across the Knowledge Base.
*   **Logic**:
    1.  Convert `topic` to vector embedding.
    2.  Query LanceDB for top 3-5 relevant chunks.
    3.  Return raw text context to the Agent.

### 2. `apply_security_checklist(context: string)`
*   **Description**: Retrieves specific security checklists relevant to the code/context provided.
*   **Logic**:
    1.  Search specifically in `knowledge-base/security` for "checklist" + `context`.
    2.  Format output as a markdown list.

## 🚀 Scalability Strategy
*   **Auto-Ingestion**: On startup (or via a specific tool `reindex_knowledge`), the server scans the folders.
*   **Chunking**: Large Markdown/PDF files are split into paragraphs/chunks with metadata (Source File, Category).
*   **Universal**: This Server runs as a standalone process (stdio or SSE). Any MCP-compliant client (Claude Desktop, Cursor, TenderCheck Backend) can connect to it.

## 📅 Implementation Steps
1.  **Setup**: `npm init` inside `packages/knowledge-mcp`.
2.  **Ingestion Engine**: Script to read MD/PDFs and store in LanceDB.
3.  **MCP Handler**: Map tools to DB queries.
4.  **Testing**: Verify "What is the policy on Clean Architecture?" returns matches from `solid/` folder.
