# 📘 TenderCheck AI - Developer Playbook

Welcome to the team! This playbook defines **how we work** to ensure high quality and consistency.

## ⚡ Quick Start workflows

### 1. Development Loop
1.  **Start Services**: `npm run dev` (Runs Backend :3001 & Frontend :3000).
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
| `npm run test:coverage` | Generate coverage report | **100% Domain** / **100% Frontend Components** (Absolute Reliability) |
| `npx playwright test` | Run E2E Tests | Must pass before major releases |

> **🛡️ Security Gate:** This project uses a **pre-push hook** (Husky). You cannot push to the remote repository if:
> 1. `security:scan` (Snyk) finds vulnerabilities.
> 2. `test:coverage` fails to meet the **80% Global / 100% Domain** threshold.
>
> **💡 Why 100/80?** We enforce **Absolute Reliability** on critical **Domain logic** (Rules, Validation) and ensuring robust error handling in all layers.
> **🔴 Important:** Attempting to bypass these hooks is a violation of the [Quality Metrics Policy](/standards/quality_metrics).
> **Note:** Tests run locally. CI (GitHub Actions) runs lint + build only due to rolldown native binding issues on Linux runners.

### 3. Architecture Guidelines
- **Domain Layer**: PURE TypeScript. No external libraries (except absolute essentials like `uuid` or `zod` types).
- **Infrastructure Layer**: The ONLY place where you import `fs`, `sqlite`, `pdf-parse`, etc.
- **Database**: We use **SQLite** (a single file `database.sqlite` in the backend folder). Do not commit the `.sqlite` file.
- **Dependency Rule**: Source code dependencies must point **inwards** (Infrastructure -> Application -> Domain).

## 🛡️ Standards & Best Practices
Please read the full [Coding Best Practices](/standards/coding_best_practices) and [Testing Policy](/standards/testing_policy) documents.

### ✅ Do's
- **Validate Everything**: Use `Zod` schemas for any data entering the system (API inputs, parsed PDF text).
- **ADRs**: Document significant architectural decisions in `docs/adr/`.
- **Errors**: Throw typed Errors (e.g., `DomainError`, `ValidationError`), not generic objects. Use `AppError` for operational errors (4xx).

### ❌ Don'ts
- **No `any`**: Explicitly type everything.
- **No Logic in UI**: The frontend should only display state provided by the backend.
- **No inline styles**: Use TailwindCSS utility classes.

### 🎨 Frontend Guidelines
- **Premium Aesthetic**: Use `Inter` and `Playfair Display` fonts. **Glassmorphism** cards with backdrop blur.
- **Global Theme**: Support for both **Light** (Crema/Gold) and **Dark** (Charcoal/Emerald) modes.
- **Brand Colors**: Emerald (`emerald-600`) for Actions, Gold (`#C5A028`) for Accents.
- **Mobile First**: Minimum touch target of 44px (padding > p-2.5). Ensure high contrast on mobile cards (`bg-zinc-900/95`).
- **Smart/Dumb**: `App.tsx` handles state/API, components (e.g., `TenderUpload`) just render.

### 4. Adding Validation Rules
To add a new check for tenders:
1.  **Static Rules**: Create a class implementing `IRule` in `backend/src/domain/validation/rules/`.
2.  **Dynamic Industry Rules**: The `ScopeValidationRule` is now dynamic. To add a new industry, insert a row into the `industry_presets` table in Turso:
    ```sql
    INSERT INTO industry_presets (id, name, positive_keywords, negative_keywords)
    VALUES ('healthcare', 'Healthcare', '["sanitario", "hospital"]', '["obra", "software"]');
    ```
3.  **Registration**: Register new static rules in `ValidationRuleFactory.ts` or ensure the factory picks up the new industry from the DB.
4.  **Composition**: The `CreateTender` use case uses the factory to initialize rules based on the user's industry selection.


