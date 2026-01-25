# Capítulo 4: Implementación y Desarrollo

## 4.1. Análisis de Requisitos y Modelado
Se ha formalizado el análisis funcional mediante diagramas UML, detallando los casos de uso principales (Gestión de Licitaciones, Validación de Propuestas) en el documento `docs/standards/requirements_UML.md`.

## 4.2. Pipeline de Desarrollo y Seguridad (DevSecOps)
La implementación integra controles de calidad automatizados:
- **Pre-Commit (Husky)**: Ejecuta `lint` y `test` para asegurar la calidad del código.
- **Pre-Push (Husky)**: Ejecuta `snyk test` para prevenir la subida de dependencias vulnerables.
- **Observabilidad**: Instrumentación con Sentry en capas Frontend y Backend.
- **Frontend**: React + Vite + TailwindCSS (Interfaz de Usuario Reactiva).
- **Backend**: Node.js + Express + TypeScript (API REST).
- **IA**: Ollama (Llama 3) para inferencia local.
- **Base de Datos**: Repositorios en Memoria (MVP) simulando arquitectura Repository Pattern para fácil migración a SQL/NoSQL.

## 4.3. Sistema de Autenticación
Se ha implementado un sistema de autenticación seguro basado en **JWT (JSON Web Tokens)**.
- **Registro**: Los usuarios pueden crear cuentas; las contraseñas se almacenan hasheadas utilizando `bcrypt`.
- **Login**: Al autenticarse, el servidor emite un token JWT firmado que el cliente almacena en `localStorage`.
- **Seguridad**: Todas las rutas sensibles de la API requerirán este token en la cabecera `Authorization`.

## 4.3. Integración de IA Local (Ollama)
En lugar de depender de APIs de terceros (OpenAI), hemos integrado **Ollama** para ejecutar modelos LLM directamente en el servidor.

### 4.3.1. Desafíos y Soluciones
1.  **Límite de Contexto/Recursos**:
    - *Problema*: Procesar pliegos enteros (50k+ caracteres) bloqueaba la máquina de desarrollo.
    - *Solución*: Implementación de truncado inteligente (4k caracteres) y limitación de ventana de contexto en el driver de Ollama.

2.  **Alucinaciones de Formato (JSON)**:
    - *Problema*: Los modelos pequeños a veces incluyen texto conversacion ("Aquí está tu JSON...") rompiendo el parser.
    - *Solución*: Desarrollo de un **Parser Resiliente** en `OllamaModelService` que extrae quirúrgicamente el bloque JSON y normaliza las claves mediante búsqueda recursiva.

3.  **Clasificación de Requisitos (Opcional vs Obligatorio)**:
    - *Problema*: El modelo tendía a marcar todo como "MANDATORY".
    - *Solución*: Implementación de heurísticos de post-procesado que detectan palabras clave (*should, could, desirable*) para corregir la etiqueta a "OPTIONAL" automáticamente.

4.  **Integridad de Archivos en Subida (Browser Context)**:
    - *Problema*: Error `net::ERR_UPLOAD_FILE_CHANGED` cuando el navegador detecta accesos al PDF mientras se intenta subir.
    - *Solución*: Implementación de una capa de lectura en memoria (**Blob conversion**) en `api.ts` que congela el estado del archivo antes de iniciar la petición POST, garantizando una subida atómica.

## 4.4. Resultados Obtenidos
El sistema es capaz de:
1.  Ingestar documentos PDF complejos.
2.  Extraer requisitos técnicos en segundos sin coste.
3.  Visualizar estos requisitos diferenciando su prioridad (Mandatorio/Opcional).
4.  Validar ofertas frente a estos requisitos (Motor de Validación).
