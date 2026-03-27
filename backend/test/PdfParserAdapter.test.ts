import { describe, it, expect, vi, beforeEach } from "vitest";
import { PdfParserAdapter } from "../src/infrastructure/adapters/PdfParserAdapter.js";

vi.mock("pdf-parse", () => {
  return {
    PDFParse: class MockPDFParse {
      getText = vi.fn().mockResolvedValue({
        text: "Mock PDF text",
        pages: [
          { text: "Page 1 text", num: 1 },
          { text: "Page 2 text", num: 2 },
        ],
      });
      destroy = vi.fn();
    },
  };
});

describe("PdfParserAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract text from valid buffer", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.parse(Buffer.from("good"));
    expect(result).toBe("Mock PDF text");
  });

  it("should get page count", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.getPageCount(Buffer.from("test"));
    expect(result).toBe(2);
  });

  it("should parse pages", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.parsePages(Buffer.from("test"));
    expect(result).toEqual(["Page 1 text", "Page 2 text"]);
  });
});
