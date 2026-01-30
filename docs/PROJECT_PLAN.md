# 📋 Development Plan: TenderCheck AI (Master's Thesis)

## 🎯 System Objective
[cite_start]To design and implement an AI-powered system capable of analyzing, validating, and explaining the formal compliance of a technical proposal against a public tender's "Pliego de Condiciones" (Terms of Reference)[cite: 763, 859].

## 🛠️ Tech Stack (Strategic Alignment)
- [cite_start]**Backend:** Node.js + TypeScript (Clean Architecture)[cite: 72, 77, 1010].
- [cite_start]**AI:** LangChain / Genkit + OpenAI for orchestration and reasoning[cite: 74, 1049].
- [cite_start]**Frontend:** React + Vite (Simple dashboard)[cite: 79, 1000].
- [cite_start]**Infrastructure:** Docker + PDF Parsing (pdf-parse / OCR optional)[cite: 76, 78, 1013].
- [cite_start]**Quality Assurance:** Vitest (80% minimum coverage) + Husky + GitHub Actions[cite: 196, 198, 202, 657].
- [cite_start]**Security:** Zod for validation + Helmet.js for secure headers[cite: 170, 171, 218].

## 📅 Execution Roadmap (4 Weeks / 5h Daily)

### Phase 1: Analysis & Domain Definition (Week 1)
* [cite_start]**Requirement Analysis:** Define core entities (`TenderAnalysis`, `Requirement`, `ValidationResult`)[cite: 1278, 1314, 1334].
* [cite_start]**Architecture Design:** Establish folder structure following Clean Architecture (Presentation, Application, Domain, Infrastructure)[cite: 537, 1097].
* [cite_start]**Initial Setup:** Repository initialization, Linter, and Node.js skeleton[cite: 489].

### Phase 2: Processing & Rules Engine (Week 2)
* [cite_start]**Document Processor:** Integrate parser to convert PDFs into normalized text[cite: 1013, 1156].
* [cite_start]**Validation Engine:** Implement deterministic logic (keyword search and mandatory document detection)[cite: 1023, 1198].
* [cite_start]**Unit Testing:** Set up Vitest and ensure core domain logic works as expected[cite: 646, 647].

### Phase 3: Intelligence Layer & UX (Week 3)
* [cite_start]**AI Reasoning Layer:** Create prompts to extract complex requirements and resolve ambiguities[cite: 1043, 1213].
* [cite_start]**Web UI:** Develop the file upload interface and result visualization dashboard[cite: 994, 995].
* [cite_start]**Report Generator:** Module to export the checklist and evidence in JSON/PDF format[cite: 1054, 1055, 1229].

### Phase 4: Quality, Documentation & Closing (Week 4)
* [cite_start]**E2E Testing:** Validate the full flow from document upload to the final report[cite: 646].
* [cite_start]**Technical Memory:** Write a detailed README.md and justify Responsible AI decisions[cite: 17, 950].
* [cite_start]**Deployment:** Publish to a live URL and prepare the presentation slides[cite: 28, 30, 44].

## 🛡️ Scope Limitations (Guardrails)
* [cite_start]Does not evaluate economic aspects or provide technical scoring[cite: 771, 772].
* [cite_start]Does not make legally binding automatic decisions; the human makes the final call[cite: 773, 939, 1223].
* [cite_start]Restricted to digital services/software tenders in PDF format[cite: 767, 774].