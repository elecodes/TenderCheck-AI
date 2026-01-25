import { describe, it, expect, vi } from "vitest";
import { PdfParserAdapter } from "../src/infrastructure/adapters/PdfParserAdapter.js";

describe("PdfParserAdapter", () => {
  it("should extract text from valid buffer", async () => {
    const mockParser = vi
      .fn()
      .mockResolvedValue({ text: "Extracted PDF Content" });
    const adapter = new PdfParserAdapter(mockParser);

    const result = await adapter.parse(Buffer.from("good"));

    expect(result).toBe("Extracted PDF Content");
    expect(mockParser).toHaveBeenCalled();
  });

  it("should throw AppError on failure", async () => {
    const mockParser = vi.fn().mockRejectedValue(new Error("Corrupt PDF"));
    const adapter = new PdfParserAdapter(mockParser);

    await expect(adapter.parse(Buffer.from("bad"))).rejects.toThrow(
      "Failed to parse PDF",
    );
  });
});
