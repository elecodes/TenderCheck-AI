# TenderCheck AI 🤖

> **Automated Formal Validation for Public Tenders**
>
> *Master's Thesis Project (TFM) - Week 1 Status*

![Status](https://img.shields.io/badge/Status-Phase_5_Proposal_Validation-blue)
![Tech](https://img.shields.io/badge/Stack-TypeScript_React_OpenAI-orange)
![Coverage](https://img.shields.io/badge/Coverage-100%25_Backend-brightgreen)
![AI](https://img.shields.io/badge/AI-GPT--4o_Reference-purple)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-blue)

## 🚀 Key Features
- **Smart Ingestion**: Parses complex PDF structure from Tender Documents (*Pliegos*).
- **Requirement Extraction**: Identifies mandatory technical clauses using GPT-4o.
- **Proposal Validation**: Compares vendor proposals (*Ofertas*) against extracted requirements.
- **Resilient AI**: Automatic fallback to simulated mock data if API limits are hit.
- **Secure by Design**: Zod validation, Helmet protection, and strict CORS.

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

<!-- TREE_START -->
```text
TenderCheckAI/
├── backend/
│   ├── src/
│   └── test/
├── frontend/
│   ├── src/
│   └── public/
└── docs/
```
<!-- TREE_END -->

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
