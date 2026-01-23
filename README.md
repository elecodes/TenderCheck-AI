# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> *Master's Thesis Project (TFM) - Week 1 Status*

![Status](https://img.shields.io/badge/Status-Week_1_Setup-blue)
![Tech](https://img.shields.io/badge/Stack-TypeScript_Node_React-green)
![Coverage](https://img.shields.io/badge/Coverage-Min_80%25-orange)

## 📌 Overview
**TenderCheck AI** is an intelligent assistant designed to valid public tender documents ("Pliegos") against technical proposals. It leverages **LLMs** for semantic reasoning and deterministic rules for mandatory compliance checks.

**Objective:** Reduce the time and error rate in the formal review of digital service tenders.

## 📚 Key Documentation
- **[📘 Developer Playbook](docs/PLAYBOOK.md)**: How to work on this project (Setup, Workflows, Commands).
- **[📋 Project Plan](PROJECT_PLAN.md)**: Roadmap, Phases, and Architecture.
- **[📑 SRS](SRS.md)**: Software Requirements Specification.
- **[🛠 Standards](docs/standards/coding_best_practices.md)**: Coding quality and best practices.

## 🏗 Architecture
This project follows **Clean Architecture** principles to ensure separation of concerns:

```
backend/src/
├── domain/           # 🧠 Enterprise Logic (Entities, Repository Interfaces)
├── application/      # 🎬 Use Cases & Orchestration
├── infrastructure/   # 🔌 External Adapters (PDF, OpenAI, DB)
└── presentation/     # 🗣 API Controllers / UI
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
```bash
# Run Development Mode (Backend)
npm run dev
```

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
