# 🏗️ System Architecture: TenderCheck AI (Cloud-Native)

**Last Updated:** 2026-01-28
**Context:** Master's Thesis (TFM) - Phase 6/7

## 1. High-Level Overview
TenderCheck AI is a **Modular Monolith** deployed on a Cloud-Native infrastructure, designed to validate public tenders using Semantic AI.

### Core Stack
*   **Frontend**: React (Vite) + TailwindCSS.
*   **Backend**: Node.js (Express) + TypeScript.
*   **Database & Vector Store**: **Turso** (LibSQL) - *Serverless SQLite at the Edge*.
*   **AI Engine**: **Google Genkit** (Gemini 2.5 Flash + text-embedding-004).
*   **Infrastructure**: **Render** (Cloud PaaS).

---

## 2. Architecture Diagram (C4 Level 2)

```mermaid
graph TD
    User((User))
    
    subgraph "Render Cloud"
        Frontend[Frontend Application<br/>(React Static Site)]
        Backend[Backend API<br/>(Node.js Web Service)]
    end
    
    subgraph "External Services"
        Turso[(Turso Database<br/>Relational + Vector)]
        Gemini[Google Gemini API<br/>(AI Inference)]
        GoogleAuth[Google OAuth<br/>(Identity)]
    end

    User -->|HTTPS| Frontend
    Frontend -->|REST API| Backend
    Frontend -->|OIDC| GoogleAuth
    
    Backend -->|SQL / Vector Search| Turso
    Backend -->|Genkit SDK| Gemini
```

---

## 3. Key Components

### 3.1 Frontend (Presentation)
*   **Type**: SPA (Single Page Application).
*   **Auth**: Google Identity Services (Implicit Flow).
*   **State**: Context API (Auth, Tenders).
*   **Hosting**: Render Static Site (CDN).

### 3.2 Backend (Application Core)
*   **Pattern**: Clean Architecture (Layers: Presentation -> Application -> Domain <- Infrastructure).
*   **API**: RESTful Express Server (secured with Helmet & CORS).
*   **AI Service**: `GeminiGenkitService` (wraps Google AI SDK).
    *   **Dual Persona Logic**: Uses different prompts for "Extraction" (Auditor) vs "Validation" (Evaluator).
*   **Vector Search**: `VectorSearchService`.
    *   Generates embeddings via `text-embedding-004`.
    *   Queries Turso using `vector_top_k` (LibSQL native vector extension).

### 3.3 Database (Persistence)
*   **Unified Store**: Turso handles both:
    *   **Relational Data**: Users, Tenders, Results.
    *   **Vector Data**: `embedding` column (BLO) in `requirements` table.
*   **Schema**: managed via `schema.sql` (Auto-migration on startup).

---

## 4. Data Flow: Tender Analysis

1.  **Ingestion**: User uploads PDF -> Backend parses text (`pdf-parse`).
2.  **Extraction**: 
    *   Backend chunks text -> calls Gemini (Auditor Persona).
    *   Gemini returns JSON list of `Requirements`.
    *   Backend generates embeddings -> Stores in Turso.
3.  **Validation**:
    *   User uploads Technical Proposal.
    *   Backend chunks Proposal.
    *   **RAG Lookup**: For each chunk, find relevant Requirements in Turso (Vector Search).
    *   **Evaluation**: Gemini (Evaluator Persona) compares Chunk vs Requirement.
    *   Result (`MET`/`NOT_MET`) stored in Turso.
4.  **Reporting**: Frontend fetches results -> Displays Dashboard.

## 5. Security & Scalability
*   **Auth**: Stateless JWT (signed by Backend, verified against Google User).
*   **Isolation**: Backend cleans inputs via Zod schemas.
*   **Scaling**: Render Auto-Sleep (Free Tier) / Horizontal Scaling (Paid).
*   **Database**: Turso is serverless and scales to zero automatically.
