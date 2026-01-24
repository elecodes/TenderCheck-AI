# TenderCheck AI - System Architecture Overview

## 1. High-Level Architecture
The system follows a **Modular Monolith** pattern with an **Agentic Knowledge Extension**.

```mermaid
graph TD
    User[User (Frontend)] <--> API[Backend API (Node.js/Express)]
    
    subgraph "Core Backend"
        API --> Auth[Auth Service]
        API --> Tender[Tender Analysis Service]
        API --> Compare[Comparison Service]
    end
    
    subgraph "AI Layer"
        Tender --> OpenAI[OpenAI GPT-4]
        Compare --> OpenAI
    end
    
    subgraph "Knowledge Layer (Local RAG)"
        Compare -- "Direct Call" --> LegalService[LocalRAGLegalService]
        LegalService --> VectorBase[(In-Memory/LanceDB)]
        LegalService --> OpenAI[Embedding Engine]
    end
    
    VectorDB <.. "Ingested" .. Docs[docs/standards/*.md]
```

## 2. Component Roles

### A. Core Backend (`/backend`)
*   **Role**: Orchestrates the business logic, handles HTTP requests, and manages the PDF parsing pipeline.
*   **Responsibilities**:
    *   User Authentication.
    *   File Upload & storage.
    *   Calling OpenAI for general text analysis.
    *   **New**: Acting as an "MCP Client" to consult the Knowledge Base.

### B. Knowledge Layer (Local RAG)
*   **Role**: Specialized service (`LocalRAGLegalService`) that retrieves legal context from `knowledge_base/`.
*   **Mechanism**:
    *   **Input**: Query string (e.g., "Presupuesto base").
    *   **Process**: Embeds query -> Cosine Similarity -> Returns citations.
    *   **Output**: List of `LegalCitation` objects.
*   **Data Source**: `knowledge_base/processed/` (or in-memory mock for MVP).

### C. Vector Database (LanceDB)
*   **Role**: Local, serverless vector storage.
*   **Why**: Zero-latency, privacy-first, no external dependencies.
*   **Content**: Embeddings of all Policy and Standard documents.

## 3. Data Flow ( The "Flujo")

### usage Scenario: Comparison Validation
When the system compares a "Pliego" (Request) against an "Oferta" (Proposal):

1.  **User** uploads standard PDFs and requests comparison.
2.  **Backend** parses PDFs into text.
3.  **Backend** initializes the AI Agent for validation.
4.  **Backend** (via MCP Client) asks **MCP Server**:
    *   *"Are there specific security constraints defined in our standards?"*
5.  **MCP Server**:
    *   Generates embedding for query.
    *   Searches **LanceDB**.
    *   Returns chunks from `security_policy.md`.
6.  **Backend**:
    *   Injects these standards into the Context Window of GPT-4.
    *   Prompts GPT-4: *"Validate this Proposal against the Pliego AND these Security Standards."*
7.  **Result**: A compliance report is returned to the user, referencing both the PDF and the Internal Policy.

## 4. Technical Requisites
*   **Node.js**: v20+ (ES Modules enabled).
*   **OpenAI API Key**: Required for "High Fidelity" mode.
*   **Local Hardware**: CPU support for ONNX (if falling back to local embeddings).
