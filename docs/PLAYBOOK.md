# 📘 TenderCheck AI - Developer Playbook

Welcome to the team! This playbook defines **how we work** to ensure high quality and consistency.

## ⚡ Quick Start workflows

### 1. Development Loop
1.  **Start Services**: `npm run dev` (Runs Backend :3000 & Frontend :5173).
2.  **Upload & Validate**: Go to Dashboard. Upload **Pliego** and **Oferta** together for a seamless "One-Click" analysis.
3.  **Check History**: Use the left sidebar to access previous analyses. You can delete incorrect ones using the **TrashIcon**.
4.  **Review Summary**: Check the **Validation Summary** card at the top for quick compliance stats (Mandatory vs Optional).
5.  **Export**: Download the branded **PDF Report** for the final documentation or TFM annexes.
6.  **Finish**: Click "Finalizar y Salir" to reset the state for a new analysis.

### 2. Testing & Quality 🧪
**Quality is non-negotiable.** We use **Vitest** for testing and **Zod** for validation.

| Command | Purpose | Requirement |
|---------|---------|-------------|
| `npm test` | Run all unit tests | Must pass before push |
| `npm run security:scan` | Check for vulnerabilities (Snyk) | **0 High Severity** |
| `npm run test:coverage` | Generate coverage report | **100% Domain**, 80% Global |

> **🛡️ Security Gate:** This project uses a **pre-push hook**. You cannot push to the remote repository if `security:scan` (Snyk) finds vulnerabilities.
> **🔴 Important:** Providing a test suite that fails the coverage threshold will cause the pipeline to fail.

### 3. Architecture Guidelines
- **Domain Layer**: PURE TypeScript. No external libraries (except absolute essentials like `uuid` or `zod` types).
- **Infrastructure Layer**: The ONLY place where you import `fs`, `sqlite`, `pdf-parse`, etc.
- **Database**: We use **SQLite** (a single file `database.sqlite` in the backend folder). Do not commit the `.sqlite` file.
- **Dependency Rule**: Source code dependencies must point **inwards** (Infrastructure -> Application -> Domain).

## 🛡️ Standards & Best Practices
Please read the full [Coding Best Practices](../docs/standards/coding_best_practices.md) and [Testing Policy](../docs/standards/testing_policy.md) documents.

### ✅ Do's
- **Validate Everything**: Use `Zod` schemas for any data entering the system (API inputs, parsed PDF text).
- **ADRs**: Document significant architectural decisions in `docs/adr/`.
- **Errors**: Throw typed Errors (e.g., `DomainError`, `ValidationError`), not generic objects.

### ❌ Don'ts
- **No `any`**: Explicitly type everything.
- **No Logic in UI**: The frontend should only display state provided by the backend.
- **No inline styles**: Use TailwindCSS utility classes.

### 🎨 Frontend Guidelines
- **Premium Aesthetic**: Use `Inter` and `Playfair Display` fonts. Soft shadows.
- **Dark Mode**: Use "Soft Charcoal" (`#242B33` or `#1a1c1a`), avoid pure black.
- **Brand Colors**: Emerald (`emerald-600`) for Actions, Gold (`#C5A028`) for Accents.
- **Smart/Dumb**: `App.tsx` handles state/API, components (e.g., `TenderUpload`) just render.

### 4. Adding Validation Rules
To add a new check for tenders (e.g., "Must be in Madrid"):
1. Create a class implementing `IRule` in `backend/src/domain/validation/rules/`.
2. Implement `validate(analysis)`: Return `ValidationResult` on failure, `null` on pass/neutral.
3. Register the rule in `backend/src/presentation/routes/TenderRoutes.ts` (Composition Root).


### 5. AI & LLM Development 🧠
- **No API Key?** No problem. The system automatically falls back to **Mock Mode** if the API key is missing or quota is exceeded.
- **Structured Outputs**: Always use `zodResponseFormat` when adding new AI features. Never parse raw strings.
- **Prompting**: Keep System Prompts in the Service or a dedicated config. Use clear instructions ("You are...", "Return JSON...").

### 6. Local AI Setup (Ollama) 🦙
To run the analysis without costs/limits:
1.  **Install Ollama**: Download from [ollama.com](https://ollama.com).
2.  **Pull Models**: Run `ollama pull mistral` and `ollama pull nomic-embed-text` (for vector embeddings).
3.  **Start Server**: Run `ollama serve` (or just open the app).
4.  **Verify**: The backend logs will show `Analyzing text with Ollama...`.

### 7. Authentication Flow 🔐
- **Register**: Create a new account at `/register`. Upon success, a JWT is issued automatically and the user is redirected to the dashboard.
- **Login**: Use credentials to obtain a JWT.
- **Session Persistence**: The `AuthContext` performs a defensive check on startup. If a token exists but is malformed (e.g., string `"undefined"`), it is cleared to prevent 401 loops.
- **Protected Routes**: `/dashboard` is secured via `ProtectedRoute.tsx` on the frontend and `authMiddleware.ts` on the backend.

## 📝 Common Commands Cheat Sheet

<!-- SCRIPTS_START -->
| Scope | Command | Description |
|---|---|---|
| **Backend** | `npm run dev` | `tsx watch src/presentation/server.ts` |
| **Backend** | `npm run test` | `vitest run` |
| **Backend** | `npm run test:coverage` | `vitest run --coverage` |
| **Backend** | `npm run lint` | `eslint .` |
| **Backend** | `npm run lint:fix` | `eslint . --fix` |
| **Backend** | `npm run audit:arch` | `depcruise src --config .dependency-cruiser.cjs` |
| **Backend** | `npm run security:scan` | `snyk test` |
| **Backend** | `npm run prepare` | `husky` |
| **Frontend** | `npm run dev` | `vite` |
| **Frontend** | `npm run build` | `tsc -b && vite build` |
| **Frontend** | `npm run lint` | `eslint .` |
| **Frontend** | `npm run preview` | `vite preview` |
| **Frontend** | `npm run security:scan` | `snyk test` |

<!-- SCRIPTS_END -->

### 11. Security & UX Standards
- **User Enumeration Prevention**: NEVER return specific error messages like "User already exists" or "User not found" to the client. Always use generic messages:
  - Login: "Credenciales inválidas"
  - Register: "No se pudo crear la cuenta"
- **Localization**: The UI is Spanish-first. Ensure all new features are fully marked up with Spanish copy.

### 12. Deployment Guide 🚀 (Render + Turso)
- **Hosting**: Render (Web Service + Static Site).
- **Database**: Turso (LibSQL).
- **AI**: Gemini 2.5 Flash (Google AI Studio).

#### Prerequisites
1.  **Turso**: A database created with `CREATE TABLE...` (handled by `SqliteDatabase.ts` auto-init).
2.  **Environment Variables**:
    - `TURSO_DB_URL`: `libsql://...`
    - `TURSO_AUTH_TOKEN`: `...`
    - `GOOGLE_GENAI_API_KEY`: `...`

#### Workflow
1.  **Verify Locally**:
    ```bash
    # Ensure connections are valid before pushing
    cd backend
    npx tsx scripts/verify_cloud.ts
    ```
2.  **Push to GitHub**:
    Render triggers automatically on push to `main` (if configured).

3.  **Troubleshooting**:
    - **"Table not found"**: Check if `SqliteDatabase.initializeSchema()` ran in the logs.
    - **"404 Model"**: Check `GeminiGenkitService` model string and API Key scope.


