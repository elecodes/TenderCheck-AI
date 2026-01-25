# Capítulo 3: Arquitectura y Diseño Técnico

## 3.1. Visión General de la Arquitectura
TenderCheck AI implementa una arquitectura desacoplada basada en servicios REST, siguiendo los principios de **Clean Architecture** (Arquitectura Limpia) postulados por Robert C. Martin. Este enfoque garantiza que la lógica de negocio (Dominio) permanezca independiente de frameworks, bases de datos o interfaces de usuario.

![Diagrama Arquitectura](https://mermaid.ink/img/pako:eNp1kU9rwjAQxb9KyGkL9a_gQWwvCiKIlx7soYfSjI2BNknIxFbE7960VVvowc0h7_1-82YmG6istWSCfF-oHdwqWcOjiQ9E8s-n84l4_v6wIJ8r_ECh02534C15h8oP1FdaW8V0-l3R6TzS1iit4B39VtrB9_3v_v-CD9RS6a00Dk5w7-AMHqBRGj1DqSfoHDr4hM6hE6fQWzgv9b3SG-hK3SlYqT-VfoN28AA9vH9DHzK5d_BdaQst4Q1-w0cIJYyghCnMYAZLWMESVvAAG1jDBvaQwh52sIcd-H4JJUyhgClMYAZLWMESVvAAG1jDBvaQwh52sIcd-H4JJUyhhClMYAZLWMESVvAAG1jDBvaQwh52sIcd-H4SSphCCVOYwAQWsIQVLMH__lZqD7N_38P8Bwuil6Y?type=png)

## 3.2. Estructura del Proyecto (Source Tree)
La organización del código refleja la separación de responsabilidades:

```text
TenderCheckAI/
├── backend/
│   ├── src/
│   │   ├── application/        # Casos de Uso (Orquestación)
│   │   │   ├── use-cases/      # Ej: CreateTender, ValidateProposal
│   │   │   ├── services/       # Ej: AuthService
│   │   ├── domain/             # Lógica de Negocio Pura (Nucleo)
│   │   │   ├── entities/       # Ej: Tender, Requirement, User
│   │   │   ├── interfaces/     # Contratos (ITenderAnalyzer, IUserRepository)
│   │   │   ├── services/       # Servicios de Dominio
│   │   │   └── validation/     # Reglas de Validación (Scope Check)
│   │   ├── infrastructure/     # Implementaciones Técnicas
│   │   │   ├── adapters/       # Ej: PdfParserAdapter
│   │   │   ├── services/       # Ej: OllamaModelService (IA Local)
│   │   │   ├── repositories/   # Ej: InMemoryUserRepository
│   │   │   └── server.ts       # Punto de entrada (Express)
│   │   └── presentation/       # API REST
│   │       ├── controllers/    # Ej: AuthController, TenderController
│   │       └── routes/         # Definición de Endpoints
│   └── test/
│       ├── unit/           # Tests unitarios (Vitest)
│       └── integration/    # Tests de integración (API)
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React (UI)
│   │   │   ├── auth/           # Login/Register Forms
│   │   │   ├── dashboard/      # Panel Principal
│   │   │   └── ui/             # Elementos base (Botones, Inputs)
│   │   ├── services/           # Cliente API (Fetch)
│   │   ├── types.ts            # Definiciones de Tipos Compartidos
│   │   └── App.tsx             # Componente Raíz y Routing
└── docs/                       # Documentación del Proyecto
    ├── adr/                    # Decisiones de Arquitectura (ADRs)
    ├── standards/              # Normativa de Código
    └── tfm/                    # Memoria del Trabajo Fin de Máster
```

## 3.3. Descripción de Componentes Clave

### 3.3.1. Capa de Dominio (Domain)
Es el corazón del software. Define *qué* hace el sistema, no *cómo*.
- **`TenderAnalysis`**: Entidad principal que agrega los requisitos extraídos.
- **`ITenderAnalyzer`**: Interfaz que abstrae el motor de IA. Esto nos permite cambiar de OpenAI a Ollama sin tocar el dominio.

### 3.3.2. Capa de Aplicación (Application)
Actúa como **orquestador** del sistema. No contiene lógica de negocio compleja (que reside en el dominio) ni detalles técnicos (infraestructura), sino que coordina el flujo de datos.
- **Casos de Uso (Use Cases)**:
    - **`CreateTender`**: Coordina la recepción del PDF, su parseo a texto y la llamada al servicio de IA para extraer requisitos.
    - **`ValidateProposal`**: Ejecuta la lógica de comparación entre una oferta y los requisitos del pliego.
- **Servicios de Aplicación**:
    - **`AuthService`**: Gestiona el flujo de registro y login, hasheando contraseñas y generando tokens, delegando la persistencia en el repositorio.

### 3.3.3. Capa de Infraestructura (Infrastructure)
Contiene los detalles técnicos y librerías externas.
- **`OllamaModelService`**: Implementación concreta que conecta con el servidor local de IA (puerto 11434). Incluye lógica de *retry* y limpieza de JSON.
- **`InMemoryRepository`**: Persistencia volátil para permitir un desarrollo ágil sin configurar bases de datos pesadas.

### 3.3.3. Capa de Presentación (Frontend)
Desarrollada como una **SPA** (Single Page Application).
- **Gestión de Estado**: React Hooks (`useState`, `useEffect`) para manejar la sesión del usuario y la carga de archivos.
- **Diseño**: TailwindCSS para un diseño responsivo y modo oscuro nativo.

## 3.4. Decisiones Arquitectónicas (ADRs)
Se han documentado formalmente las siguientes decisiones:
- **ADR-003**: Inyección de Dependencias manual para mantener la simplicidad.
- **ADR-005**: Estrategia "Local-First" para IA y Autenticación, priorizando la privacidad de datos sensibles gubernamentales.

## 3.5. Subsistema de Conocimiento (RAG)
Para mitigar el riesgo de alucinaciones (común en los LLMs), la arquitectura incluye un módulo de **Retrieval Augmented Generation**.
1.  **Ingesta**: El PDF se convierte a texto crudo.
2.  **Fragmentación (Chunking)**: Se divide el texto en bloques lógicos (párrafos/cláusulas).
3.  **Inyección de Contexto**: En lugar de usar una Vector DB externa (complejidad innecesaria para el MVP), inyectamos el texto relevante directamente en la ventana de contexto de 8k tokens de Llama 3, utilizando técnicas de *Prompt Engineering* para estructurar la salida.

## 3.6. Estrategia de Diseño de Interfaz (UI/UX)
El diseño del frontend se rige por principios de usabilidad centrados en el usuario administrativo.

### 3.6.1. Heurísticas de Nielsen
- **Visibilidad del Estado**: Uso de indicadores de carga (Spinners) y mensajes de éxito/error claros (Toasts).
- **Consistencia**: Uso de un Design System implementado con TailwindCSS para mantener uniformidad en colores, tipografías y espaciados.
- **Prevención de Errores**: Validación de formularios en tiempo real con `Zod` y `React Hook Form` antes del envío.

### 3.6.2. Accesibilidad (A11y)
Se cumple con el nivel AA de las WCAG 2.1:
- Contraste de colores suficiente (verificado en Modo Oscuro).
- Elementos interactivos con etiquetas `aria-label`.
- Navegabilidad completa mediante teclado.

## 3.7. Estrategia de Calidad y Pruebas
La arquitectura soporta una estrategia de testing piramidal:
- **Unit Testing (Vitest)**: Cobertura objetiva >80% en lógica de negocio (Entidades, Validadores).
- **Integration Testing**: Verificación de los adaptadores (Ollama service, Repositorios) con datos mockeados.
- **Static Analysis**: ESLint y TypeScript en modo estricto para prevenir errores en tiempo de compilación.

## 3.8. Principios de Diseño de Software (SOLID)
El desarrollo del backend se ha adherido estrictamente a los principios SOLID para asegurar mantenibilidad:

1.  **S - Single Responsibility Principle (SRP)**:
    - Cada clase tiene una única razón para cambiar. Ejemplo: `OllamaModelService` solo se encarga de hablar con la IA, no de guardar datos en la DB.
2.  **O - Open/Closed Principle (OCP)**:
    - Las entidades están abiertas a extensión pero cerradas a modificación. Ejemplo: Podemos añadir nuevos validadores de reglas sin modificar el `ValidationEngine` principal.
3.  **L - Liskov Substitution Principle (LSP)**:
    - Las implementaciones de repositorios (`InMemoryUserRepository`) son intercambiables por futuras implementaciones SQL sin romper la aplicación.
4.  **I - Interface Segregation Principle (ISP)**:
    - Las interfaces como `ITenderAnalyzer` son pequeñas y específicas, evitando obligar a las clases a implementar métodos que no usan.
5.  **D - Dependency Inversion Principle (DIP)**:
    - Los Casos de Uso dependen de abstracciones (`ITenderAnalyzer`), no de detalles concretos (`OpenAI` o `Ollama`). Esto permitió migrar de OpenAI a Ollama cambiando una sola línea en `TenderRoutes.ts`.
