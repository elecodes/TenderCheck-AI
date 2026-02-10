# ADR 023: LangSmith Tracing for AI Observability

## Status
Accepted

## Context
As the project transitioned from a monolithic local AI inference (Ollama) to a Cloud-Native architecture using **Google Genkit** and **Gemini 2.5 Flash**, the need for robust observability of AI interactions became critical. 

While environment variables like `LANGCHAIN_TRACING_V2` were initially set, Genkit (unlike LangChain) does not natively support automatic tracing to LangSmith. This lack of visibility made it difficult to debug prompt performance, especially for complex requirements like multi-year experience or insurance certifications.

## Decision
We decided to integrate the **LangSmith SDK** (`langsmith`) into the backend and manually instrument the AI service methods.

1.  **Library**: Added `@langchain/langsmith` as a backend dependency.
2.  **Instrumentation**: Wrapped core methods in `GeminiGenkitService` (`analyze`, `compareProposal`, `compareBatch`) using the `traceable` function.
3.  **Naming Convention**: Standardized trace names (e.g., `analyze_tender`, `compare_proposal`) to improve dashboard searchability.
4.  **Configuration**: Continued using standard `LANGCHAIN_*` environment variables for authentication and project routing.

## Consequences

### Positive
- **Full Traceability**: Every AI generation now logs input/output schemas, system prompts, and full context to the LangSmith dashboard.
- **Prompt Optimization**: Real-world traces allowed for the refinement of the "Senior Evaluator" prompt, specifically improving the extraction of numerical experience requirements.
- **Debugging**: Production errors or unexpected AI responses can now be audited post-execution.

### Negative
- **Manual Maintenance**: Any new AI methods must be manually wrapped with `traceable`.
- **Dependency**: Adds a small dependency on the LangChain ecosystem within a Genkit project.
