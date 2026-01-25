# Análisis Detallado: Componentes y Requisitos

## 1. Explicación de Capas (Clean Architecture)

### 🔵 Domain Layer (El Corazón)
*Independiente de la tecnología. Define QUÉ hace el sistema, no CÓMO.*
- **Entities**: `TenderAnalysis`, `Requirement`. Son los objetos de datos puros.
- **Interfaces**: `ITenderRepository`, `ITenderAnalyzer`, `ILegalDataSource`. Son los "contratos". El dominio dice "Necesito alguien que analice esto", pero no sabe si es OpenAI u Ollama.

### 🟡 Application Layer (Los Casos de Uso)
*Orquestadores. Coordinan el flujo.*
- `CreateTender`: Recibe un PDF -> Llama al parser -> Llama al Analizador -> Guarda resultado.
- `ValidateProposal`: Recibe oferta -> Busca leyes (RAG) -> Compara con requisitos -> Devuelve informe.

### 🔴 Infrastructure Layer (El Mundo Real)
*Implementaciones concretas. Aquí vive el código "sucio".*
- **Servicios**: `OllamaModelService` (habla con la IA local), `LocalRAGLegalService` (busca en archivos JSON).
- **Repositorios**: `InMemoryTenderRepository` (guarda en RAM para el MVP).
- **Adaptadores**: `PdfParserAdapter` (usa librería pdf-parse).

---

## 2. Requisitos para Diagramas

### Requisitos Funcionales (RF)
- **RF-01 Análisis de Pliegos**: El sistema debe extraer automáticamente requisitos técnicos y solvencia de un PDF.
- **RF-02 Validación de Ofertas**: El sistema debe comparar el texto de una oferta contra los requisitos extraídos.
- **RF-03 Citas Legales**: El sistema debe justificar sus validaciones citando artículos de la LCSP (RAG).
- **RF-04 Gestión de Archivos**: El usuario debe poder subir y procesar archivos PDF de hasta 50MB.

### Requisitos No Funcionales (RNF)
- **RNF-01 Privacidad (Data Sovereignty)**: Ningún dato del usuario debe salir de la red local (Local-First).
- **RNF-02 Coste Cero**: El sistema no debe requerir licencias de pago por uso (APIs).
- **RNF-03 Extensibilidad**: La arquitectura debe permitir cambiar el motor de IA sin reescribir la lógica de negocio (SOLID).
- **RNF-04 Resiliencia**: El sistema debe manejar fallos del modelo de IA (Timeout/Down) sin bloquearse (Fallback).

---

## 3. Esqueleto del Proyecto (File Tree)

\`\`\`text
TenderCheckAI/
├── frontend/ (React + Vite)
│   ├── src/components/ (UI: ComparisonResults, Upload)
│   └── src/services/ (Cliente API)
├── backend/ (Node.js + Express)
│   ├── src/domain/ (Reglas de Negocio Puras)
│   │   ├── entities/ (Tender, ValidationResult)
│   │   └── interfaces/ (ITenderAnalyzer, ILegalDataSource)
│   ├── src/application/ (Casos de Uso)
│   │   ├── CreateTender.ts
│   │   └── ValidateProposal.ts
│   ├── src/infrastructure/ (Tecnología Concreta)
│   │   ├── services/ (OllamaModelService, LocalRAGLegalService)
│   │   └── repositories/ (InMemoryTenderRepository)
│   └── src/presentation/ (API REST)
│       └── routes/ (TenderRoutes)
├── knowledge_base/ (Datos RAG)
│   ├── raw_documents/ (Archivos Markdown: Leyes, Guías)
│   └── README.md
└── docs/ (Documentación TFM)
\`\`\`
