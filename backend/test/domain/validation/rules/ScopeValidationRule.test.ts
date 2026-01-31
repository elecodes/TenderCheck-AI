import { describe, it, expect, beforeEach } from "vitest";
import { ScopeValidationRule } from "../../../../src/domain/validation/rules/ScopeValidationRule.js";
import type { TenderAnalysis } from "../../../../src/domain/entities/TenderAnalysis.js";

describe("ScopeValidationRule", () => {
  let rule: ScopeValidationRule;

  // Minimal mock tender analysis
  const mockAnalysis = (
    title: string,
    reqText: string = "",
  ): TenderAnalysis => ({
    id: "test",
    userId: "u1",
    tenderTitle: title,
    status: "COMPLETED",
    createdAt: new Date(),
    updatedAt: new Date(),
    documentUrl: "",
    requirements: [
      {
        id: "r1",
        text: reqText,
        type: "MANDATORY",
        keywords: [],
        confidence: 1,
        source: { pageNumber: 1, snippet: "" },
      },
    ],
    results: [],
  });

  beforeEach(() => {
    rule = new ScopeValidationRule();
  });

  it("should return MET for a valid software tender", async () => {
    const analysis = mockAnalysis("Desarrollo de Software a medida");
    const result = await rule.validate(analysis);

    expect(result).not.toBeNull();
    expect(result!.status).toBe("MET");
    expect(result!.reasoning).toContain("aligns with digital");
    expect(result!.confidence).toBe(0.85);
  });

  it("should return MET for positive keywords in requirements", async () => {
    const analysis = mockAnalysis(
      "Licitación Generica",
      "El sistema debe estar en la cloud",
    );
    const result = await rule.validate(analysis);

    expect(result!.status).toBe("MET");
  });

  it("should return NOT_MET for negative keywords (e.g. limpieza)", async () => {
    const analysis = mockAnalysis("Servicio de Limpieza de Oficinas");
    const result = await rule.validate(analysis);

    expect(result!.status).toBe("NOT_MET");
    expect(result!.reasoning).toContain("out of scope");
    expect(result!.reasoning).toContain("limpieza");
  });

  it("should return NOT_MET for negative keywords in requirements", async () => {
    const analysis = mockAnalysis(
      "Proyecto de Infraestructura",
      "Mantenimiento vial de carreteras",
    );
    const result = await rule.validate(analysis);

    expect(result!.status).toBe("NOT_MET");
    expect(result!.reasoning).toContain("mantenimiento vial");
  });

  it("should prioritize negative keywords over positive ones", async () => {
    // Contains "software" (positive) but also "construcción" (negative)
    const analysis = mockAnalysis(
      "Construcción de centro de desarrollo de software",
    );
    const result = await rule.validate(analysis);

    expect(result!.status).toBe("NOT_MET");
    expect(result!.reasoning).toContain("construcción");
  });

  it("should return AMBIGUOUS if no relevant keywords found", async () => {
    const analysis = mockAnalysis("Suministro de papel higiénico");
    // "papel" and "higiénico" are not in negative list (yet), nor positive.
    const result = await rule.validate(analysis);

    expect(result!.status).toBe("AMBIGUOUS");
    expect(result!.reasoning).toContain("Could not definitively categorize");
  });
});
