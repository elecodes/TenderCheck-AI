# Requirements Analysis & UML Modeling Standards

Use these guidelines to define what to build (Requirements) and how to visualize the solution (UML) before and during development.

## 1. Requirements Analysis: The Foundation
A requirement is a condition the system must meet. [cite_start]It must be clear, useful, and testable[cite: 1802, 1803].

### A. Requirements Typology
* [cite_start]**Functional Requirements (FR):** Define *what* the system does (e.g., "The system must allow PDF uploads")[cite: 1810, 1811].
* [cite_start]**Non-Functional Requirements (NFR):** Define *how* the system behaves—quality, performance, security (e.g., "Passwords must be encrypted")[cite: 1812, 1813].
* [cite_start]**Constraints:** Mandatory technical or business limitations (e.g., "Must comply with GDPR/ISO27001")[cite: 1814, 1815].
* [cite_start]**Business & Data Requirements:** Needs driven by commercial strategy or integration (e.g., Stripe or external API connections)[cite: 1816].

### B. Agile Definition Tools
* [cite_start]**User Stories:** "As a [USER], I want [GOAL] so that [BENEFIT]"[cite: 1819, 1820].
* [cite_start]**Acceptance Criteria (Gherkin):** Use the **Given - When - Then** structure to define completion[cite: 1821, 1822].
    * [cite_start]*Example:* "GIVEN I am logged in, WHEN I click 'Analyze', THEN I see the compliance report"[cite: 1823].
* [cite_start]**Prioritization (MoSCoW):** Categorize into **Must** have, **Should** have, **Could** have, and **Won't** have[cite: 1828, 1829].

## 2. UML (Unified Modeling Language): Visualization
[cite_start]UML is the standard for mapping system logic to detect errors before coding[cite: 1832, 1833].

### Key Diagrams for Implementation
* **Use Case Diagrams:** Show interactions between Actors (Users) and the system. [cite_start]Includes pre-conditions and alternative flows (errors)[cite: 1837, 1838].
* [cite_start]**Sequence & Process Diagrams:** Show chronological order of interactions and business logic[cite: 1839].
* [cite_start]**Class & Component Diagrams:** Map technical architecture and data structures[cite: 1840].

### Recommended Tools
* **Text-based (Recommended):** **Mermaid** or PlantUML. [cite_start]These allow versioning diagrams alongside code in Git[cite: 1844, 1845].
* [cite_start]**Visual:** Draw.io or Lucidchart for rapid prototyping[cite: 1843].

## 3. Implementation Workflow
1.  [cite_start]**Early Validation:** Use prototypes or interviews to clarify the problem[cite: 1848].
2.  [cite_start]**Agile Cycles (Sprints):** Break development into increments rather than planning everything upfront (avoiding pure Waterfall)[cite: 1851, 1852].
3.  **Verification vs. Validation:** * *Verification:* Did we build the product correctly? (Unit Tests, Code Review) [cite_start][cite: 1854].
    * *Validation:* Did we build the right product? (User Demos, Business Metrics) [cite_start][cite: 1855].