# 🧠 TenderCheck AI Knowledge Base

Esta carpeta contiene la "inteligencia" legal y técnica de TenderCheck AI.
El sistema lee estos archivos, los procesa y los utiliza para validar las ofertas.

## 📂 ¿Qué debo subir aquí?

Cualquier archivo **Markdown (.md)** que contenga información relevante para evaluar pliegos.

### Tipos de Contenido Recomendado:

1.  **Artículos de Ley (LCSP)**: Texto oficial de la Ley de Contratos del Sector Público.
2.  **Guías de Interpretación**: Tus propios apuntes sobre cómo interpretar reglas difíciles (ej. "Solvencia Técnica").
3.  **Ejemplos Reales**: Casos de éxito (CUMPLE) y fracaso (NO CUMPLE) para que la IA tenga referencias.
4.  **Diccionarios / Glosarios**: Definiciones de términos técnicos.

---

## 📝 Formato Recomendado (¡Muy Importante!)

El sistema corta los documentos usando los **Títulos de Nivel 2 (`##`)**.
Cada bloque que empiece por `##` se convertirá en un "trozo de conocimiento" independiente.

### Plantilla de Ejemplo:

```markdown
# Ley de Contratos - Artículos Clave

## Artículo 63. Perfil de contratante
El perfil de contratante agrupará la información y documentos relativos a la actividad contractual...
(Aquí pegas el texto legal completo...)

## Artículo 145. Requisitos de los criterios de adjudicación
La valoración de las proposiciones y la determinación de la mejor oferta se realizará...
(Texto del artículo...)

## Guía: Cómo evaluar la Solvencia Técnica
Para evaluar la solvencia técnica, busca siempre:
1. Certificados de buena ejecución.
2. Que las fechas estén dentro de los últimos 3 años (o 5 años para obras).
3. Que el importe acumulado cubra el presupuesto base.
```

## 🚀 Cómo "Entrenar" (Actualizar)

Después de añadir o editar archivos aquí, ejecuta este comando en la terminal para actualizar la memoria de la IA:

```bash
# Desde la carpeta /backend
npm run index-knowledge
```

(O `npx tsx scripts/index_knowledge.ts` si no tienes el script en package.json)

Reinicia el servidor (`npm run dev`) y la IA sabrá lo nuevo.
