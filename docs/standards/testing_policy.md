# 🧪 Testing Policy & Quality Assurance - TenderCheck AI

## 1. Core Objectives
[cite_start]The primary goal of the testing strategy is to ensure system reliability, auditability, and compliance with the Master's Thesis quality standards[cite: 16, 53].

## 2. Quality Gates (MANDATORY)
* [cite_start]**Minimum Global Coverage**: A minimum of **80% code coverage** is required for the overall project[cite: 198, 200, 657].
* [cite_start]**Core Logic Coverage**: Critical functions within the `Domain` layer must aim for **100% coverage**[cite: 199].
* [cite_start]**Pre-push Enforcement**: Using **Husky**, git pushes will be blocked if tests fail or if the coverage threshold is not met[cite: 202, 657].

## 3. Testing Levels
* [cite_start]**Unit Testing (Vitest)**: Focus on isolated logic in the `Domain` and `Application` layers (e.g., validation rules, state transitions)[cite: 196, 646].
* [cite_start]**Integration Testing**: Validate the communication between the `Application` layer and mocked `Infrastructure` services[cite: 646].
* [cite_start]**E2E Testing (Playwright)**: Test the full user journey, from PDF upload to report visualization, ensuring UI/UX consistency[cite: 205, 648].

## 4. AI & Infrastructure Mocking
* [cite_start]**LLM Mocking**: API calls to OpenAI/Anthropic must be mocked to ensure deterministic tests and avoid unnecessary costs[cite: 205].
* [cite_start]**PDF Parser Mocking**: Use mock file streams to test how the system handles various text extraction results (valid, empty, or corrupted)[cite: 205].

## 5. Methodology: AI-Assisted TDD
1. **Test-First**: Define test cases based on the `SRS.md` before writing the implementation.
2. **AI-Generated Cases**: Use the IDE's AI to suggest edge cases (e.g., missing mandatory documents, ambiguous legal phrasing).
3. [cite_start]**Refactor for Testability**: Use **Dependency Injection** to ensure the `Domain` logic remains testable without real external dependencies[cite: 1219].

## 6. Audit & Ethics Testing
* [cite_start]**Traceability Validation**: Tests must verify that every `ValidationResult` includes an `explanation` and a `decisionSource`[cite: 808, 1400].
* [cite_start]**Error Handling**: Explicitly test for "Ambiguous" states to ensure the system correctly flags cases for human review[cite: 829, 1184].