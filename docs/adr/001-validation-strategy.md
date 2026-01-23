# ADR-001: Runtime Validation Strategy
**Fecha**: 2026-01-23

## Status
Accepted

## Context
The TenderCheck AI system processes external inputs (PDFs, API requests) and generates structured outputs via LLMs. To ensure system reliability and security (SRS Section 2), we need a robust mechanism to validate data integrity at the system boundaries. TypeScript provides compile-time safety but guarantees nothing at runtime.

## Decision
We will use **Zod** for schema declaration and runtime validation.

### Justification
1.  **Runtime Safety**: Zod parses unknown data (like parsed PDF text or LLM JSON outputs) and throws errors if the structure doesn't match.
2.  **TypeScript Integration**: Zod infers TypeScript types from schemas, reducing duplication (Single Source of Truth).
3.  **Developer Experience**: Chaineable interface and clear error messages.
4.  **Ecosystem**: Integrating Zod with LLM frameworks (like LangChain) is standard practice for "Structured Output".

## Consequences
- **Positive**: All external data will be strictly validated. Failed validations will be caught early with descriptive errors.
- **Negative**: Slight runtime overhead (negligible for our document processing use case).
- **Compliance**: directly satisfies the "Security: Runtime validation using Zod" requirement from `PROJECT_PLAN.md`.
