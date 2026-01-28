# 12. Cloud Architecture Pivot: Render, Turso, and Gemini

Date: 2026-01-28

## Status

Accepted

## Context

The initial deployment strategy relied on Hugging Face Spaces (Docker) running a monolithic container with:
1.  Node.js Backend
2.  Ollama (Local LLM Inference) with Mistral
3.  SQLite (Local File Persistence)

However, we encountered significant blockers:
1.  **Timeout Issues**: The "heavy" container (Ollama + Models) took >5 minutes to start, causing Hugging Face health checks to fail consistently ("Launch timed out").
2.  **Resource Constraints**: The free tier of Hugging Face Spaces (2 vCPU, 16GB RAM) struggled with simultaneous Node.js + Ollama inference load.
3.  **Persistence Issues**: SQLite on Docker containers in serverless-like environments is ephemeral. While we mounted a dataset, permissions and "baked-in" dependencies caused frequent `exit code 127` and write errors.

## Decision

We have decided to pivot to a **Modular Cloud Architecture** compatible with free-tier constraints:

1.  **Hosting: Render.com**
    *   **Why**: Native Node.js support, faster build times, and zero-downtime deployments for web services.
    *   **Tier**: Free Tier (spins down after inactivity, but sufficient for TFM demo).

2.  **Database: Turso (LibSQL)**
    *   **Why**: Serverless SQLite that solves the persistence problem. It offers a generous free tier (9GB storage, 1B requests).
    *   **Change**: Migrated from `better-sqlite3` to `@libsql/client`.

3.  **AI Inference: Google Gemini 2.5 Flash**
    *   **Why**: To remove the heavy Ollama dependency from the application container.
    *   **Performance**: Gemini 2.5 Flash is extremely fast and provides a free tier via Google AI Studio, decoupling inference load from our hosting server.
    *   **Integration**: Using `Google Genkit` for structured output and type safety.

## Consequences

### Positive
*   **Deployment Stability**: Application startup is now instant (<5s) as it no longer loads AI models into memory.
*   **Persistence**: Data is safely stored in Turso's distributed database, surviving restarts/redeployments.
*   **Performance**: AI analysis is significantly faster (cloud inference vs local CPU inference).
*   **Developer Experience**: Simplified Dockerfile (or removal thereof) and standard `npm start` workflow.

### Negative
*   **Latency**: Potential network latency for DB/AI calls (mitigated by EU region selection).
*   **Dependency**: Dependency on external services (Turso, Google) instead of a fully self-contained offline container.
*   **Cold Starts**: Render's free tier has cold starts, but they are faster than the previous Docker timeout loops.

## Compliance
This architecture adheres to the TFM requirement of "Modern Web Development" and "Cloud Native" patterns while respecting the "Zero Cost" constraint.
