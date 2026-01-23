import { describe, it, expect, vi } from "vitest";
import { OpenAIModelService } from "../src/domain/services/AIModelService.js";

describe("AIModelService", () => {
  it('should throw "not implemented" for analyze', async () => {
    const service = new OpenAIModelService();
    await expect(service.analyze("test text")).rejects.toThrow(
      "Method not implemented.",
    );
  });

  it("should rethrow error in processWithFallback (placeholder logic)", async () => {
    const service = new OpenAIModelService();
    const consoleSpy = vi.spyOn(console, "error");

    await expect(service.processWithFallback("test text")).rejects.toThrow(
      "Method not implemented.",
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Primary model failed, attempting fallback...",
      expect.any(Error),
    );
  });
});
