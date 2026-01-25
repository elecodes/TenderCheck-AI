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
│   └── test/                   # Tests Unitarios e Integración
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
