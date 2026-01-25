# ADR 005: Local-First AI & Authentication Strategy

## Status
Accepted

## Context
The project initially relied on OpenAI for tender analysis and lacked a user authentication system.
- **Cost/Privacy**: Using OpenAI requires API keys and sending sensitive tender data to external servers.
- **User Identity**: There was no way to segregate data between users or save progress.
- **Developer Experience**: External dependencies (API quotas) caused friction during development/testing.

## Decision
We have decided to move to a **Local-First** architecture for Phase 11.

1.  **Local AI (Ollama)**: 
    - Replaced `OpenAIModelService` with `OllamaModelService`.
    - Uses `llama3` (or lightweight equivalents) running locally via Ollama.
    - **Pros**: Zero cost, privacy-preserving (data never leaves machine), no rate limits.
    - **Cons**: Requires local hardware resources (RAM/CPU).
    - **Mitigation**: Implemented input text truncation (4k chars) and strict "JSON-only" prompts to prevent freezing/hallucinations.

2.  **JWT Authentication**:
    - Implemented `AuthService` using `bcrypt` (hashing) and `jsonwebtoken` (session).
    - Frontend stores JWT in `localStorage`.
    - **Data Persistence**: Currently using `InMemoryUserRepository` for MVP speed (resets on restart).

## Consequences
- **Positive**: The app is now fully self-contained and free to run. Developers can test indefinitely without costs.
- **Negative**: "Mock Mode" is less central now (Ollama is the primary), but fallback logic is still preserved for robustness.
- **Risk**: Local models (Llama 3 8B) are less smart than GPT-4o. We implemented heuristic post-processing (e.g., keyword detection for "Optional" requirements) to compensate for lower reasoning capabilities.

## Technical Details
- **Dependency Replaced**: `openai` -> `ollama`
- **New Dependency**: `bcrypt`, `jsonwebtoken`
- **Infrastructure**: Backend now requires a running Ollama instance on port 11434.
