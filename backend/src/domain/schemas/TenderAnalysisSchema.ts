import { z } from "zod";

export const RequirementTypeSchema = z.enum([
  "MANDATORY",
  "OPTIONAL",
  "UNKNOWN",
]);

export const RequirementSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  text: z.string().min(1),
  normalizedText: z.string().optional(),
  type: RequirementTypeSchema,
  source: z.object({
    pageNumber: z.number().int().min(0),
    paragraph: z.number().int().min(0).optional(),
    snippet: z.string(),
  }),
  keywords: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const ValidationStatusSchema = z.enum([
  "MET",
  "NOT_MET",
  "PARTIALLY_MET",
  "AMBIGUOUS",
]);

export const ValidationResultSchema = z.object({
  requirementId: z.string().min(1),
  status: ValidationStatusSchema,
  evidence: z
    .object({
      text: z.string(),
      pageNumber: z.number().int().min(0),
      fileUrl: z.string().url().optional(),
    })
    .optional(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  manualOverride: z
    .object({
      isOverride: z.boolean(),
      newStatus: ValidationStatusSchema,
      comment: z.string(),
      updatedAt: z.coerce.date(),
    })
    .optional(),
});

export const AnalysisStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const TenderAnalysisSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  tenderTitle: z.string().min(1),
  documentUrl: z.string().url().or(z.string().min(1)), // Allow path or URL
  status: AnalysisStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  requirements: z.array(RequirementSchema).optional(),
  results: z.array(ValidationResultSchema).optional(),
  metadata: z
    .object({
      pageCount: z.number().int().min(0).optional(),
      processingTimeMs: z.number().min(0).optional(),
      modelVersion: z.string().optional(),
    })
    .optional(),
});

// Type inference to verify compatibility (will error at compile time if mismatch)
// import type { TenderAnalysis } from '../entities/TenderAnalysis.js';
// const _check: TenderAnalysis = {} as z.infer<typeof TenderAnalysisSchema>;
