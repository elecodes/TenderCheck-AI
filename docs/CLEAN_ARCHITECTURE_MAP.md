# The TenderCheck AI Clean Architecture Map

Welcome to the engine room! 🏗️ This document maps out exactly how our application is structured, folder by folder, and how the data flows through it.

---

## 🏗️ The Big Picture: 4 Layers
Think of the app as a circle with layers. **The Golden Rule**: Dependencies only point **INWARD**. The inner layers (Business Logic) know *nothing* about the outer layers (Database, Web).

### 1. 🟢 Domain Layer (`src/domain`)
*The "Heart". Pure business logic. Zero dependencies on libraries.*
- **Role**: Defines **WHAT** the business is (Entities) and **WHAT** we can do (Interfaces).
- **Folders**:
    - **`/entities`**: The core objects.
        - *Example*: `Tender` (has `id`, `title`, `deadline`). It validates itself (e.g., "deadline cannot be in the past").
    - **`/repositories` (Interfaces)**: The Contracts.
        - *Example*: `ITenderRepository`. It says, "Whoever implements me MUST have a `save()` method." It does NOT know about SQL.
    - **`/errors`**: Custom business errors.
        - *Example*: `TenderNotFoundError`, `InvalidBudgetElementError`.
    - **`/value-objects`**: Small, immutable objects with validation.
        - *Example*: `Money` (combines amount + currency), `Email` (validates format). *Currently empty as we use simple types, but ready for growth.*

### 2. 🟡 Application Layer (`src/application`)
*The "Brain". Orchestrates the work.*
- **Role**: Handles specific user actions (Use Cases). It connects the core entities with the outside world tools.
- **Folders**:
    - **`/use-cases`**: The Verbs. One file per action.
        - *Example*: `CreateTenderUseCase`.
        - *Logic*:
            1.  Take input (title, budget).
            2.  Create a `Tender` entity.
            3.  Call `tenderRepository.save()`.
            4.  Return success.
    - **`/services`**: Logic that involves multiple entities or doesn't fit a single use case.
        - *Example*: `NotificationService` (send email when X happens).

### 3. 🔵 Infrastructure Layer (`src/infrastructure`)
*The "Tools". The implementations that do the dirty work.*
- **Role**: Implements the interfaces defined in Domain. Connects to Databases, APIs, File Systems.
- **Folders**:
    - **`/repositories` (Implementations)**: The actual code for the database.
        - *Example*: `TursoTenderRepository`. Implements `ITenderRepository`. It creates the SQL query `INSERT INTO tenders...` using the Turso client.
    - **`/config`**: Configuration and Environment variables (Environment variables, Secrets).
    - **`/utils`**: Technical helpers not related to business.
        - *Example*: `safeExecute` (try-catch wrapper).
    - **`/services`**: Implementation of technical services.
        - *Example*: `SendGridEmailService` (implements the `EmailService` interface).

### 4. 🔴 Presentation Layer (`src/presentation`)
*The "Face". Talks to the outer world (HTTP/Web).*
- **Role**: Accepts requests, parses data, calls the Application layer, and sends responses.
- **Folders**:
    - **`/controllers`**: The entry points.
        - *Example*: `TenderController`.
        - *Logic*:
            1.  Receive `POST /tenders` request.
            2.  Extract `req.body.title`.
            3.  Call `CreateTenderUseCase.execute()`.
            4.  Send `201 Created` response.
    - **`/routes`**: URL definitions.
        - *Example*: `tenderRoutes.ts` maps `POST /` to `TenderController.create`.
    - **`/middleware`**: Interceptors (Auth, Logging, Validation).
        - *Example*: `authMiddleware` checks for a valid token before the controller runs.

---

## 🔄 How They Connect (The Life of a Request)

Let's trace a User searching for a Tender:

1.  **Request**: User clicks "Search" -> Browser sends `GET /tenders?q=cleaning`.
2.  **Presentation (Route)**: `tenderRoutes` sees `GET /tenders` and forwards to `TenderController.search`.
3.  **Presentation (Controller)**: `TenderController` extracts `q=cleaning` and calls the Use Case.
    *   *Code*: `searchTenderUseCase.execute('cleaning')`
4.  **Application (Use Case)**: `SearchTenderUseCase` receives the command.
    *   It calls the repository contract: `tenderRepository.findByKeyword('cleaning')`.
    *   *Note*: The Use Case **does not know** we are using Turso/SQL. It just calls the interface.
5.  **Infrastructure (Repository)**: The injected `TursoTenderRepository` runs the SQL:
    *   `SELECT * FROM tenders WHERE description LIKE '%cleaning%'`
    *   It converts the SQL rows into `Tender` Entities and returns them.
6.  **Application**: Receives the Entities and returns them to the Controller.
7.  **Presentation**: Converts the Entities to JSON and sends `200 OK` to the browser.

## 🧩 Why do we do this? (The "Why")

*   **Swap Components**: Want to change from Turso to PostgreSQL? Just write a `PostgresTenderRepository` and swap it in `infrastructure`. The Domain and Application layers **never change**.
*   **Easy Testing**: Use Cases can be tested without a database! We just pass a "Mock Repository" that returns fake data.
*   **Clarity**: You know exactly where code belongs. Business rule? Domain. SQL query? Infrastructure. HTTP Status Code? Presentation.
