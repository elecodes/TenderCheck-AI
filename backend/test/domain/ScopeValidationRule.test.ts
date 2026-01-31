import { describe, it, expect } from "vitest";
import { ScopeValidationRule } from "../../src/domain/validation/rules/ScopeValidationRule.js";
import { TenderAnalysis } from "../../src/domain/entities/TenderAnalysis.js";

describe("ScopeValidationRule", () => {
  const rule = new ScopeValidationRule();

  it("should return NOT_MET if a negative keyword is present", async () => {
    const analysis: TenderAnalysis = {
      id: "uuid-123",
      userId: "user-123",
      tenderTitle: "Mantenimiento Vial en Madrid",
      documentUrl: "hash",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await rule.validate(analysis);

    expect(result).not.toBeNull();
    expect(result?.status).toBe("NOT_MET");
    expect(result?.reasoning).toContain("mantenimiento vial");
  });

  it("should return AMBIGUOUS if no positive keywords are found (and no negative)", async () => {
    const analysis: TenderAnalysis = {
      id: "uuid-123",
      userId: "user-123",
      tenderTitle: "Suministro de Papel",
      documentUrl: "hash",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await rule.validate(analysis);

    expect(result).not.toBeNull();
    expect(result?.status).toBe("AMBIGUOUS");
  });

  it("should return MET if positive keywords are present", async () => {
    const analysis: TenderAnalysis = {
      id: "uuid-123",
      userId: "user-123",
      tenderTitle: "Desarrollo de Software a Medida",
      documentUrl: "hash",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await rule.validate(analysis);

    expect(result).not.toBeNull();
    expect(result?.status).toBe("MET");
  });

  it("should check requirements text as well", async () => {
    const analysis: TenderAnalysis = {
      id: "uuid-123",
      userId: "user-123",
      tenderTitle: "Contrato Genérico",
      documentUrl: "hash",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      requirements: [
        {
            id: "req-1",
            text: "Se requiere una plataforma digital.",
            isMandatory: true,
            pageNumber: 1
        }
      ]
    };

    const result = await rule.validate(analysis);

    expect(result).not.toBeNull();
    expect(result?.status).toBe("MET"); // Because "plataforma" or "digital" is in requirements
  });
});
