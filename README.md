# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> [**🚀 Ver Demo en Vivo (Render)**](https://tendercheck-frontend.onrender.com)

![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Tech](https://img.shields.io/badge/Stack-TypeScript_React_Turso_Gemini-orange)
![Coverage](https://img.shields.io/badge/Coverage-100%25_Domain_/_84%25_Global-brightgreen)
![Data](https://img.shields.io/badge/Storage-Turso_(LibSQL)-blue)
![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash-red)
![Observability](https://img.shields.io/badge/Observability-LangSmith-blueviolet)

## 🚀 Key Features
- **Secure Authentication**: Hybrid Strategy (HttpOnly Cookies + Bearer Token Fallback) ensures reliability on all platforms. Google OAuth integration (Production-ready).
- **PDF Analysis**: Extracts text from tender documents to identify key requirements using- **AI**: Gemini 2.5 Flash (Google AI Studio).
- **Observability**: **LangSmith** (via `traceable` SDK).
- **Requirement Extraction**: Identifies technical clauses, distinguishing **OBLIGATORIO** vs **OPCIONAL**.
- **Real Proposal Validation**: Real-time comparison of vendor proposals with AI reasoning.
- **Improved AI Summary**: Detailed analysis summaries up to 500 characters (truncated from 100 in previous versions).
- **Intelligent Analysis (Dual Persona)**: 
  - **Legal Auditor (Extraction)**: Identifies strict requirements ("deberá", "obligatorio").
  - **Senior Evaluator (Validation)**: Understands technical synonyms and partial compliance nuances.
- **Cloud Semantic Search**: Native Vector Search with Google Genkit (`gemini-embedding-001` - 3072D).
- **Cloud-Native Architecture**: Backend on Render + Turso Database (Edge SQLite).
- **Modern React Interface**: 
  - **Dual Theme Support**: Comprehensive **Light** (Beige/Gold) and **Dark** (Charcoal/Emerald) modes with a global toggle.
  - **Premium Aesthetic**: **Glassmorphism** design with backdrop blurs, soft shadows, and mesh gradients.
  - **Typography**: Professional pairing of *Playfair Display* (Headings) and *Inter* (Body).
  - **Responsive Design**: Mobile-optimized Navigation and High-Contrast Accessibility.
- **Persistent History**: Stores all analyses in **Turso (Distributed SQLite)** for reliability.
- **Enterprise Auth**: **HttpOnly Cookies** (XSS Protection), "Remember Me" functionality, "Welcome Back" interstitial, and Google Sign-In.
- **History Management**: Browse, search, and delete previous analyses.
- **Professional Export**: Generate branded **PDF Reports**.
- **Dynamic Industry Validation**: Intelligent scope filtering that adapts to different sectors (Digital Services, Construction, etc.) using database-driven keyword presets.
- **Secure by Design**: Zod validation, Helmet protection, strict CORS (`ALLOWED_ORIGINS`), and specialized **401 Error Handling** for session recovery.
- **AI Observability**: Integrated with **LangSmith** for real-time tracing, prompt versioning, and performance monitoring.

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to validate public tender documents. Originally built for local inference, it has pivoted to a **Cloud-Native Architecture** (Render + Turso + Gemini) to ensure stability, persistence, and performance within free-tier limits.

## Demo
<p align="center">
<img src="screenshots/00-landing-page.png" width="600">
</p>

<p align="center">
<img src="screenshots/0B-register-page.png" width="400">
<img src="screenshots/01-login-page.png" width="400">
</p>

<p align="center">
<img src="screenshots/03-ready-to-analyze.png" width="300">
<img src="screenshots/04-analysis-results.png" width="300">
<img src="screenshots/05-validation-results.png" width="300">
</p>


▶ Watch demo video
https://github.com/user-attachments/assets/338457ab-3e39-43c9-b377-9a2bf3889e1d

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: Setup, Workflows, Commands.
- **[📋 Project Plan](docs/PROJECT_PLAN.md)**: Roadmap & Phases.
- **[🚀 Deployment Guide](docs/deployment_guide.md)**: Run on Render.

## 🏗 Architecture
This project implements **Clean Architecture** with a Modular Monolith approach:

### High-Level Overview
```text
├── backend/
│   ├── src/
│   │   ├── domain/         # Entities, Repositories, Interfaces (Pure Logic)
│   │   ├── application/    # Use Cases & Services (Orchestration)
│   │   ├── infrastructure/ # DB Adapters (Turso), AI (Genkit), Middleware
│   │   └── presentation/   # Express Controllers & Routes
├── frontend/
│   ├── src/
│   │   ├── components/     # UI, Auth, Dashboard, Layout
│   │   ├── services/       # API, Auth, Export Services
│   │   └── pages/          # Main Application Views
├── tests/
│   ├── e2e/                # Playwright End-to-End flows
│   └── fixtures/           # Mock PDFs for testing
└── docs/                   # ADRs, Standards, and TFM Documentation
```

<details>
<summary>📂 View Detailed File Structure</summary>

<!-- TREE_START -->
```text
├── AGENTS.md
├── Dockerfile
├── README.md
├── backend
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── scripts
│   │   ├── debug_gemini.ts
│   │   └── verify_cloud.ts
│   ├── src
│   │   ├── application
│   │   │   ├── services
│   │   │   │   └── AuthService.ts
│   │   │   └── use-cases
│   │   │       ├── CreateTender.spec.ts
│   │   │       ├── CreateTender.ts
│   │   │       └── ValidateProposal.ts
│   │   ├── config
│   │   │   ├── constants.ts
│   │   │   └── genkit.config.ts
│   │   ├── domain
│   │   │   ├── entities
│   │   │   │   ├── ComparisonResult.ts
│   │   │   │   ├── Requirement.ts
│   │   │   │   ├── TenderAnalysis.ts
│   │   │   │   ├── User.ts
│   │   │   │   └── ValidationResult.ts
│   │   │   ├── errors
│   │   │   │   └── AppError.ts
│   │   │   ├── interfaces
│   │   │   │   ├── IPdfParser.ts
│   │   │   │   ├── IRule.ts
│   │   │   │   └── ITenderAnalyzer.ts
│   │   │   ├── repositories
│   │   │   │   ├── ITenderRepository.ts
│   │   │   │   └── UserRepository.ts
│   │   │   ├── schemas
│   │   │   │   └── TenderAnalysisSchema.ts
│   │   │   ├── services
│   │   │   │   └── RequirementsExtractor.ts
│   │   │   └── validation
│   │   │       ├── ValidationEngine.ts
│   │   │       ├── ValidationRuleFactory.ts
│   │   │       └── rules
│   │   │           └── ScopeValidationRule.ts
│   │   ├── infrastructure
│   │   │   ├── adapters
│   │   │   │   └── PdfParserAdapter.ts
│   │   │   ├── config
│   │   │   │   └── genkit-telemetry.ts
│   │   │   ├── database
│   │   │   │   ├── SqliteDatabase.ts
│   │   │   │   ├── TursoDatabase.ts
│   │   │   │   └── schema.sql
│   │   │   ├── middleware
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── repositories
│   │   │   │   ├── InMemoryTenderRepository.ts
│   │   │   │   ├── InMemoryUserRepository.ts
│   │   │   │   ├── TursoTenderRepository.ts
│   │   │   │   └── TursoUserRepository.ts
│   │   │   ├── schemas
│   │   │   │   └── LLMSchemas.ts
│   │   │   ├── services
│   │   │   │   ├── GeminiGenkitService.ts
│   │   │   │   └── VectorSearchService.ts
│   │   │   └── utils
│   │   │       └── safeExecute.ts
│   │   └── presentation
│   │       ├── controllers
│   │       │   ├── AuthController.ts
│   │       │   └── TenderController.ts
│   │       ├── routes
│   │       │   ├── AuthRoutes.ts
│   │       │   └── TenderRoutes.ts
│   │       └── server.ts
│   ├── test
│   │   ├── AppError.test.ts
│   │   ├── PdfParserAdapter.test.ts
│   │   ├── RequirementsExtractor.test.ts
│   │   ├── ValidationEngine.test.ts
│   │   ├── api_integration.test.ts
│   │   ├── application
│   │   │   ├── services
│   │   │   │   └── AuthService.test.ts
│   │   │   └── use-cases
│   │   │       └── ValidateProposal.test.ts
│   │   ├── domain
│   │   │   ├── AppError.test.ts
│   │   │   ├── RequirementsExtractor.test.ts
│   │   │   ├── TenderAnalysisSchema.test.ts
│   │   │   ├── ValidationEngine.test.ts
│   │   │   ├── errors
│   │   │   │   └── AppError.test.ts
│   │   │   └── validation
│   │   │       ├── ValidationEngine.test.ts
│   │   │       ├── ValidationRuleFactory.test.ts
│   │   │       └── rules
│   │   │           └── ScopeValidationRule.test.ts
│   │   ├── infrastructure
│   │   │   ├── database
│   │   │   │   └── TursoDatabase.test.ts
│   │   │   ├── repositories
│   │   │   │   ├── TursoTenderRepository.test.ts
│   │   │   │   └── TursoUserRepository.test.ts
│   │   │   └── services
│   │   │       ├── GeminiGenkitService.test.ts
│   │   │       └── VectorSearchService.test.ts
│   │   ├── presentation
│   │   │   ├── controllers
│   │   │   │   ├── AuthController.test.ts
│   │   │   │   └── TenderController.test.ts
│   │   │   └── routes
│   │   │       └── TenderRoutes.test.ts
│   │   └── security.test.ts
│   ├── test-db-connection.js
│   ├── test-results.json
│   ├── tsconfig.json
│   └── vitest.config.ts
├── ci_cd_plan.md
├── docker-compose.yml
├── docs
│   ├── ARCHITECTURE_SIMPLE_GUIDE.md
│   ├── CLEAN_ARCHITECTURE_MAP.md
│   ├── PLAYBOOK.md
│   ├── PROJECT_PLAN.md
│   ├── SRS.md
│   ├── TFM_PLAN.md
│   ├── VALIDATION_REPORT.md
│   ├── adr
│   │   ├── 000-template.md
│   │   ├── 001-validation-strategy.md
│   │   ├── 002-frontend-stack.md
│   │   ├── 003-ai-integration.md
│   │   ├── 003-observability.md
│   │   ├── 004-google-auth-limitation.md
│   │   ├── 004-proposal-validation.md
│   │   ├── 004-rules-engine.md
│   │   ├── 005-local-auth-and-ollama.md
│   │   ├── 006-ui-theme-routing.md
│   │   ├── 007-security-hardening.md
│   │   ├── 008-local-sql-persistence.md
│   │   ├── 009-vector-search-performance.md
│   │   ├── 010-frontend-localization-security.md
│   │   ├── 011-cloud-authentication.md
│   │   ├── 011-cloud-deployment.md
│   │   ├── 012-cloud-pivot-render-turso.md
│   │   ├── 013-ai-logic-refinements.md
│   │   ├── 014-auth-strategy-pivot.md
│   │   ├── 015-frontend-ui-and-security.md
│   │   ├── 016-caching-strategy.md
│   │   ├── 017-quality-metrics-standard.md
│   │   ├── 018-mobile-first-ui.md
│   │   ├── 019-resilience-testing-strategy.md
│   │   ├── 020-auth-ux-enhancements.md
│   │   ├── 021-manual-native-redirect.md
│   │   ├── 022-dynamic-industry-validation.md
│   │   ├── 023-langsmith-tracing-integration.md
│   │   ├── 024-embedding-model-migration.md
│   │   ├── 025-enforce-https-turso.md
│   │   ├── 026-high-coverage-standard.md
│   │   ├── 027-auth-header-fallback.md
│   │   ├── 028-ui-design-system.md
│   │   ├── 029-auth-error-handling.md
│   │   ├── 030-global-theme-strategy.md
│   │   └── README.md
│   ├── architecture
│   │   ├── mcp_feasibility_study.md
│   │   └── system_architecture.md
│   ├── deployment_guide.md
│   ├── standards
│   │   ├── architecture_systems.md
│   │   ├── code_quality_policy.md
│   │   ├── coding_best_practices.md
│   │   ├── devops_policy.md
│   │   ├── devsecops_free_tools.md
│   │   ├── health_and_errors_policy.md
│   │   ├── lifecycle_paradigms.md
│   │   ├── metrics_policy.md
│   │   ├── microcopy_policy.md
│   │   ├── quality_metrics.md
│   │   ├── requirements_UML.md
│   │   ├── secure_coding_practices.md
│   │   ├── security_policy.md
│   │   ├── sentry_policy.md
│   │   ├── solid_principles.md
│   │   ├── testing_policy.md
│   │   ├── usable_forms_best_practices.md
│   │   └── ux_accessibility_policy.md
│   └── tfm
│       ├── 00_analisis_detallado.md
│       ├── 01_introduccion_objetivos.md
│       ├── 02_marco_teorico.md
│       ├── 03_arquitectura.md
│       └── 04_implementacion.md
├── frontend
│   ├── README.md
│   ├── eslint.config.js
│   ├── frontend
│   │   ├── package-lock.json
│   │   └── package.json
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public
│   │   ├── _headers
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── auth
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── GoogleLoginButton.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── AnalysisResults.test.tsx
│   │   │   │   ├── AnalysisResults.tsx
│   │   │   │   ├── ComparisonResults.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── HistorySidebar.tsx
│   │   │   │   ├── TenderUpload.test.tsx
│   │   │   │   ├── TenderUpload.tsx
│   │   │   │   └── ValidationSummary.tsx
│   │   │   ├── layout
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── ui
│   │   │       ├── SentryErrorBoundary.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── context
│   │   │   └── AuthContext.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   └── LandingPage.tsx
│   │   ├── services
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── export.service.ts
│   │   ├── test
│   │   │   └── setup.ts
│   │   └── types.ts
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── lint_output.txt
├── package-lock.json
├── package.json
├── playwright-report
│   ├── data
│   │   ├── afcbe273a993c9918b62e9249edc000b39eb70cf.webm
│   │   └── fd5f9ca5399fd49a176cfc80a29fb5b33a67d4e8.png
│   └── index.html
├── playwright.config.ts
├── render.yaml
├── screenshots
│   ├── 00-landing-page.png
│   ├── 01-login-page.png
│   ├── 03-ready-to-analyze.png
│   ├── 04-analysis-results.png
│   ├── 05-validation-results.png
│   ├── 0B-register-page.png
│   └── demo-video-full.webm
├── scripts
│   └── docs-automator.js
├── start.sh
├── test-results
│   └── screenshots-📸-Generate-Marketing-Screenshots-Video-chromium
│       ├── test-finished-1.png
│       └── video.webm
└── tests
    ├── e2e
    │   ├── screenshots.spec.ts
    │   └── tender-flow.spec.ts
    └── fixtures
        └── dummy.pdf
```
<!-- TREE_END -->

For more details, see the [📘 Simple Architecture Guide](docs/ARCHITECTURE_SIMPLE_GUIDE.md).

</details>

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS 22+)
- **Turso DB** (Connection URL + Token)
- **Google AI Studio Key** (Gemini)

### Installation
```bash
# 1. Clone
git clone <repo-url>

# 2. Install Backend
cd backend
npm install
# Create .env (see deployment_guide.md)

# 3. Install Frontend
cd ../frontend
npm install
```

### Running the Project
# Run Development Mode
# Backend (Port 3001)
cd backend && npm run dev

# Frontend (Port 3000)
cd frontend && npm run dev

## ⚠️ Known Limitations (Deployment)
- **Startup Delay**: This project is hosted on **Render's Free Tier**. If the application hasn't been used recently, it may take **30-50 seconds** to "wake up" on the first load. We appreciate your patience!
- **Google Authentication**: The "Sign in with Google" feature is fully functional in both local and production (Render) environments. It uses a custom **Manual Native Redirect** flow to bypass Cross-Origin limitations on shared domains.
- **AI Service Costs**: While this project is designed for the **Google AI Studio Free Tier**, project owners may incur costs if they link a Google Cloud Billing account to their project (switching it to the **Pay-as-you-go** tier). In the Free Tier, Google may use your data to improve their models. Please check your [AI Studio Plan Settings](https://aistudio.google.com/app/plan_information) for details.

### Troubleshooting
- **503 / Database Connection Errors**: If you encounter intermittent database errors, ensure your `TURSO_DB_URL` is correct. The system now automatically enforces `https://` for stability on serverless platforms.
- **Render Build**: Ensure your build command includes `--include=dev` (to access TypeScript/Husky) and `npm rebuild @libsql/client` (for Linux). Example: `cd backend && npm install --include=dev && npm rebuild @libsql/client && npm run build`


### Testing
We enforce strict quality gates.
```bash
# Run Unit Tests via Vitest
npm test

# Run End-to-End Tests
npx playwright test

# View Test Report
npx playwright show-report

# Check Coverage (Critical Baseline > 80%)
# We have achieved **100% Domain / 84% Global Coverage**, ensuring high reliability across
# Domain logic, AI Services, and API Routes.

npm run test:coverage

# Run Security Scan (Snyk)
# Checks for vulnerabilities in dependencies.
npm run security:scan

```

## 📜 License
MIT