### 5. AI & LLM Development 🧠
- **No API Key?** No problem. The system automatically falls back to **Mock Mode** if the API key is missing or quota is exceeded.
- **Structured Outputs**: Always use `zodResponseFormat` when adding new AI features. Never parse raw strings.
- **Prompting**: Keep System Prompts in the Service or a dedicated config. Use clear instructions ("You are...", "Return JSON...").
- **Observability**: Use **LangSmith** to monitor AI performance. Ensure `LANGCHAIN_API_KEY` is set. Tracing is manually instrumented via the `traceable` wrapper in `GeminiGenkitService`.

### 5.1 Large PDF Processing (Chunking)
- **Threshold**: PDFs with > 15 pages automatically use chunked processing.
- **Chunk Size**: 10 pages per chunk (configurable in `constants.ts`).
- **Parallelism**: Up to 3 chunks processed concurrently.
- **Context**: Each chunk includes metadata ("Analyzing pages X-Y of total Z") so the AI knows its relative position.
- **Error Handling**: Failed chunks don't crash the entire process - they are logged and skipped.
- **Files**: 
  - `backend/src/infrastructure/utils/chunking.ts` - Chunking utility
  - `IPdfParser.parsePages()` - Page extraction
  - `ITenderAnalyzer.analyzeChunks()` - Parallel processing


### 6. Authentication Flow 🔐
- **Register**: Create a new account at `/register`. Upon success, a JWT is issued automatically and the user is redirected to the dashboard.
- **Login**: Use credentials or **Google Sign-In (Native Redirect Mode)** to obtain a JWT. The Google flow uses a manual full-page redirection to bypass COOP/COEP browser restrictions on shared domains.
- **Global Capture**: The `AuthContext` globally monitors for auth tokens in the URL fragment after redirect.
- **Session Persistence**: 
  - **Mechanic**: Hybrid Strategy.
    1. **Primary**: `HttpOnly` Cookies (Secure, SameSite) for security.
    2. **Fallback**: `Authorization: Bearer <token>` header for reliability on restrictive networks/browsers (ADR 027).
  - "Remember Me": Sets cookie expiration to 30 days. Unchecked = Session Cookie.
  - **Interstitial**: Returning users see a "Welcome Back" screen with a "Switch User" option.
- **Error Handling**: 
  - **401 Unauthorized**: Triggers immediate client-side logout to prevent zombie sessions.
  - **Caching**: All auth endpoints use `Cache-Control: no-store` (ADR 029).
- **Protected Routes**: `/dashboard` is secured via `ProtectedRoute.tsx`.

### 7. Performance & Caching Strategy 🚀
*   **Current State**: Real-time fetching (Fetch-on-mount). We prioritize strictly fresh data over instant navigation.
*   **Future Actions**: If dashboard loading exceeds **800ms**, we will migrate to **React Query** (TanStack Query) with a 5-minute `staleTime`.
*   **Reference**: See [ADR 016](/adr/020-caching-strategy).

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
| **Frontend** | `npm run dev` | `vite --port 3000` |
| **Frontend** | `npm run build` | `tsc -b && vite build` |
| **Frontend** | `npm run lint` | `eslint .` |
| **Frontend** | `npm run preview` | `vite preview` |
| **Frontend** | `npm run security:scan` | `snyk test` |
| **E2E** | `npx playwright test` | Run E2E tests headless |
| **E2E** | `npx playwright test --ui` | Run E2E tests with UI runner |

<!-- SCRIPTS_END -->

### 8. Security & UX Standards
- **User Enumeration Prevention**: NEVER return specific error messages like "User already exists" or "User not found" to the client. Always use generic messages:
  - Login: "Credenciales inválidas"
  - Register: "No se pudo crear la cuenta"
- **Localization**: The UI is Spanish-first. Ensure all new features are fully marked up with Spanish copy.

