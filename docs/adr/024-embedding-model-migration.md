# ADR 024: Migration to gemini-embedding-001 (3072 Dimensions)

## Status
Accepted

## Date
2026-02-11

## Context
Since the release of Google Genkit v1.28.0, the previous identifier `text-embedding-004` (and its alias `embedding-001`) became unregistered in the `@genkit-ai/google-genai` plugin. Attempts to use these identifiers resulted in a 404 error from the Google AI SDK.

Through registry inspection, it was discovered that the new official identifier for embeddings is `googleai/gemini-embedding-001`. 

## Decision
We decided to:
1.  **Switch to `googleai/gemini-embedding-001`**: This is the current supported model in Genkit 1.28.0.
2.  **Upgrade to 3072 Dimensions**: The `gemini-embedding-001` model operates at 3072 dimensions by default, compared to the 768 dimensions of `text-embedding-004`.
3.  **Update Global Configuration**: Set `EMBEDDING_DIMENSIONS: 3072` in `genkit.config.ts`.
4.  **Standardize Environment Variables**: Use `GOOGLE_API_KEY` alongside `GOOGLE_GENAI_API_KEY` for better compatibility with newer plugins.

## Consequences

### Technical
- **Higher Fidelity**: 3072 dimensions provide a richer semantic representation than 768 dimensions.
- **Breaking Change for DB**: Existing vectors stored in the `requirements` table (768-D) are now incompatible with new query vectors (3072-D).
- **Storage Increase**: Per-record storage for embeddings will increase by approximately 4x.

### Maintenance
- **Data Flush Required**: Users must re-process their PDFs to populate the database with 3072-D vectors.
- **Standardized Setup**: Adoption of `GOOGLE_API_KEY` aligns the project with standard Google Cloud/AI conventions.

## References
- [Genkit Issue: Embedding identifier change](https://github.com/firebase/genkit/issues)
- [Gemini Embedding Model Documentation](https://ai.google.dev/gemini-api/docs/models/gemini#embedding)
