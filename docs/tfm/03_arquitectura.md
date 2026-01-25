# Capítulo 3: Arquitectura del Sistema

## 3.1. Visión General
TenderCheck AI se ha diseñado siguiendo un patrón de **Monolito Modular** construido sobre Typescript (Full Stack), lo que permite un desarrollo unificado y un tipado fuerte de extremo a extremo.

La arquitectura prioriza tres pilares fundamentales que alinean con los objetivos del TFM:
1.  **Privacidad por Diseño**: Los datos sensibles (pliegos y ofertas) no deben abandonar la infraestructura local salvo que sea estrictamente necesario.
2.  **Coste Cero (Zero-Cost)**: Viabilidad para pymes sin depender de suscripciones mensuales a APIs de terceros.
3.  **Extensibilidad**: Uso de principios SOLID para permitir cambiar motores de IA en el futuro.

## 3.2. Diagrama de Arquitectura
*(Insertar diagrama Mermaid aquí o referenciar Figura 3.1)*

El sistema se divide en tres capas lógicas:

### Capa de Presentación (Frontend)
- **Tecnología**: React + Vite + TailwindCSS.
- **Responsabilidad**: Interfaz de usuario reactiva, gestión de carga de archivos y visualización de tarjetas de cumplimiento.
- **Comunicación**: REST API con el backend.

### Capa de Aplicación y Dominio (Backend)
- **Tecnología**: Node.js + Express.
- **Responsabilidad**: Orquestación de casos de uso (`CreateTender`, `ValidateProposal`).
- **Diseño**: Arquitectura Hexagonal (Puertos y Adaptadores). El núcleo de negocio es agnóstico a la base de datos o al proveedor de IA.

### Capa de Infraestructura (AI & Data)
Aquí reside la innovación principal del proyecto respecto a soluciones comerciales:

1.  **Motor RAG Local (Retrieval-Augmented Generation)**:
    - **Embeddings**: `Transformers.js` (`all-MiniLM-L6-v2`) ejecutándose en CPU.
    - **Vector Store**: Sistema de archivos local (`JSON`) para persistencia ligera, evitando la complejidad de bases de datos vectoriales dedicadas (Chroma/Pinecone) en esta fase MVP.
    - **Retrieval**: Búsqueda por similitud del coseno para encontrar artículos de la **Ley de Contratos del Sector Público (LCSP)** relevantes para cada requisito.

2.  **Motor de Razonamiento (LLM Local)**:
    - **Tecnología**: **Ollama** (Llama 3 / Mistral).
    - **Función**: Analiza el texto de la oferta y lo compara con los requisitos, teniendo en cuenta el contexto legal recuperado por el RAG.
    - **Ventaja**: Privacidad total y coste nulo por token.

## 3.3. Patrones de Diseño Clave
- **Dependency Injection**: El servicio `TenderRoutes` inyecta las implementaciones concretas (`OllamaModelService`, `LocalRAGLegalService`) en los Casos de Uso. Esto permitió cambiar de OpenAI a Ollama sin tocar una sola línea de la lógica de negocio (`ValidateProposal`).
- **Strategy Pattern**: Para la validación de reglas (`ScopeValidationRule`), permitiendo añadir nuevas reglas en el futuro sin modificar el motor de validación.

## 3.4. Flujo de Datos (Data Flow)
1.  **Ingesta**: El usuario sube el PDF. `PdfParserAdapter` extrae el texto plano.
2.  **Recuperación (Retrieval)**: Para cada requisito de la licitación, el sistema busca en la Base de Conocimiento Local fragmentos legales relevantes.
3.  **Generación (Reasoning)**: Se construye un prompt enriquecido ("Aquí está el requisito + Aquí está la ley + Aquí está la oferta") y se envía a Ollama.
4.  **Respuesta**: El LLM devuelve un JSON estructurado con el veredicto (CUMPLE / NO CUMPLE) y la evidencia.
