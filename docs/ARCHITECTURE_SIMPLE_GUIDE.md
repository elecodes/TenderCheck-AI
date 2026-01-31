# Simple Architecture Guide for TenderCheck AI

Hello! As a software student, understanding the structure is the best way to learn. Here is a simplified breakdown of how our **Clean Architecture** backend works.

## 1. The Core Idea
Imagine the application like an onion.
- **Inner Layers (Domain)**: Pure business logic. They don't know about databases or API routes.
- **Outer Layers (Infrastructure/Presentation)**: The "tools" we use (Express, SQLite, etc.).

## 2. Your Questions Answered

### Why are `value-objects` and `interfaces` folders empty?
It is correct for now!
- **`domain/value-objects`**: Currently detailed validation rules for simple things (like `Email`, `Price`) are either handled with primitive types (`string`, `number`) or inside the entities. As the project grows and we need strict rules (e.g., "Price cannot be negative"), we will create specific classes here.
- **`application/interfaces`**: We define most interfaces directly in `domain` (business contracts) or within the implementation files for simplicity. Empty folders are often placeholders for future growth.

### Is `presentation` independent?
**Yes!**
- The **Presentation Layer** (where Controllers and Routes live) is responsible for "talking to the outside world" (handling HTTP requests from the frontend).
- It is a separate "adapter" layer. It depends on `application` to do the actual work, but `application` doesn't know it exists. This separation is key to Clean Architecture.

### What is the role of `utils`?
Located in: `src/infrastructure/utils`
- **Role**: Helper tools that are technical, not business-related.
- **Example**: `safeExecute.ts` (helper to run code safely without crashing).
- **Rule**: If it's about "Tenders", it goes in Domain. If it's about "formatting a date string" or "try-catch blocks", it goes in Utils.

### What is the role of `repositories`?
They are the bridge between your code and the database.
- **In Domain (`domain/repositories`)**: We define the **Interface** (The Contract).
  - *Example:* "I need a `UserRepository` that has a `save()` method." (Doesn't care if it's SQL or JSON).
- **In Infrastructure (`infrastructure/repositories`)**: We define the **Implementation** (The Code).
  - *Example:* "Here is the `TursoTenderRepository` that uses SQL commands to save to the Turso database."

## 3. The Flow of Request
1.  **Presentation**: Receives HTTP request -> Calls Use Case.
2.  **Application (Use Case)**: Orchestrates the logic -> Calls Domain/Repository.
3.  **Domain**: Enforces business rules.
4.  **Infrastructure**: Saves data to Database.

This structure implies that you can change the Database (Infrastructure) or the API Framework (Presentation) without ever touching your Business Logic (Domain).
