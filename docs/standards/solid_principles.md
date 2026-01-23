# 🧱 SOLID Principles - TenderCheck AI Engineering Standards

## 1. Single Responsibility Principle (SRP)
* [cite_start]**Definition**: A class or module should have one, and only one, reason to change[cite: 526].
* **Project Application**: 
    * The `PdfParserService` only extracts text; it does not validate requirements.
    * The `ValidationResult` entity only holds data; it doesn't contain the logic to generate a PDF report.

## 2. Open/Closed Principle (OCP)
* **Definition**: Software entities should be open for extension, but closed for modification.
* **Project Application**: 
    * The `ValidationEngine` should be able to accept new `ValidationRules` without changing its core execution loop.
    * If we add a new AI provider (e.g., Anthropic), we extend the infrastructure without modifying the application use cases.

## 3. Liskov Substitution Principle (LSP)
* **Definition**: Objects of a superclass should be replaceable with objects of its subclasses without breaking the system.
* **Project Application**: 
    * Any implementation of the `DocumentProcessor` interface (Local PDF, Cloud OCR) must return the same normalized text format so the system remains stable.

## 4. Interface Segregation Principle (ISP)
* **Definition**: No client should be forced to depend on methods it does not use.
* **Project Application**: 
    * Instead of one giant `AIService`, we use specific interfaces like `RequirementExtractor` and `ComplianceValidator`. [cite_start]This keeps the "Reasoning Layer" lean and focused[cite: 1036].

## 5. Dependency Inversion Principle (DIP)
* **Definition**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
* **Project Application**: 
    * The `AnalyzeTenderUseCase` (High-level) depends on the `IDocumentRepository` interface, not on a specific database or file system (Low-level). [cite_start]This is the core of our **Hexagonal Architecture**[cite: 535, 1010].