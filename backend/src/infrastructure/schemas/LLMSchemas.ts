import { z } from "zod";

export const RequirementLLMSchema = z.object({
  id: z
    .string()
    .describe("Unique identifier for the requirement (e.g., REQ-001)"),
  text: z.string().describe("Verbatim text of the requirement"),
  type: z
    .enum(["MANDATORY", "OPTIONAL", "UNKNOWN"])
    .describe("Importance level"),
  keywords: z
    .array(z.string())
    .describe("Key terms associated with this requirement"),
  pageNumber: z
    .number()
    .describe(
      "Page number where the requirement was found (if available, else 0)",
    ),
});

export const TenderAnalysisLLMSchema = z.object({
  tenderTitle: z.string().describe("Title extracted from the document"),
  requirements: z
    .array(RequirementLLMSchema)
    .describe("List of technical requirements found"),
  summary: z.string().describe("Brief summary of the tender scope"),
});

export type TenderAnalysisLLM = z.infer<typeof TenderAnalysisLLMSchema>;
