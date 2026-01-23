# ADR 003: AI Integration & Resilience Strategy

* Status: accepted
* Deciders: Elena, Senior Architect
* Date: 2026-01-23

## Context and Problem Statement
We need to extract structured technical requirements from unstructured PDF text. 
Direct regex matching showed limitations (false positives/negatives).
However, calling an LLM API (OpenAI) introduces latency, cost, and potential failure points (rate limits, quota exhaustion).

## Decision Drivers
*   **Accuracy**: Need semantic understanding of requirements (Mandatory vs Optional).
*   **Resilience**: The system must not crash if the AI API is down or quota is exceeded.
*   **Developer Experience**: Developers without paid API keys must be able to work on the project.

## Decision Outcome
Chosen option: **"Hybrid Approach: OpenAI (GPT-4o) + Dictionary-based Mock Fallback"**.

### Architecture
1.  **Primary Interface**: `ITenderAnalyzer` (Clean Architecture).
2.  **Implementation**: `OpenAIModelService`.
3.  **Mechanism**:
    *   Attempt call to OpenAI API using `gpt-4o-2024-08-06` with **Structured Outputs** (Zod Schema).
    *   Catch specific errors (`429 Rate Limit`, `401 Unauthorized`, `insufficient_quota`).
    *   If error is detected, transparently switch to `getMockAnalysis()` which returns a hardcoded, valid `TenderAnalysis` object.

### Justification
*   **Robustness**: Ensures the application remains functional for testing and demo purposes even without live AI.
*   **Structure**: Using OpenAI's JSON mode guarantees the backend logic never receives malformed data.
*   **Cost Efficiency**: Prevents accidental wallet drain during development loops using the Mock mode.

### Positive Consequences
*   Zero-config start for new developers (Mock mode works out of the box).
*   High semantic accuracy when API is available.

### Negative Consequences
*   Mock data is static and does not reflect the actual uploaded PDF content in fallback mode.
