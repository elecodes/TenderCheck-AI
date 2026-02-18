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
    - [x] **Resilience**: Implemented Hybrid Auth (Cookie + Header Fallback) for cross-site reliability (ADR 027).
    - [x] **Error Handling**: Implemented robust 401 handling and cache prevention (ADR 029).

## 3. UI/UX Evolution (Phase 6)
- [x] **Global Theme**: Implemented Light/Dark mode with context persistence (ADR 030).
- [x] **Glassmorphism**: Unified Landing Page and Dashboard aesthetic.
- [x] **Responsive**: Optimized sidebar and layouts for all devices.

## 4. Cloud Deployment (Phase 7)
- [x] **Render**: Setup `render.yaml` blueprint.
- [x] **Turso**: Migrate DB to LibSQL Client.
- [x] **Gemini**: Integrate Gemini 2.5 Flash for AI analysis.
- [x] **COVR**: Achieved **100% Domain / 92% Global Coverage** (Exceeded Goals).
- [x] **Security**: Automated vulnerability scanning with Snyk (CI/CD Gate).
- [x] **E2E**: Validated "Happy Path" with Playwright (Video Artifact).

## 5. Industry Specificity (Phase 8)
- [x] **Dynamic Context**: Implemented `industry_presets` for data-driven validation.
- [x] **Factory Pattern**: Decoupled rule instantiation from the Composition Root.
- [x] **Presets**: Seeded "Digital Services" and "Construction" defaults.
