import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ValidationRuleFactory } from "../../../src/domain/validation/ValidationRuleFactory";
import { TursoDatabase } from "../../../src/infrastructure/database/TursoDatabase";
import { ScopeValidationRule } from "../../../src/domain/validation/rules/ScopeValidationRule";

// Mock TursoDatabase
vi.mock("../../../src/infrastructure/database/TursoDatabase");

describe("ValidationRuleFactory", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock getInstance implementation
    (TursoDatabase.getInstance as any).mockReturnValue({
      execute: mockExecute,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return rules based on industry presets when found", async () => {
    const mockPositive = JSON.stringify(["ai", "ml"]);
    const mockNegative = JSON.stringify(["hardware"]);

    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          positive_keywords: mockPositive,
          negative_keywords: mockNegative,
        },
      ],
    });

    const rules = await ValidationRuleFactory.createRules("Tech");

    expect(mockExecute).toHaveBeenCalledWith({
      sql: expect.stringContaining("SELECT positive_keywords"),
      args: ["Tech"],
    });

    expect(rules).toHaveLength(1);
    expect(rules[0]).toBeInstanceOf(ScopeValidationRule);
    // access private property for testing if needed or check behavior
    // For now just instance check is good enough as unit test for factory
  });

  it('should use default industry "Digital Services" if name not provided', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }); // Simulate not found to trigger fallback or empty rows

    await ValidationRuleFactory.createRules();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        args: ["Digital Services"],
      }),
    );
  });

  it("should return default rules if industry is not found in DB (empty rows)", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const rules = await ValidationRuleFactory.createRules("UnknownIndustry");

    expect(rules).toHaveLength(1);
    expect(rules[0]).toBeInstanceOf(ScopeValidationRule);
    // You could inspect the rule content to verify it matches the fallback hardcoded list
    // verification of specific fallback content is less critical than code path coverage here
  });

  it("should return default rules if DB throws an error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockExecute.mockRejectedValueOnce(new Error("DB Connection Failed"));

    const rules = await ValidationRuleFactory.createRules("Tech");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching industry presets:",
      expect.any(Error),
    );
    expect(rules).toHaveLength(1); // Should still return partial/fallback rules
    expect(rules[0]).toBeInstanceOf(ScopeValidationRule);
  });

  it("should handle malformed JSON in DB gracefully", async () => {
    // Logic for malformed JSON isn't explicitly in the catch block but in JSON.parse which throws
    // The current implementation uses || "[]" so it handles null/empty strings but JSON.parse might still throw if string is invalid
    // Let's see if we can trigger the catch block via JSON.parse error

    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          positive_keywords: "{invalid-json",
          negative_keywords: "[]",
        },
      ],
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const rules = await ValidationRuleFactory.createRules("Tech");

    // JSON.parse throws, caught by try/catch
    expect(consoleSpy).toHaveBeenCalled();
    expect(rules).toHaveLength(1); // Returns fallback
  });
});
