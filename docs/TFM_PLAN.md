# TFM & Auth Plan

## 1. TFM Documentation (The Report)
- [x] **Chapter 3: Architecture & Design**
    - [x] Document the "Zero-Cost Local RAG" pattern (Transformers.js + Ollama).
    - [x] Explain the "Fallback Strategy" (Resilience).
    - [x] Diagram: System Overview (Mermaid).
- [x] **Chapter 4: Implementation**
    - [x] Describe the Dependency Injection approach (SOLID).
    - [x] **Pivot:** Document Migration to Render + Turso + Gemini (ADR 012).
    - [x] **Auth UX:** Documented "Remember Me" & Interstitial patterns (ADR 020).
    - [x] **Dynamic Validation:** Documented Industry-Specific Factory pattern (ADR 022).
    - [x] **Observability:** Integrated LangSmith for AI tracing and prompt optimization (ADR 023).
- [x] **Model Migration:** Pivoted to gemini-embedding-001 (3072D) due to Genkit updates (ADR 024).

## 2. Authentication Feature (New Branch: `feat/auth-forms`)
- [x] **Frontend (React)**
    - [x] Create `/login` route & page.
    - [x] Create `/register` route & page.
    - [x] Implement Formik + Zod validation.
    - [x] Add JWT storage logic (Context/Zustand).
- [x] **Backend (Node/Express)**
    - [x] `AuthController` (login/register endpoints).
    - [x] `AuthService` (Password hashing with bcrypt, JWT signing).
    - [x] Middleware: `authenticateToken`.
    - [x] **Google Sign-In** Integrated.
    - [x] **UX Enhancements**: Remember Me, Welcome Screen, Switch User.

## 3. Cloud Deployment (Phase 6)
- [x] **Render**: Setup `render.yaml` blueprint.
- [x] **Turso**: Migrate DB to LibSQL Client.
- [x] **Gemini**: Integrate Gemini 2.5 Flash for AI analysis.
- [x] **COVR**: Achieved 71% Core Branch / 60% Global Coverage.
- [x] **E2E**: Validated "Happy Path" with Playwright (Video Artifact).

## 4. Industry Specificity (Phase 7)
- [x] **Dynamic Context**: Implemented `industry_presets` for data-driven validation.
- [x] **Factory Pattern**: Decoupled rule instantiation from the Composition Root.
- [x] **Presets**: Seeded "Digital Services" and "Construction" defaults.
