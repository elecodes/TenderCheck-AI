# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> *Master's Thesis Project (TFM) - Week 1 Status*

![Status](https://img.shields.io/badge/Status-Phase_3_Complete-blue)
![Tech](https://img.shields.io/badge/Stack-TypeScript_React_Sentry-green)
![Coverage](https://img.shields.io/badge/Coverage-100%25_Backend-brightgreen)
![UI](https://img.shields.io/badge/UI-Tailwind_Dark_Mode-purple)

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to valid public tender documents ("Pliegos") against technical proposals. It leverages **LLMs** for semantic reasoning and deterministic rules for mandatory compliance checks.

**Objective:** Reduce the time and error rate in the formal review of digital service tenders.

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: How to work on this project (Setup, Workflows, Commands).
- **[📋 Project Plan](PROJECT_PLAN.md)**: Roadmap, Phases, and Architecture.
- **[📑 SRS](SRS.md)**: Software Requirements Specification.
- **[🛠 Standards](docs/standards/coding_best_practices.md)**: Coding quality and best practices.
- **[🧪 Testing Policy](docs/standards/testing_policy.md)**: TDD quality gates and strategy.

## 🏗 Architecture
This project follows **Clean Architecture** principles to ensure separation of concerns:

```
TenderCheckAI/
├── backend/          # 🧠 Node.js + Express (Clean Architecture)
│   ├── src/domain    #    - Entities, Rules Engine, Errors (Pure TS)
│   └── src/infra     #    - Sentry, OpenAI, PDF Parsers
├── frontend/         # ⚛️ React + Vite (TailwindCSS)
│   ├── src/components #   - Accessible UI (ARIA-first)
│   └── src/hooks     #    - Sentry Error Boundaries
└── docs/             # 📚 ADRs, Standards, Playbook
```

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS 20+)
- npm

### Installation
```bash
# Clone the repository
git clone <repo-url>

# Install Backend Dependencies
cd backend
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
