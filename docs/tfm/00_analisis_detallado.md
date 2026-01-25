# Documento 00: Análisis Detallado y Viabilidad

## 1. Resumen Ejecutivo
El presente proyecto, **TenderCheck AI**, aborda la problemática de la validación técnica de licitaciones públicas ("Pliegos"). Actualmente, este proceso es manual, lento y propenso a errores humanos, especialmente en la verificación de cumplimiento de requisitos técnicos obligatorios (CRITERIOS DE SOLVENCIA TÉCNICA).

La solución propuesta es un asistente inteligente basado en **Inteligencia Artificial Local (Ollama/Llama 3)** que automatiza la extracción de requisitos y la validación de ofertas, garantizando la privacidad de los datos y reduciendo el tiempo de revisión en un 80%.

## 2. Análisis del Problema
### 2.1. Situación Actual
- **Volumen**: Las administraciones públicas publican miles de licitaciones anuales.
- **Complejidad**: Los pliegos (PDF) tienen estructuras no estandarizadas y lenguaje legal complejo.
- **Riesgo**: Un error en la validación puede impugnar un concurso público o adjudicar a un proveedor no cualificado.

### 2.2. Necesidad Detectada
Se requiere una herramienta que:
1.  Ingeste documentos PDF masivos.
2.  Entienda el contexto legal/técnico.
3.  Extraiga cláusulas de obligado cumplimiento ("Deberá tener...", "Obligatorio...").
4.  Compare estas cláusulas contra la documentación del proveedor.

## 3. Estudio de Viabilidad
### 3.1. Viabilidad Técnica
El uso de LLMs (Large Language Models) permite el razonamiento semántico necesario. La viabilidad de usar modelos locales (Llama 3 8B) se ha confirmado mediante pruebas de concepto, logrando una precisión aceptable con técnicas de *Prompt Engineering* y post-procesado heurístico.

### 3.2. Viabilidad Económica
El cambio a una arquitectura "Local-First" elimina los costes recurrentes de APIs (OpenAI), haciendo el proyecto sostenible y escalable sin coste por token.

### 3.3. Viabilidad Legal/Privacidad
Al procesar los datos en local, se garantiza el cumplimiento estricto del RGPD/GDPR, ya que ningún dato sensible abandona la infraestructura del organismo público.
