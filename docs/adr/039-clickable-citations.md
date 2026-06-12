# ADR 039: Clickable Citations for Extracted Requirements

**Status:** Accepted  
**Date:** 2026-06-12

## Context and Problem Statement

Users had no way to verify where each extracted requirement came from in the source PDF. The AI would extract requirements and show a page number, but the user couldn't see the original document text that justified the extraction. This made the AI a "black box" — users had to trust the output blindly.

## Decision Drivers

- Users need to verify AI extraction accuracy against source documents
- PDF text extraction via `pdf-parse` provides no bounding boxes or coordinates
- Single AI call for page awareness (not one call per page) due to Gemini free tier rate limits
- Must work for both standard PDFs (< 15 pages) and large PDFs (chunked processing)

## Considered Options

1. **Page markers in prompt (chosen)**: Embed `--- PAGE X ---` separators into the document text, ask the AI to return page number + source text fragment for each requirement
2. **Post-hoc text matching**: Find each requirement in page texts after extraction — fragile, text rarely matches exactly
3. **Per-page chunked analysis**: One AI call per page — precise but kills rate limits with large PDFs

## Decision Outcome

Chosen option: **Page markers in prompt**, because it balances precision with API cost — a single AI call produces structured data with page numbers and exact source fragments.

### Key Implementation Details

- `chunking.ts` now builds chunk text with `--- PAGE X ---` markers instead of plain `\n\n` joins
- `AnalysisSchema` extended with `pageNumber` and `sourceText` fields in both `_analyze` and `analyzeChunk`
- Prompts instruct the AI to use page markers to determine the absolute page number for each requirement
- Full page texts (`pageTexts: string[]`) preserved in `TenderAnalysis` response for the frontend citation viewer
- `processStandardPdf` calls `parsePages()` and builds page-marked text; falls back gracefully if `parsePages` fails
- Frontend `CitationPreview` component: modal showing page text with highlighted source fragment

### Positive Consequences

- Users can click any "Pág. X" badge to see the exact document section where the requirement was found
- AI has structured guidance for page numbers — more reliable than free-form extraction
- Single-call approach keeps API costs low

### Negative Consequences

- AI can occasionally misidentify page numbers if page markers are ambiguous
- `parsePages()` is heuristic (splits by `--- Page N ---` markers from `pdf-parse`, or by character count) — may not always match the original PDF's pagination

## Files Changed

- `backend/src/infrastructure/services/GeminiGenkitService.ts` — schema + prompt updates
- `backend/src/infrastructure/utils/chunking.ts` — page markers in chunk text
- `backend/src/application/use-cases/CreateTender.ts` — `processStandardPdf` calls `parsePages()`, preserves `pageTexts`
- `backend/src/domain/entities/TenderAnalysis.ts` — added `pageTexts` field
- `frontend/src/types.ts` — added `pageTexts` to `TenderAnalysis`
- `frontend/src/components/ui/CitationPreview.tsx` — new citation modal component
- `frontend/src/components/dashboard/AnalysisResults.tsx` — page number badge is now a clickable button
- `frontend/src/index.css` — added fade-in/scale-in animations for modal
