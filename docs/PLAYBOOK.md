# 📘 TenderCheck AI - Developer Playbook

Welcome to the team! This playbook defines **how we work** to ensure high quality and consistency.

## ⚡ Quick Start workflows

### 1. Development
We use **TypeScript** in Strict Mode.
```bash
# Start backend (Port 3000)
cd backend && npm run dev

# Start frontend (Port 5173)
cd frontend && npm run dev
```

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

## 📝 Common Commands Cheat Sheet

| Task | Command |
|------|---------|
| Clean Install | `rm -rf node_modules && npm ci` |
| Type Check | `npx tsc --noEmit` |
| Lint | `npm run lint` (Backend & Frontend) |
