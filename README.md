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
- **[🚀 Deployment Guide](deployment_guide.md)**: Run on Render.

## 🏗 Architecture
This project implements **Clean Architecture** with a Modular Monolith approach:

<!-- TREE_START -->
```text
├── AGENTS.md
├── Dockerfile
├── PROJECT_PLAN.md
├── README.md
├── TFM_PLAN.md
├── backend
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── application
│   │   │   ├── services
│   │   │   │   └── AuthService.ts
│   │   │   └── use-cases
│   │   │       ├── CreateTender.ts
│   │   │       └── ValidateProposal.ts
│   │   ├── config
│   │   │   └── constants.ts
│   │   ├── domain
│   │   │   ├── entities
│   │   │   │   ├── TenderAnalysis.ts
│   │   │   │   ├── User.ts
│   │   │   │   └── ValidationResult.ts
│   │   │   ├── repositories
│   │   │   │   ├── ITenderRepository.ts
│   │   │   │   └── UserRepository.ts
│   │   ├── infrastructure
│   │   │   ├── adapters
│   │   │   │   └── PdfParserAdapter.ts
│   │   │   ├── database
│   │   │   │   ├── TursoDatabase.ts
│   │   │   │   └── schema.sql
│   │   │   ├── repositories
│   │   │   ├── repositories
│   │   │   │   ├── TursoTenderRepository.ts
│   │   │   │   └── TursoUserRepository.ts
│   │   │   ├── services
│   │   │   │   ├── GeminiGenkitService.ts
│   │   │   │   └── VectorSearchService.ts
│   │   └── presentation
│   │       ├── routes
│   │       │   ├── AuthRoutes.ts
│   │       │   └── TenderRoutes.ts
│   │       └── server.ts
├── frontend
│   ├── src
│   │   ├── components       # React Components
│   │   └── services         # API Client
│   └── vite.config.ts
└── docs                     # TFM Documentation & ADRs
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
