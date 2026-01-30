# ADR 015: Frontend UI Refinements and CORS Security Strategy

## Status
Accepted

## Date
2026-01-30

## Context
During the final polish phase (User Feedback Loop), several usability and visual issues were identified:
1.  **Typography**: The application felt too "generic SaaS" and lacked the gravitas required for a legal/auditing tool.
2.  **Readability**: Long AI-generated summaries were being visually truncated or appearing as large blocks of intimidating text.
3.  **Security**: The separation of frontend (Vercel/Render) and backend (Render) caused CORS issues when strictly closing down access.

## Decision

### 1. Typography & Aesthetic
*   **Adoption of Serif Fonts**: We introduced `Playfair Display` (via Tailwind `font-serif`) for high-value headings (Dashboard Hero, Analysis Titles, Key Requirements).
*   **Rationale**: Serif fonts convey authority, tradition, and trustworthiness—key attributes for a "Tender Audit" tool. It visually differentiates the app from standard Bootstrap/Tailwind administrative dashboards.

### 2. Dynamic Layouts
*   **Problem**: AI-generated titles varied wildly in length (from 10 to 300 characters).
*   **Solution**: Implemented dynamic font sizing in `AnalysisResults.tsx`.
    *   `length > 80`: Use `text-xl` (Paragraph style)
    *   `length <= 80`: Use `text-3xl` (Headline style)
*   **Layout Refactor**: Moved action buttons (JSON/PDF) to a separate row below the title to prevent horizontal cramping.

### 3. Backend Data Constraints
*   **Issue**: The backend service `GeminiGenkitService.ts` was arbitrarily truncating summaries to 100 characters, leading to incomplete sentences.
*   **Fix**: Increased limit to 500 characters. The database schema uses `TEXT` (SQLite), which handles this length without schema migration.

### 4. CORS Strategy
*   **Problem**: `Access-Control-Allow-Origin: *` is insecure for production.
*   **Solution**: Implemented a dynamic whitelist approach in `server.ts`.
    *   Usage: `process.env.ALLOWED_ORIGINS` (Comma-separated list).
    *   Logic: checks `indexOf(origin)` or allows all if `NODE_ENV !== production`.
    *   Benefit: Strictly limits API access to our known frontend domains while keeping local dev easy.

## Consequences
*   **Positive**: Significant improvement in perceived quality and readability. Security posture hardened for production.
*   **Negative**: Slight increase in CSS complexity (dynamic classes). Need to manage `ALLOWED_ORIGINS` carefully in deployment environments to avoid blocking legitimate users.
