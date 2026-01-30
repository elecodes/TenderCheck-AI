# TFM & Auth Plan

## 1. TFM Documentation (The Report)
- [x] **Chapter 3: Architecture & Design**
    - [x] Document the "Zero-Cost Local RAG" pattern (Transformers.js + Ollama).
    - [x] Explain the "Fallback Strategy" (Resilience).
    - [x] Diagram: System Overview (Mermaid).
- [x] **Chapter 4: Implementation**
    - [x] Describe the Dependency Injection approach (SOLID).
    - [x] **Pivot:** Document Migration to Render + Turso + Gemini (ADR 012).

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

## 3. Cloud Deployment (Phase 6)
- [x] **Render**: Setup `render.yaml` blueprint.
- [x] **Turso**: Migrate DB to LibSQL Client.
- [x] **Gemini**: Integrate Gemini 2.5 Flash for AI analysis.

