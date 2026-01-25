# Capítulo 2: Marco Teórico y Estado del Arte

## 2.1. Marco Legal: La Ley de Contratos (LCSP)
Para entender la problemática, es necesario analizar el contexto regulatorio. La **Ley 9/2017 (LCSP)** establece reglas estrictas de:
1.  **Transparencia**: Publicación en el Perfil del Contratante (Art. 63).
2.  **Solvencia**: Requisitos técnicos y económicos que actúan como barrera de entrada (Art. 87-90).
3.  **Criterios de Adjudicación**: Reglas objetivas (fórmulas) y subjetivas (juicios de valor) (Art. 145).

*Justificación tecnológica*: La complejidad de estos textos (lenguaje jurídico denso) hace que los algoritmos de búsqueda tradicionales (keyword search) fallen. Se requiere comprensión semántica (NLP).

## 2.2. Tecnologías de Inteligencia Artificial Generativa
### 2.2.1. Large Language Models (LLMs)
Modelos entrenados con terabytes de texto capaces de razonar.
- **Estado actual**: Dominio de modelos cerrados (GPT-4, Claude).
- **Tendencia Open Source**: Aparición de modelos eficientes ejecutables en local (Llama 3, Mistral) que democratizan el acceso.

### 2.2.2. Retrieval-Augmented Generation (RAG)
Arquitectura que combina un "recuperador" de información (Buscador) con un "generador" (LLM).
- **Problema de la Alucinación**: Los LLMs inventan datos si no tienen contexto.
- **Solución RAG**:
    1.  Usuario: "¿Qué solvencia se pide?"
    2.  Sistema: Busca en el PDF del pliego.
    3.  Sistema: Envía al LLM "El pliego dice X. Responde a la pregunta".

## 2.3. Estado del Arte en Validación de Documentos
Existen soluciones SaaS (Software as a Service) comerciales, pero presentan dos problemas para el sector público/privado sensible:
1.  **Privacidad**: Subir pliegos confidenciales a la nube de terceros.
2.  **Coste**: Modelos de suscripción caros.

**Propuesta de Valor de este TFM**:
Demostrar que es posible construir una solución **in-house**, **privada** y **gratuita** utilizando el ecosistema Open Source actual (Ollama + Transformers.js), superando las barreras de entrada tradicionales.
