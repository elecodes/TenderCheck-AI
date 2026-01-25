# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> *Master's Thesis Project (TFM) - Week 1 Status*

![Status](https://img.shields.io/badge/Status-Phase_14_History_&_Persistence-blue)
![Tech](https://img.shields.io/badge/Stack-TypeScript_React_Ollama-orange)
![Coverage](https://img.shields.io/badge/Coverage-100%25_Backend-brightgreen)
![AI](https://img.shields.io/badge/AI-Ollama_(Llama3)-purple)
![CI/CD](https://img.shields.io/badge/CI%2FCD-Ollama_Local-blue)

## 🚀 Key Features
- **Smart Ingestion**: Parses complex PDF structure from Tender Documents (*Pliegos*).
- **Local AI Analysis**: Extracts requirements using **Ollama (Llama 3)** running locally (Privacy first, Zero cost).
- **Auto-Auth Flow**: Seamless Registration -> Token Issue -> Dashboard redirection.
- **Requirement Extraction**: Identifies technical clauses, distinguishing **Mandatory** vs **Optional**.
- **Proposal Validation**: Compares vendor proposals (*Ofertas*) against extracted requirements.
- **Resilient Fallbacks**: Graceful handling of AI overloads or "Scope Mismatches".
- **Secure by Design**: Zod validation, Helmet protection, and strict CORS.

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to valid public tender documents ("Pliegos") against technical proposals. It leverages **Local LLMs (Ollama)** for privacy-preserving semantic reasoning and deterministic rules for mandatory compliance checks.

**Objective:** Reduce the time and error rate in the formal review of digital service tenders.

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: How to work on this project (Setup, Workflows, Commands).
- **[📋 Project Plan](PROJECT_PLAN.md)**: Roadmap, Phases, and Architecture.
- **[📑 SRS](SRS.md)**: Software Requirements Specification.
- **[🛠 Standards](docs/standards/coding_best_practices.md)**: Coding quality and best practices.
- **[🧪 Testing Policy](docs/standards/testing_policy.md)**: TDD quality gates and strategy.

## 🏗 Architecture
This project follows **Clean Architecture** principles to ensure separation of concerns:

<!-- TREE_START -->
```text
├── PROJECT_PLAN.md
├── README.md
├── SRS.md
├── backend
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── application
│   │   │   └── use-cases
│   │   │       ├── CreateTender.spec.ts
│   │   │       ├── CreateTender.ts
│   │   │       └── ValidateProposal.ts
│   │   ├── domain
│   │   │   ├── entities
│   │   │   │   ├── ComparisonResult.ts
│   │   │   │   ├── Requirement.ts
│   │   │   │   ├── TenderAnalysis.ts
│   │   │   │   └── ValidationResult.ts
│   │   │   ├── errors
│   │   │   │   └── AppError.ts
│   │   │   ├── interfaces
│   │   │   │   ├── IPdfParser.ts
│   │   │   │   ├── IRule.ts
│   │   │   │   └── ITenderAnalyzer.ts
│   │   │   ├── repositories
│   │   │   │   └── ITenderRepository.ts
│   │   │   ├── schemas
│   │   │   │   └── TenderAnalysisSchema.ts
│   │   │   ├── services
│   │   │   │   ├── AIModelService.ts
│   │   │   │   └── RequirementsExtractor.ts
│   │   │   └── validation
│   │   │       ├── ValidationEngine.ts
│   │   │       └── rules
│   │   │           └── ScopeValidationRule.ts
│   │   ├── infrastructure
│   │   │   ├── adapters
│   │   │   │   └── PdfParserAdapter.ts
│   │   │   ├── middleware
│   │   │   │   └── errorHandler.ts
│   │   │   ├── repositories
│   │   │   │   └── InMemoryTenderRepository.ts
│   │   │   ├── schemas
│   │   │   │   └── LLMSchemas.ts
│   │   │   ├── services
│   │   │   │   └── OpenAIModelService.ts
│   │   │   └── utils
│   │   │       └── safeExecute.ts
│   │   └── presentation
│   │       ├── controllers
│   │       │   └── TenderController.ts
│   │       ├── routes
│   │       │   └── TenderRoutes.ts
│   │       └── server.ts
│   ├── test
│   │   ├── AIModelService.test.ts
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
│   │   └── 004-rules-engine.md
│   ├── architecture
│   │   └── mcp_feasibility_study.md
│   └── standards
│       ├── code_quality_policy.md
│       ├── coding_best_practices.md
│       ├── devops_policy.md
│       ├── devsecops_free_tools.md
│       ├── health_and_errors_policy.md
│       ├── metrics_policy.md
│       ├── microcopy_policy.md
│       ├── secure_coding_practices.md
│       ├── security_policy.md
│       ├── sentry_policy.md
│       ├── solid_principles.md
│       ├── testing_policy.md
│       └── ux_accessibility_policy.md
├── frontend
│   ├── README.md
│   ├── eslint.config.js
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
│   │   │   ├── dashboard
│   │   │   │   ├── AnalysisResults.tsx
│   │   │   │   ├── ComparisonResults.tsx
│   │   │   │   └── TenderUpload.tsx
│   │   │   └── ui
│   │   │       ├── SentryErrorBoundary.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   └── types.ts
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package-lock.json
├── package.json
└── scripts
    └── docs-automator.js
```
<!-- TREE_END -->

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS 20+)
- npm
- **[Ollama](https://ollama.com/)** (Required for AI Analysis)

### Installation
```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Install Backend Dependencies
cd backend
npm install

# 3. Setup Ollama (Local AI)
# Install from ollama.com, then pull the model:
ollama pull llama3
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
