# Software Engineering Principles: Development Lifecycle & Programming Paradigms

Use these guidelines as a reference for project structure, code generation, and methodology justification.

## 1. Software Development Life Cycle (SDLC) - Key Pillars
* **Incremental & Agile Approach:** Prioritize delivering a functional MVP first and adding features in iterative cycles.
* **Fundamental Phases:** * **Analysis:** Clear definition of requirements (e.g., "AI-driven tender validation").
    * **Design:** Architecture and UI/UX layout.
    * **Testing:** Continuous verification of functionalities.
    * **Deployment:** Reliable delivery to production.
* **Metrics for Success:** Monitor Lead Time, deployment frequency, and automated test coverage.
* **Anti-patterns to Avoid:** "Waterfall in disguise" (no feedback), zero documentation, and lack of integration between modules.

## 2. Multi-Paradigm Programming Strategy
* **Object-Oriented Programming (OOP):** Use for system structure and core entities (e.g., `Tender`, `User`, `ValidationRule`). Leverage Encapsulation and Polymorphism.
* **Functional Programming:** Use inside methods for data transformation (using `.map`, `.filter`, `.reduce`) to ensure clean code without side effects.
* **Imperative Programming:** Use only for specific, low-level algorithms where granular flow control is critical.
* **Event-Driven/Reactive:** Use for UI interactions and communication between backend services.

## 3. Implementation Logic
* **Complex Domain?** → Use **OOP**.
* **Data Transformation/Business Rules?** → Use **Functional**.
* **Critical Performance Algorithm?** → Use **Imperative**.