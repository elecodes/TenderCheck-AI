import { describe, it, expect } from "vitest";
import { ScopeValidationRule } from "../src/domain/validation/rules/ScopeValidationRule.js";
import type { TenderAnalysis } from "../src/domain/entities/TenderAnalysis.js";

describe("ScopeValidationRule", () => {
  const rule = new ScopeValidationRule();

  it("should pass for explicit software tenders", async () => {
    const analysis = {
      tenderTitle: "Desarrollo de Software a Medida",
      requirements: [{ text: "sistema web" }],
    } as TenderAnalysis;

    const result = await rule.validate(analysis);
    expect(result?.status).toBe("MET");
  });

  it("should fail for construction tenders", async () => {
    const analysis = {
      tenderTitle: "Obra de Construcción de Hospital",
      requirements: [{ text: "cemento y ladrillos" }],
    } as TenderAnalysis;

    const result = await rule.validate(analysis);
    expect(result?.status).toBe("NOT_MET");
    expect(result?.reasoning).toMatch(/construcción|obra/i);
  });

  it("should be ambiguous if no keywords match", async () => {
    const analysis = {
      tenderTitle: "Suministros Generales",
      requirements: [{ text: "papel y boligrafos" }],
    } as TenderAnalysis;

    const result = await rule.validate(analysis);
    expect(result?.status).toBe("AMBIGUOUS");
  });
});
