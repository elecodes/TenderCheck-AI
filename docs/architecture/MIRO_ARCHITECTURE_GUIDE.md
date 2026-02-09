# 🎨 Miro Architecture Guide: TenderCheck AI

Use these technical specifications to recreate high-fidelity diagrams in Miro for your TFM documentation.

---

## 1. UML Class Diagram (Domain Core)
**Goal:** Show the core data structures and the logic for the dynamic validation rules.

### Blocks to Create:
1.  **`TenderAnalysis`** (Entity)
    *   **Fields:** `id: string`, `tenderTitle: string`, `status: AnalysisStatus`, `requirements: Requirement[]`, `results: ValidationResult[]`
2.  **`Requirement`** (Entity)
    *   **Fields:** `id: string`, `text: string`, `type: RequirementType (MANDATORY|OPTIONAL)`, `keywords: string[]`, `confidence: float`
3.  **`ValidationResult`** (Value Object)
    *   **Fields:** `requirementId: string`, `status: ValidationStatus (MET|NOT_MET|AMBIGUOUS)`, `reasoning: string`, `confidence: float`
4.  **`IRule`** (Interface)
    *   **Method:** `validate(analysis: TenderAnalysis): Promise<ValidationResult[]>`
5.  **`ScopeValidationRule`** (Class / Implements IRule)
    *   **Fields:** `positiveKeywords: string[]`, `negativeKeywords: string[]`
    *   **Method:** `validate(analysis)`
6.  **`ValidationRuleFactory`** (Factory)
    *   **Method:** `createRules(industryName: string): Promise<IRule[]>`

### Relationships:
*   **Composition:** `TenderAnalysis` → contains (Diamond arrow) → `Requirement` & `ValidationResult`.
*   **Interface Realization:** `ScopeValidationRule` → implements (Dashed arrow with triangle) → `IRule`.
*   **Dependency:** `ValidationRuleFactory` → creates (Dashed arrow) → `ScopeValidationRule`.

---

## 2. C4 Level 2 Component Diagram
**Goal:** Show how the layers interact with External Services (Turso & Genkit).

### Blocks/Areas:
1.  **Frontend (React/Vite)**: Contains "UI Components", "Context API (State)", and "REST Client".
2.  **Backend API**: Break into 4 horizontal blocks (Clean Architecture layers):
    *   **Presentation**: Controllers & Routes.
    *   **Application**: Use Cases (`CreateTender`, `SearchTender`).
    *   **Domain**: Entities & Repository Interfaces.
    *   **Infrastructure**: Database Adapter (`Turso`), AI Adapter (`Genkit/Gemini`), Vector Search.
3.  **External Services**:
    *   **Turso (LibSQL)**: Label as "Relational + Vector Storage".
    *   **Gemini 2.0 Flash**: Label as "AI Analysis Engine".

### Data Flow Arrows:
*   Frontend → `POST /analyze` → Presentation.
*   Application → `save()` → Infrastructure (Turso).
*   Infrastructure → `analyzeText()` → Gemini (via Genkit).
*   Infrastructure → `vectorSearch()` → Turso.

---

## 3. Clean Architecture "Onion" Diagram
**Goal:** Visualize the Dependency Rule.

### Layers (Concentric Circles/Boxes):
1.  **Domain (Center - Gold)**: Entities, Value Objects, Domain Errors, Interface Contracts.
2.  **Application (Middle - Red)**: Use Cases, Logic Orchestration.
3.  **Infrastructure & Presentation (Outer - Blue/Charcoal)**:
    *   **Adapters:** TursoDB, GenkitService, PDF Parser.
    *   **Entrypoints:** Express Routes, Controllers, React View logic.

**CRITICAL NOTE:** Draw arrows pointing **only inwards** to indicate that the core knows nothing about the DB or the UI.

---

## 4. "Create Tender" Sequence Diagram
**Goal:** Show the complete lifecycle of a request.

### Lifelines (Order):
`User` → `Frontend` → `TenderController` → `CreateTender (UseCase)` → `PdfParser` → `GeminiAnalyzer` → `RuleFactory` & `ValidationEngine` → `VectorSearch` → `TursoRepository`.

### Key Messages/Calls:
1.  `POST /analyze(file, industry)`
2.  `pdfParser.parse(buffer)`
3.  `gemini.analyze(text)` -> Returns structured items.
4.  `ruleFactory.createRules(industry)` -> Returns filtered keywords.
5.  `validationEngine.validate(analysis)` -> Generates MET/NOT_MET scores.
6.  `vectorSearch.generateEmbeddings(requirements)` -> For RAG support.
7.  `repository.save(fullData)`
8.  `200 OK (Success Response)`

---

## 🎨 Theme Styling Tips for Miro:
*   **Colors:** Emerald Green (#10B981) for Success/Validation, Charcoal (#1F2937) for Infrastructure, Gold (#F59E0B) for Domain Core.
*   **Font:** Use **Inter** or **RobotoMono** for code fields to keep it professional.
*   **Icons:** Use Miro icons for "Database" (cylinder), "AI" (brain/chip), and "PDF" (document).
