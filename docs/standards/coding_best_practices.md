# 🛠 Best Practices & Quality Standards - TenderCheck AI

## 1. Architecture & Design
- [cite_start]**Hexagonal Architecture**: Keep the Domain Layer isolated from Infrastructure (AI, PDF Parsers, DB)[cite: 77, 1096].
- [cite_start]**SOLID Principles**: Each class/function must have a single responsibility[cite: 1253, 1256].
- **ADR Management**: Every major architectural decision must be documented in `docs/adr/` before implementation.

## 2. Coding Standards
- [cite_start]**Strong Typing**: Use TypeScript interfaces/enums for all domain concepts[cite: 72, 214].
- [cite_start]**Validation**: Use Zod for all external data (API inputs, PDF metadata)[cite: 667, 126].
- [cite_start]**Error Handling**: Use custom Error classes and avoid generic try/catch without logging[cite: 128, 494].

## 3. Quality & Security
- [cite_start]**TDD/Testing**: Minimum 80% code coverage using Vitest[cite: 200, 657].
- [cite_start]**Security**: Implement Helmet.js and follow OWASP Top 10 for LLM applications[cite: 215, 668].
- [cite_start]**Docs as Code**: Documentation (README, ADRs, Mermaid diagrams) must live in the repo[cite: 671, 708].

## 4. AI Interaction (Human-in-the-loop)
- [cite_start]**Traceability**: All AI-generated responses must include source excerpts and explanations[cite: 70, 1400].
- [cite_start]**Responsible AI**: The system acts as an assistant; the human user always makes the final call[cite: 1223, 1533].