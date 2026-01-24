# ADR 004: Proposal Validation & Comparison Logic

* Status: accepted
* Deciders: Elena, Senior Architect
* Date: 2026-01-24

## Context and Problem Statement
We need to validate that a "Technical Proposal" (Oferta) meets the "Mandatory Requirements" extracted from the "Tender Document" (Pliego).
The comparison needs to be semantic (understanding meaning), not just keyword matching.

## Decision Drivers
*   **User Experience**: Users need distinct steps (Extract first, then Validate).
*   **Performance**: Comparing large PDFs against many requirements is expensive.
*   **Resilience**: Must support the existing Mock/Offline mode.

## Decision Outcome
Chosen option: **"Two-Stage Validation with Use Case Logic"**.

### Architecture
1.  **Frontend**: 
    *   Stage 1: Upload Pliego -> Get `TenderAnalysis` (Requirements).
    *   Stage 2: Upload Oferta -> Call `validateProposal` endpoint.
2.  **Backend**:
    *   Use Case `ValidateProposal`: Orchestrates the flow.
    *   Adapter `PdfParserAdapter`: Reused to parse the Proposal PDF.
    *   Service `OpenAIModelService`: Extended with `compareProposal(requirement, proposalText)`.

### Logic
*   For MVP, we limit validation to the **Top 5 Mandatory Requirements** to save tokens and time.
*   The comparison returns a `ComparisonResult` entity:
    *   `status`: MET / NOT_MET
    *   `confidence`: 0-100%
    *   `evidence`: Quote from the text (or simulation).

### Safety Nets
*   If OpenAI Quota is exceeded, the service falls back to `getMockAnalysis` logic which now forces a "COMPLIANT" demo state for visualization.
