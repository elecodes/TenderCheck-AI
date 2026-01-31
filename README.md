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
- [x] **Phase 4**: Cloud Auth & Security (Google Sign-In v1.1 - Redirect Mode)
- [x] **Phase 6**: Cloud Deployment (Render + Turso + Gemini + COOP Fixes)
- [x] **Phase 8**: Resilience & Testing (E2E Tests, Global Coverage > 60%, Global Error Handling)

## 🚀 Key Features
- **Smart Ingestion**: Parses complex PDF structure from Tender Documents (*Pliegos*).
- **Cloud AI Analysis**: Extracts requirements using **Gemini 2.5 Flash** (Fast, Free Tier compatible).
- **Requirement Extraction**: Identifies technical clauses, distinguishing **OBLIGATORIO** vs **OPCIONAL**.
- **Real Proposal Validation**: Real-time comparison of vendor proposals with AI reasoning.
- **Improved AI Summary**: Detailed analysis summaries up to 500 characters (truncated from 100 in previous versions).
- **Análisis Inteligente (Dual Persona)**: 
  - **Auditor Legal (Extracción)**: Identifica requisitos estrictos ("deberá", "obligatorio").
  - **Evaluador Senior (Validación)**: Entiende sinónimos técnicos y matices de cumplimiento parcial.
- **Búsqueda Semántica Cloud**: Vector Search nativo con Google Genkit (`text-embedding-004`).
- **Arquitectura Cloud-Native**: Backend en Render + Base de Datos Turso (Edge SQLite).
- **Interfaz React Moderna**: 
  - **New Typography**: Professional serif fonts (*Playfair Display*) for high-value information.
  - **Dynamic Layouts**: Smart sizing for long titles and summaries.
  - **Responsive Design**: Mobile-optimized Navigation (Hamburger Menu) and High-Contrast Auth forms.
- **Persistent History**: Stores all analyses in **Turso (Distributed SQLite)** for reliability.
- **History Management**: Browse, search, and delete previous analyses.
- **Professional Export**: Generate branded **PDF Reports**.
- **Secure by Design**: Zod validation, Helmet protection, strict CORS (`ALLOWED_ORIGINS`), and COOP/COEP compliant auth flows.

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to validate public tender documents. Originally built for local inference, it has pivoted to a **Cloud-Native Architecture** (Render + Turso + Gemini) to ensure stability, persistence, and performance within free-tier limits.

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: Setup, Workflows, Commands.
- **[📋 Project Plan](docs/PROJECT_PLAN.md)**: Roadmap & Phases.
- **[🚀 Deployment Guide](docs/deployment_guide.md)**: Run on Render.

## 🏗 Architecture
This project implements **Clean Architecture** with a Modular Monolith approach:

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
│   │   ├── config
│   │   ├── domain
│   │   ├── infrastructure
│   │   │   ├── adapters
│   │   │   ├── config
│   │   │   ├── database
│   │   │   ├── middleware
│   │   │   ├── repositories
│   │   │   ├── schemas
│   │   │   ├── services
│   │   │   └── utils
│   │   ├── presentation
│   │   │   ├── controllers
│   │   │   ├── routes
│   │   │   └── server.ts
│   │   └── test
│   ├── tsconfig.json
│   └── vitest.config.ts
├── ci_cd_plan.md
├── docker-compose.yml
├── docs
│   ├── PLAYBOOK.md
│   ├── PROJECT_PLAN.md
│   ├── SRS.md
│   ├── TFM_PLAN.md
│   ├── adr
│   ├── architecture
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
├── frontend
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── layout
│   │   ├── pages
│   │   ├── services
│   │   └── types.ts
│   ├── tailwind.config.js
│   └── vite.config.ts
├── lint_output.txt
├── package-lock.json
├── package.json
├── render.yaml
├── scripts
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

# Run End-to-End Tests
npx playwright test

# Check Coverage (Baseline > 60%)
npm run test:coverage
```

## 📜 License
Educational / TFM Use Only.
