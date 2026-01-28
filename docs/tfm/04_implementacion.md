# Capítulo 4: Implementación y Desarrollo

## 4.1. Análisis de Requisitos y Modelado
Se ha formalizado el análisis funcional mediante diagramas UML, detallando los casos de uso principales (Gestión de Licitaciones, Validación de Propuestas) en el documento `docs/standards/requirements_UML.md`.

## 4.2. Pipeline de Desarrollo y Seguridad (DevSecOps)
La implementación integra controles de calidad automatizados:
- **Pre-Commit (Husky)**: Ejecuta `lint` y `test` para asegurar la calidad del código.
- **Pre-Push (Husky)**: Ejecuta `snyk test` para prevenir la subida de dependencias vulnerables.
- **Observabilidad**: Instrumentación con Sentry en capas Frontend y Backend.
- **Frontend**: React + Vite + TailwindCSS (Interfaz completamente localizada al **Español**).
    - **Accesibilidad**: Cumplimiento WCAG 2.1 AA (Navegación por teclado, anillos de foco visibles, tamaño de texto legible en móvil).
    - **Seguridad**: Prevención de enumeración de usuarios mediante mensajes de error genéricos en formularios de autenticación.
    - **Autenticación en Nube**: Integración con **Google Sign-In** (OIDC) y flujos de recuperación de contraseña ("Forgot Password").
- **Backend**: Node.js + Express + TypeScript (API REST).
- **IA**: Ollama (Mistral) para inferencia local con **búsqueda vectorial** (nomic-embed-text, 768 dimensiones).
- **Base de Datos**: Persistencia relacional mediante **SQLite** (`better-sqlite3`) con almacenamiento de **embeddings vectoriales** (BLOB), garantizando que los análisis no se pierdan al cerrar la sesión.

## 4.3. Implementación de Algoritmos (Code Snippets)
A continuación se detallan los algoritmos clave implementados en `backend/src/domain`:

## 4.4. Sistema de Autenticación y Persistencia
Se ha implementado un sistema robusto para la gestión de datos.
- **Autenticación**: Basada en **JWT (JSON Web Tokens)** con almacenamiento seguro en el servidor y `localStorage` en el cliente.
- **Persistencia de Licitaciones**: Implementación del patrón *Repository* con **Turso (LibSQL)** para almacenar la relación entre Usuarios, Análisis, Requisitos y Resultados de Validación. Esta migración a la nube permite que los datos sobrevivan al reinicio de los contenedores de aplicación.
- **Migración a la Nube**: Pivotaje arquitectónico desde SQLite local a Turso para resolver problemas de persistencia en entornos serverless (Render).

## 4.5. Infraestructura Cloud (Render + Turso + Gemini)
El sistema ha evolucionado hacia un modelo *Cloud-Native* para garantizar escalabilidad y estabilidad:
- **Hosting (Render)**:
  - **Backend**: Desplegado como "Web Service" en Node.js 22.
  - **Frontend**: Desplegado como "Static Site" (SPA).
  - **Comunicación**: Variables de entorno seguras (`DATA_API_KEY`, `ALLOWED_ORIGINS`).
- **Base de Datos (Turso)**:
  - Base de datos distribuida basada en libSQL.
  - Gestión de esquemas automática al inicio (`SqliteDatabase.initializeSchema()`).
- **IA (Gemini 2.5 Flash)**:
  - Sustitución de Ollama (ejecución local pesada) por API de Google Vertex AI.
  - Reducción drástica de latencia (<5s vs 2min) y eliminación de timeouts en despliegue.

## 4.4. Procesamiento de Ofertas y Resumen de Cumplimiento
Tras extraer los requisitos del pliego, el sistema permite subir una oferta para su validación.

### 4.4.1. Motor de Comparación IA
- **Entrada**: Texto del requisito + Texto de la oferta.
- **Salida**: JSON con estado (CUMPLE/NO CUMPLE), razonamiento detallado y cita textual de la evidencia.
- **Optimización**: Se utiliza truncado de contexto y control de tokens para asegurar que la comparativa sea precisa y rápida.

### 4.4.2. Optimización de Rendimiento
- **Procesamiento Paralelo**: Validación de 3 requisitos simultáneamente (3x concurrencia).
- **Búsqueda Vectorial**: Infraestructura de embeddings con `nomic-embed-text` para futuras optimizaciones de filtrado semántico.
- **Resultados Determinísticos**: Temperatura 0.0 para garantizar consistencia en las validaciones.
- **Rendimiento**: Reducción del tiempo de validación de 5+ minutos a 2-3 minutos (mejora del 50%).

### 4.4.3. Visualización de Estadísticas (ValidationSummary)
Se ha desarrollado un componente de visualización que calcula dinámicamente:
- Porcentaje de éxito global.
- Ratio de cumplimiento de requisitos **OBLIGATORIOS**.
- Ratio de cumplimiento de requisitos **OPCIONALES**.

## 4.5. Exportación y Gestión de Historial
- **Informe PDF (jsPDF)**: Generación dinámica de reportes profesionales que incluyen el logo, el resumen de estadísticas y la tabla detallada de evidencias.
- **Gestión de Historial**: Implementación de una barra lateral dinámica que permite la búsqueda reactiva y la eliminación segura de registros de la base de datos.

## 4.6. Resultados Obtenidos
La versión final de TenderCheck AI permite:
1.  **Ingesta Inteligente**: Procesamiento de pliegos y ofertas atomizado.
2.  **Validación Basada en Evidencias**: No solo dice si cumple, sino que muestra *por qué* y *dónde* está la prueba en el documento del licitador.
3.  **Auditoría Histórica**: Capacidad de revisar y gestionar el cumplimiento de múltiples licitaciones de forma persistente.
4.  **Entrega Profesional**: Generación de documentos PDF listos para ser adjuntados a un expediente de contratación.
