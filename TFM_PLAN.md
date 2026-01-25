# TFM & Auth Plan

## 1. TFM Documentation (The Report)
- [ ] **Chapter 3: Architecture & Design**
    - [ ] Document the "Zero-Cost Local RAG" pattern (Transformers.js + Ollama).
    - [ ] Explain the "Fallback Strategy" (Resilience).
    - [ ] Diagram: System Overview (Mermaid).
- [ ] **Chapter 4: Implementation**
    - [ ] Describe the Dependency Injection approach (SOLID).
    - [ ] Show the file-based Knowledge Base "learning" process.

## 2. Authentication Feature (New Branch: `feat/auth-forms`)
- [ ] **Frontend (React)**
    - [ ] Create `/login` route & page.
    - [ ] Create `/register` route & page.
    - [ ] Implement Formik + Zod validation.
    - [ ] Add JWT storage logic (Context/Zustand).
- [ ] **Backend (Node/Express)**
    - [ ] `AuthController` (login/register endpoints).
    - [ ] `AuthService` (Password hashing with bcrypt, JWT signing).
    - [ ] Middleware: `authenticateToken`.
