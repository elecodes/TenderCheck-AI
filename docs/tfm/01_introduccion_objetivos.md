# Capítulo 1: Introducción

## 1.1. Contexto y Motivación
La contratación pública es un proceso complejo y burocrático. Las pymes a menudo desisten de participar debido a la dificultad para interpretar los pliegos (LCSP) y asegurar que sus ofertas cumplen con todos los requisitos técnicos y administrativos. Un error menor puede significar la exclusión.

TenderCheck AI nace como una herramienta de **democratización**, utilizando Inteligencia Artificial para asistir a los licitadores en la validación automática de sus propuestas antes de presentarlas.

## 1.2. Objetivos del Proyecto
### Objetivo General
Desarrollar un asistente inteligente (MVP) capaz de analizar pliegos de contratación y validar la solvencia técnica de las ofertas presentadas, garantizando privacidad y bajo coste.

### Objetivos Específicos
1.  Implementar un sistema de extracción de texto de documentos PDF oficiales.
2.  Desarrollar un motor de comparación semántica que cruce requisitos vs oferta.
3.  Integrar una Base de Conocimiento Legal (RAG) que interprete la Ley 9/2017 (LCSP).
4.  Demostrar la viabilidad técnica de una arquitectura **Local-First**, eliminando la dependencia de APIs costosas (OpenAI) mediante modelos Open Source (Ollama/Hugging Face).

---

# Capítulo 2: Estado del Arte y Tecnologías

## 2.1. Análisis del Problema
Actualmente, la revisión de ofertas es manual (lenta y propensa a errores) o utiliza software de gestión documental clásico (basado en palabras clave, no en comprensión semántica).

## 2.2. Solución Propuesta: RAG (Retrieval-Augmented Generation)
La IA Generativa por sí sola "alucina" (inventa datos). RAG soluciona esto inyectando contexto real (la ley) en el prompt del modelo.
En este TFM, proponemos una variante innovadora: **RAG Local Eficiente**, que utiliza modelos cuantizados (pequeños) ejecutados en la CPU del usuario, sacrificando una mínima precisión a cambio de privacidad total y coste cero.
