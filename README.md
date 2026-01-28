---
title: TenderCheck AI
emoji: 📄
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 3000
---

# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> *Master's Thesis Project (TFM) - Week 2 Status*

![Status](https://img.shields.io/badge/Status-Phase_6_Cloud_Migration-blue)
![Tech](https://img.shields.io/badge/Stack-TypeScript_React_Turso_Gemini-orange)
![Coverage](https://img.shields.io/badge/Coverage-100%25_Backend-brightgreen)
![Data](https://img.shields.io/badge/Storage-Turso_(LibSQL)-blue)
![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash-red)

## 📋 Project Status
- [x] **Week 1**: Architecture & Setup (Clean Architecture, TypeScript)
- [x] **Phase 3**: Vector Search (Local Embeddings)
- [x] **Phase 14**: Persistence (SQLite -> Turso Migration)
- [x] **Phase 4**: Cloud Auth & Security (Google Sign-In)
- [x] **Phase 6**: Cloud Deployment (Render + Turso + Gemini)

## 🚀 Key Features
- **Smart Ingestion**: Parses complex PDF structure from Tender Documents (*Pliegos*).
- **Cloud AI Analysis**: Extracts requirements using **Gemini 2.5 Flash** (Fast, Free Tier compatible).
- **Requirement Extraction**: Identifies technical clauses, distinguishing **OBLIGATORIO** vs **OPCIONAL**.
- **Real Proposal Validation**: Real-time comparison of vendor proposals with AI reasoning.
- **Análisis Inteligente (Dual Persona)**: 
  - **Auditor Legal (Extracción)**: Identifica requisitos estrictos ("deberá", "obligatorio").
  - **Evaluador Senior (Validación)**: Entiende sinónimos técnicos y matices de cumplimiento parcial.
- **Búsqueda Semántica Cloud**: Vector Search nativo con Google Genkit (`text-embedding-004`).
- **Arquitectura Cloud-Native**: Backend en Render + Base de Datos Turso (Edge SQLite).
- **Interfaz React Moderna**: Dashboard con estadísticas en tiempo real y feedback visual (colores semánticos).
- **Persistent History**: Stores all analyses in **Turso (Distributed SQLite)** for reliability.
- **History Management**: Browse, search, and delete previous analyses.
- **Professional Export**: Generate branded **PDF Reports**.
- **Secure by Design**: Zod validation, Helmet protection, and strict CORS.

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to validate public tender documents. Originally built for local inference, it has pivoted to a **Cloud-Native Architecture** (Render + Turso + Gemini) to ensure stability, persistence, and performance within free-tier limits.

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: Setup, Workflows, Commands.
- **[📋 Project Plan](PROJECT_PLAN.md)**: Roadmap & Phases.
- **[🚀 Deployment Guide](docs/deployment_guide.md)**: Run on Render.

## 🏗 Architecture
This project implements **Clean Architecture** with a Modular Monolith approach:

<!-- TREE_START -->
```text
├── AGENTS.md
├── Dockerfile
├── PROJECT_PLAN.md
├── README.md
├── SRS.md
├── TFM_PLAN.md
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
│   │   │       └── rules
│   │   │           └── ScopeValidationRule.ts
│   │   ├── infrastructure
│   │   │   ├── adapters
│   │   │   │   └── PdfParserAdapter.ts
│   │   │   ├── config
│   │   │   │   └── genkit-telemetry.ts
│   │   │   ├── database
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
│   │   ├── ScopeValidationRule.test.ts
│   │   ├── ValidationEngine.test.ts
│   │   ├── api_integration.test.ts
│   │   └── security.test.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
├── ci_cd_plan.md
├── docker-compose.yml
├── docs
│   ├── PLAYBOOK.md
│   ├── adr
│   │   ├── 000-template.md
│   │   ├── 001-validation-strategy.md
│   │   ├── 002-frontend-stack.md
│   │   ├── 003-ai-integration.md
│   │   ├── 003-observability.md
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
│   │   └── README.md
│   ├── architecture
│   │   ├── mcp_feasibility_study.md
│   │   └── system_architecture.md
│   ├── deployment_guide.md
│   ├── standards
│   │   ├── code_quality_policy.md
│   │   ├── coding_best_practices.md
│   │   ├── devops_policy.md
│   │   ├── devsecops_free_tools.md
│   │   ├── health_and_errors_policy.md
│   │   ├── lifecycle_paradigms.md
│   │   ├── metrics_policy.md
│   │   ├── microcopy_policy.md
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
│   │   │   │   ├── AnalysisResults.tsx
│   │   │   │   ├── ComparisonResults.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── HistorySidebar.tsx
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
│   │   └── types.ts
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── lint_output.txt
├── package-lock.json
├── package.json
├── render.yaml
├── scripts
│   └── docs-automator.js
└── start.sh
```
<!-- TREE_END -->

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
# Backend (Port 3000)
cd backend && npm run dev

# Frontend (Port 5173)
cd frontend && npm run dev

### Testing
We enforce strict quality gates.
```bash
# Run Unit Tests via Vitest
npm test

# Check Coverage (Must be > 80%)
npm run test:coverage
```

## 📜 License
Educational / TFM Use Only.
