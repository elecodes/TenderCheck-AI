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
- **FR-1: Document Ingestion:** The system must accept a PDF file (Tender Documents).
- **FR-2: Text Extraction:** Convert PDF content into normalized text for processing.
- **FR-3: Semantic Search & RAG:** 
    - Use **Google Genkit (`text-embedding-004`)** to generate vector embeddings.
    - Store and retrieve embeddings via **Turso (LibSQL)**.
- **FR-4: Requirement Extraction:** 
    - **Dual Persona Strategy**:
        - **"Legal Auditor"**: Extracts strict mandatory requirements ("deberá", "obligatorio").
        - **"Senior Evaluator"**: Validates semantic compliance of technical proposals.
- **FR-5: Compliance Validation:** Real-time checking of proposals against extracted requirements.
- **FR-6: Status Attribution:** 
    - `COMPLIANT` (Green)
    - `NON_COMPLIANT` (Red)
    - `PARTIALLY_MET` (Amber) - *New*
- **FR-7: Report Generation:** Produce a final validation report and a dashboard with **AI Reliability Score**.

## 4. Non-Functional Requirements (NFR)
- **NFR-1: Transparency:** The system must specify if a result was obtained via `RULE` or `AI`.
- **NFR-2: Performance:** 
    - **Context Window**: Support up to **1M tokens** via Gemini 1.5 Flash.
    - **Response Time**: <60 seconds for full tender analysis (Render Free Tier constraints).
- **NFR-3: Reliability:** The system must handle PDF parsing errors gracefully.
- **NFR-4: Observability:** Integrated **Sentry** for error tracking.

## 5. Technical Stack
- **Runtime:** Node.js (LTS 22+)
- **Language:** TypeScript (Strict Mode)
- **AI Framework:** **Google Genkit** (Gemini 1.5 Flash + text-embedding-004)
- **Database:** **Turso** (Distributed SQLite)
- **Frontend:** React + Vite + TailwindCSS
- **Deployment:** **Render** (Cloud Native)
- **Testing:** Vitest
- **Validation:** Zod
- **API Security:** Helmet, Rate Limiting, CORS

## 6. Project Constraints & Scope
- **Domain:** Limited to IT/Software services tenders.
- **Out of Scope:** Economic evaluation, automated legal binding decisions, and OCR for handwritten documents.