### 9. Deployment (Hybrid: Vercel + Render)
Frontend is hosted on **Vercel**, Backend on **Render**.
Pushing to `main` triggers auto-deployment on both platforms.

**Note:** Google Auth is fully supported via the manual redirect flow.
See `docs/adr/036-vercel-frontend-deployment.md` for details.

#### Infrastructure
- **Frontend**: Vercel (Global CDN).
- **Backend**: Render (Web Service).
- **Database**: Turso (LibSQL).
- **AI**: Gemini 2.5 Flash (Google AI Studio).

#### Prerequisites
1.  **Turso**: A database created with `CREATE TABLE...` (handled by `SqliteDatabase.ts` auto-init).
2.  **Environment Variables (Vercel - Frontend)**:
    - `VITE_API_BASE_URL`: URL of the Render backend.
    - `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID.
    - `VITE_ENABLE_GOOGLE_AUTH`: `true`.
3.  **Environment Variables (Render - Backend)**:
    - `TURSO_DB_URL`: `libsql://...` or `https://...`.
    - `TURSO_AUTH_TOKEN`: `...`
    - `GOOGLE_GENAI_API_KEY`: `...`
    - `ALLOWED_ORIGINS`: Comma-separated list (Vercel domains).

#### Workflow
1.  **Verify Locally**:
    ```bash
    # Ensure connections are valid before pushing
    cd backend
    npx tsx scripts/verify_cloud.ts
    ```
2.  **Push to GitHub**:
    Render and Vercel trigger automatically on push to `main`.

3.  **Troubleshooting**:
    - **"Table not found"**: Check if `SqliteDatabase.initializeSchema()` ran in the logs.
    - **"404 Model"**: Check `GeminiGenkitService` model string and API Key scope.
    - **CORS Errors**:
      - Verify `ALLOWED_ORIGINS` in Render includes your Vercel URL and custom subdomain.
    - **Google Sign-In Issues**: 
      - Ensure `VITE_GOOGLE_CLIENT_ID` and `VITE_ENABLE_GOOGLE_AUTH` are set in Vercel.
      - Verify Authorized Redirect URIs in Google Cloud Console match the Vercel domains.



### 9.1 Custom Domain Aliasing (Vercel)
If the custom subdomain (e.g., `tendercheckai.elecodes.online`) is not automatically linked to the production deployment:
1.  Verify DNS is pointing to Vercel (CNAME `cname.vercel-dns.com`).
2.  Run manually: `vercel alias set <deployment-url> tendercheckai.elecodes.online`.

## 🛡️ Security Maintenance

### Transitive Vulnerabilities
When Snyk detects vulnerabilities in deep dependencies (e.g., inside Genkit):
1.  Check if a patch exists for the sub-dependency.
2.  Use `overrides` in `package.json` to force the secure version.
3.  **Example**: `protobufjs` was forced to `^7.5.5` to fix `GHSA-xq3m-2v4x-88gg` (See [ADR 037](/docs/adr/037-remediate-protobufjs-vulnerability.md)).

## 🔧 Troubleshooting

### Database Connection Errors (500/503)
**Symtom:** `LibsqlError: SQLITE_UNKNOWN: SQLite error: connection not opened`
**Cause:** In serverless environments (Render) or during "Scale to Zero", the WebSocket connection (`libsql://`) may drop or fail to establish quickly.
**Solution:**
1.  **Enforce HTTPS**: The `TursoDatabase` singleton automatically replaces `libsql://` with `https://` to use the stateless HTTP protocol.
2.  **Rebuild Client**: Ensure `render.yaml` includes `npm rebuild @libsql/client` to compile the native binary for the correct architecture (Linux).

### "Invalid ELF Header" (Render)
**Cause:** The `@libsql/client` package includes a native binary. If installed on macOS and deployed to Linux without rebuilding, it will fail.
**Solution:** Update the build command: `npm install && npm rebuild @libsql/client && npm run build`.
