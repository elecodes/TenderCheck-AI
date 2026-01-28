# ADR 011: Estrategia de Despliegue en Nube (Hugging Face Spaces)

## Estado
Aceptado

## Contexto
TenderCheck AI requiere un entorno de despliegue que soporte:
1.  **Ejecución de Docker**: Para orquestar Node.js + Ollama.
2.  **Aceleración GPU**: Para la inferencia de modelos de embeddings (`nomic-embed-text`) y LLM (`mistral`) en tiempo razonable.
3.  **Coste**: Gratuito o de bajo coste para la demostración del TFM.
4.  **Simplicidad**: Despliegue automatizado desde Git.

## Decisión
Se ha seleccionado **Hugging Face Spaces** utilizando el SDK de **Docker**.

### Detalles de Implementación
1.  **Imagen Base**: `nvidia/cuda:12.1.0-base-ubuntu22.04` para soporte nativo de GPU.
2.  **Gestión de Procesos**: Script `start.sh` personalizado para ejecutar Ollama en segundo plano (`nohup`) antes de iniciar la aplicación Node.js.
3.  **Persistencia**: Inicialmente efímera. Los modelos se pre-descargan en el `Dockerfile` (`RUN ollama pull ...`) para evitar tiempos de espera en tiempo de ejecución, aunque esto aumenta el tamaño de la imagen.
4.  **Networking**: La aplicación escucha en `0.0.0.0:7860` (puerto estándar de HF).
5.  **Frontend**: Servido estáticamente por el backend de Express para simplificar la arquitectura a un solo contenedor.

## Consecuencias
### Positivas
- Acceso gratuito a GPU (T4) en el tier básico de HF (sujeto a disponibilidad).
- Despliegue atómico (Frontend + Backend + IA en una unidad).
- SSL/TLS gestionado automáticamente por Hugging Face.

### Negativas
- **Tiempo de Arranque**: La inicialización del contenedor y la carga de modelos en VRAM puede tomar tiempo, causando timeouts en los health checks si no se optimiza.
- **Espacio en Disco**: Las imágenes son pesadas (>6GB), lo que ralentiza el ciclo de construcción.

## Alternativas Consideradas
- **Google Cloud Run**: Descartado por la complejidad de configurar GPU y costes asociados.
- **Vercel/Netlify**: Descartados por la falta de soporte para ejecutar binarios persistentes como Ollama.
