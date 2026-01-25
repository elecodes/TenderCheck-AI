# Capítulo 4: Implementación y Tecnologías

## 4.1. Stack Tecnológico
La elección de tecnologías responde al requisito de "Open Source y Estándares de Industria":

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Lenguaje** | TypeScript | Seguridad de tipos y ecosistema unificado Backend/Frontend. |
| **Backend** | Node.js / Express | Ligereza y amplia disponibilidad de librerías. |
| **Frontend** | React / Vite | Velocidad de desarrollo y experiencia de usuario moderna. |
| **IA Embeddings** | Transformers.js | Ejecución de modelos Hugging Face directamente en Node.js (On-Device AI). |
| **IA Reasoning** | Ollama | Interfaz estándar para ejecutar LLMs locales potentes (Llama 3). |

## 4.2. Implementación del RAG Local (Local RAG)
El mayor desafío técnico fue implementar un sistema RAG (Retrieval-Augmented Generation) sin costes de nube.

### 4.2.1. Ingesta de Conocimiento (`index_knowledge.ts`)
Desarrollamos un script de indexación que:
1.  Escanea una carpeta local de archivos Markdown (`/knowledge_base`).
2.  Fragmenta (Chunks) el texto basándose en encabezados semánticos (H2: "Artículo X").
3.  Genera vectores (embeddings) localmente usando el modelo `Xenova/all-MiniLM-L6-v2`.
4.  Almacena el resultado en un archivo `legal_knowledge.json` optimizado.

*Código destacado:*
```typescript
// Ejemplo simplificado de generación de embeddings local
const output = await extractor(text, { pooling: 'mean', normalize: true });
const embedding = output.data; // Vector de 384 dimensiones
```

### 4.2.2. Servicio de Recuperación (`LocalRAGLegalService`)
Implementa la interfaz `ILegalDataSource`. Al arrancar, carga el índice JSON en memoria (RAM). Cuando llega una consulta, calcula la **Similitud del Coseno** entre el vector de la consulta y los vectores almacenados, devolviendo los 3 resultados más relevantes (Top-K).

## 4.3. Implementación del Razonamiento (`OllamaModelService`)
Para sustituir a OpenAI, creamos un adaptador que se comunica con la API local de Ollama.

### Desafío: Estructura de Salida (JSON Mode)
Los modelos locales suelen ser "charlatanes". Para integrarlos en una aplicación, necesitamos respuestas deterministas (JSON).
**Solución**: Implementamos un "System Prompt" estricto y utilizamos el modo `format: 'json'` de la API de Ollama para garantizar que la respuesta siempre cumpla el esquema esperado por el Frontend.

```typescript
const prompt = \`
  Respond strictly with valid JSON. 
  Format: { "status": "COMPLIANT", "reasoning": "..." }
\`;
```

## 4.4. Gestión de Errores y Resiliencia
Se implementó un patrón de **Fallback** (Respaldo). El sistema está diseñado para manejar la ausencia de modelos. Si Ollama no responde, el sistema captura el error y devuelve un estado de "Error Parcial" en lugar de colgar la aplicación, informando al usuario de que debe iniciar el servicio local.
