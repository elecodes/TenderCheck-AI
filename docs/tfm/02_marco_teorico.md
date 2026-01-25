# Capítulo 2: Marco Teórico y Requisitos del Sistema

## 2.1. Estado del Arte: IA Legal (LegalTech)
El uso de PLN (Procesamiento de Lenguaje Natural) en el ámbito legal ha evolucionado desde sistemas basados en reglas (RegEx) a modelos probabilísticos (Transformers).

### 2.1.1. LLMs vs SLMs
- **LLMs (GPT-4)**: Alta capacidad de razonamiento pero coste elevado y privacidad comprometida.
- **SLMs (Llama 3)**: Modelos *Small Language Models* ejecutables en local. Su uso democratiza la IA privada, eliminando la dependencia de nubes extranjeras, factor crítico para la administración pública.

## 2.2. Técnicas de Recuperación de Información
### 2.2.1. RAG (Retrieval Augmented Generation)
Para mitigar las "alucinaciones" de la IA, TenderCheck AI utiliza un enfoque RAG simplificado: se extrae el texto completo del PDF (Contexto), se limpia y se inyecta en el prompt del modelo para obligarle a responder basándose *únicamente* en esa evidencia.

## 2.3. Especificación de Requisitos de Software (SRS)

### 2.3.1. Requisitos Funcionales (RF)
El sistema debe cumplir con las siguientes funcionalidades críticas:

- **RF-01 Ingesta Documental**: Capacidad para cargar y procesar archivos PDF correspondientes a Pliegos y Ofertas.
- **RF-02 Extracción de Texto**: Conversión de contenido PDF a texto plano normalizado.
- **RF-03 Identificación de Requisitos**: Uso de IA Local para extraer cláusulas técnicas y administrativas.
- **RF-04 Clasificación de Prioridad**: Distinción automática entre requisitos OBLIGATORIOS (Mandatory) y OPCIONALES (Optional/Valued).
- **RF-05 Validación de Cumplimiento**: Comparación semántica entre lo exigido en el Pliego y lo ofrecido en la Propuesta.
- **RF-06 Panel de Control**: Interfaz gráfica para gestionar licitaciones y visualizar resultados mediante códigos de color (Verde/Rojo/Morado).

### 2.3.2. Requisitos No Funcionales (RNF)
- **RNF-01 Privacidad**: Ningún dato debe salir de la infraestructura local del usuario.
- **RNF-02 Coste Cero**: El sistema no debe depender de servicios de pago por uso (API Keys).
- **RNF-03 Transparencia**: Cada validación debe ir acompañada de la evidencia (cita textual) extraída del documento original.
- **RNF-04 Resiliencia**: El sistema debe manejar errores de parseo o caídas del modelo de IA sin bloquearse (Fallbacks).

## 2.4. Estándares y Normativa
El desarrollo se adhiere a los siguientes estándares:
- **Calidad de Código**: Clean Architecture y principios SOLID.
- **Testing**: Cobertura de código mínima del 80% (Vitest).
- **Seguridad**: Validación de tipos en tiempo de ejecución (Zod) y cabeceras de seguridad (Helmet).
