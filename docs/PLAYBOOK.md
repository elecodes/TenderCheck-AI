# 📘 TenderCheck AI - Developer Playbook

Welcome to the team! This playbook defines **how we work** to ensure high quality and consistency.

## ⚡ Quick Start workflows

### 1. Development Loop
1.  **Start Services**: `npm run dev` (Runs Backend :3000 & Frontend :5173).
2.  **Upload Pliego**: Go to Dashboard -> Upload Tender PDF -> Wait for Analysis.
3.  **Validate Proposal**: Scroll down -> Upload Proposal PDF -> Click "Run Compliance Check".
4.  **Review Results**: Check the compliance badges (MET/NOT MET) and evidence.

### 2. Testing & Quality 🧪
**Quality is non-negotiable.** We use **Vitest** for testing and **Zod** for validation.

| Command | Purpose | Requirement |
|---------|---------|-------------|
| `npm test` | Run all unit tests | Must pass before push |
| `npm run test:coverage` | Generate coverage report | **100% Domain**, 80% Global |

> **🔴 Important:** Providing a test suite that fails the coverage threshold will cause the pipeline to fail.

### 3. Architecture Guidelines
- **Domain Layer**: PURE TypeScript. No external libraries (except absolute essentials like `uuid` or `zod` types).
- **Infrastructure Layer**: The ONLY place where you import `fs`, `openai`, `pdf-parse`, etc.
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
- **Premium Aesthetic**: Use `Inter` font, subtle shadows, and `rounded-xl` borders.
- **Dark Mode**: Support `dark:` variants for all components.
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

## 📝 Common Commands Cheat Sheet

<!-- SCRIPTS_START -->
| Scope | Command | Description |
|---|---|---|
| Backend | `npm run ...` | (Auto-generated) |
<!-- SCRIPTS_END -->
