# 🧠 Guía de Ingeniería del Conocimiento (TenderCheck AI)

Esta guía define la estrategia para construir la Base de Conocimiento (Knowledge Base) que alimentará al sistema RAG.

## 1. Los 5 Documentos Fundamentales (LCSP España) 🇪🇸
Para que el agente entienda licitaciones de software (*Suministros y Servicios*), estos son los documentos esenciales:

1.  **Ley 9/2017, de Contratos del Sector Público (LCSP)**
    *   *Por qué:* Es la "Biblia". Define qué es un contrato, prohibiciones de contratar, y solvencia.
    *   *Foco:* Artículos 1, 63, 75-97 (Solvencia), 145 (Criterios de Adjudicación), 149 (Ofertas anormales).
2.  **Reglamento General de la LCAP (RD 1098/2001)**
    *   *Por qué:* Aunque es antiguo, detalla cómo se justifica la solvencia y aspectos técnicos no derogados por la LCSP.
3.  **Guías de la OIReScon (Oficina Independiente de Regulación y Supervisión de la Contratación)**
    *   *Por qué:* Interpretan la ley. Especialmente útil la **"Guía sobre criterios de adjudicación"** y **"Guía sobre bajas temerarias"**.
4.  **Pliegos Tipo de Servicios de Consultoría/Desarrollo (Junta Consultiva)**
    *   *Por qué:* Proveen el "estándar" de redacción. Ayudan a la IA a distinguir una cláusula estándar de una "hecha a medida".
5.  **Vocabulario Común de Contratos Públicos (Códigos CPV)**
    *   *Por qué:* Lista oficial de categorización (ej. `72000000-5 Servicios TI`). Ayuda al agente a clasificar el objeto del contrato.

---

## 2. Estructura de Directorios para LlamaIndex

LlamaIndex funciona mejor cuando separamos los datos "crudos" de los metadatos enriquecidos.

```text
/knowledge_base
│
├── 📂 raw_documents/          # Archivos originales (PDF)
│   ├── rules/                # Leyes y Reglamentos (LCSP, RD 1098)
│   ├── guides/               # Guías OIReScon y manuales
│   └── templates/            # Pliegos tipo y ejemplos pasados
│
├── 📂 processed/              # Optimizado para IA (Markdown/TXT)
│   ├── chunked_laws/         # La ley dividida por Artículo (Crucial para precisión)
│   └── definitions/          # Glosario de términos (UTE, Solvencia, Sobre 3)
│
└── 📂 training_data/          # Ejemplos "Gold Standard" (Fichas de Requisito)
```

**Consejo PRO:** No le des el PDF entero de la LCSP (400 páginas) de golpe a LlamaIndex. Usa un script para dividirlo en archivos pequeños por Artículo (`art_001.md`, `art_002.md`). Esto mejora brutalmente la recuperación.

---

## 3. Formato: Ficha de Requisito (Markdown)

Usa este formato para crear "Few-Shot Examples" (ejemplos de entrenamiento) que enseñen a la IA a razonar como un experto.

### 📄 Plantilla: Ficha de Validación de Requisito

```markdown
# ID Requisito: [REQ-CAT-00X]
**Tipo**: [MANDATORY | EVALUABLE]
**Categoría**: [Solvencia Técnica | Criterio de Seguridad | Equipo de Trabajo | Plazo]

## 📜 Texto Original (Pliego)
> "El equipo de trabajo deberá contar con al menos un Jefe de Proyecto con certificación PMP y 5 años de experiencia en proyectos similares."

## 🧠 Interpretación del Experto (Racional)
Este requisito exige dos condiciones simultáneas:
1.  **Titulación**: Certificación PMP válida.
2.  **Experiencia**: ≥ 5 años (60 meses) en proyectos de naturaleza análoga (TI/Software).
*Nota Legal:* Según Art. 76 LCSP, la experiencia se acredita mediante certificados de buena ejecución visados.

## ✅ Ejemplo CUMPLE (Oferta)
> "Como Jefe de Proyecto proponemos a D. Juan Pérez, certificado PMP (ID: 12345, ver Anexo I). Acompañamos su CV donde se detallan proyectos en el Ministerio de Justicia desde 2018 a 2024 (6 años) como responsable de desarrollo."

## ❌ Ejemplo NO CUMPLE (Oferta)
> "El equipo estará liderado por Dña. Ana Gómez, experta en gestión ágil con 10 años de experiencia dirigiendo equipos de marketing digital. Cuenta con certificación Scrum Master."
*Razón de fallo:* Scrum Master no es equivalente a PMP (según este pliego estricto) y la experiencia en "marketing" no es "similar" a desarrollo de software.

## ⚠️ Ejemplo AMBIGUO (Requiere Revisión)
> "Jefe de Proyecto: Carlos Ruiz. PMP en trámite. 7 años de experiencia."
*Razón:* "En trámite" no garantiza la posesión del título en la fecha de licitación. Riesgo de exclusión.
```
