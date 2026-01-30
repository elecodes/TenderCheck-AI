# ADR 013: Refinamiento de Lógica AI y Migración Vectorial Cloud

## Estado
Aceptado

## Fecha
2026-01-28

## Contexto
El sistema inicial sufría de "ceguera" (no encontraba requisitos en documentos largos), imprecisión en la extracción (confundía texto relleno con requisitos), y dependía de Ollama para la búsqueda vectorial (incompatible con el despliegue en Render).

## Decisión
1. **Desbloqueo de Ventana de Contexto**: Se incrementó el límite de caracteres de 25k a **500k** para aprovechar la ventana de 1M tokens de **Gemini 2.5 Flash**.
2. **Estrategia de Doble Prompt**:
    *   **Extracción (Input)**: Prompt de "Auditor Legal & Técnico". Busca imperativos estrictos ("deberá", "obligatorio").
    *   **Comparación (Validation)**: Prompt de "Evaluador Senior". Aplica reglas de equivalencia semántica y cumplimiento positivo (> mínimo es válido).
3. **Migración Vectorial**: Se reemplazó `ollama` + `nomic-embed-text` con **Google Genkit (`text-embedding-004`)** para una arquitectura 100% Cloud-Native.
4. **Normalización de UI**: Se estandarizó el mapeo de estados (`PARTIAL` -> Amber) y puntajes de confianza (`0-1` -> `%`).

## Consecuencias
*   **Positivas**:
    *   Precisión drásticamente mejorada (encuentra evidencia en pág. 20+).
    *   Eliminación de dependencias locales pesadas (Ollama).
    *   Experiencia de usuario profesional (Etiquetas en Español, colores consistentes).
*   **Negativas**:
    *   Mayor consumo de tokens en Gemini (pero dentro del Free Tier generoso de Google).
