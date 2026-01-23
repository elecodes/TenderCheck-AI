# 📑 Software Requirements Specification (SRS) - TenderCheck AI

## 1. Project Overview
**TenderCheck AI** is an intelligent assistant designed to automate the formal validation of public tender documents. It compares a "Pliego de Condiciones" (Tender Requirements) against a "Propuesta Técnica" (Technical Offer) using a hybrid approach of deterministic rules and LLM-based semantic reasoning.

## 2. Professional & Academic Standards (MANDATORY)
*Based on Master's Final Project Official Guidelines:*
- **Architecture:** Clean Architecture (Domain, Application, Infrastructure, Presentation).
- **Quality Gate:** Minimum **80% code coverage** enforced via Vitest.
- **Security:** - Runtime validation using **Zod**.
    - Security headers via **Helmet.js**.
    - Input sanitization (XSS prevention).
- **DevOps:** GitHub Actions for CI/CD, Husky for pre-push hooks.
- **AI Ethics:** Every AI decision must include an `explanation` and `evidence` from the source text.

## 3. Functional Requirements (FR)
- **FR-1: Document Ingestion:** The system must accept two PDF files (Pliego and Offer).
- **FR-2: Text Extraction:** Convert PDF content into normalized text for processing.
- **FR-3: Requirement Extraction:** Use LLM orchestration (LangChain/Genkit) to identify mandatory administrative requirements from the Pliego.
- **FR-4: Compliance Validation:** - Check for presence of mandatory documents (Rule-based).
    - Analyze semantic alignment of technical descriptions (AI-based).
- **FR-5: Status Attribution:** Each requirement must be marked as `COMPLIANT`, `NON_COMPLIANT`, or `AMBIGUOUS`.
- **FR-6: Report Generation:** Produce a final validation report in JSON and a human-readable UI dashboard.

## 4. Non-Functional Requirements (NFR)
- **NFR-1: Transparency:** The system must specify if a result was obtained via `RULE` or `AI`.
- **NFR-2: Performance:** Initial document analysis should provide immediate feedback (loading states/streaming).
- **NFR-3: Reliability:** The system must handle PDF parsing errors gracefully without crashing the process.

## 5. Technical Stack
- **Runtime:** Node.js (LTS)
- **Language:** TypeScript (Strict Mode)
- **AI Framework:** LangChain / Genkit
- **Testing:** Vitest
- **Validation:** Zod
- **API Security:** Helmet, Rate Limiting

## 6. Project Constraints & Scope
- **Domain:** Limited to IT/Software services tenders.
- **Out of Scope:** Economic evaluation, automated legal binding decisions, and OCR for handwritten documents.