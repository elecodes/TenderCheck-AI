import { describe, it, expect, vi, beforeEach } from "vitest";
import { PdfParserAdapter } from "../src/infrastructure/adapters/PdfParserAdapter.js";

vi.mock("pdf-parse", () => {
  return {
    default: vi.fn().mockResolvedValue({
      text: "--- Page 1 ---\nPage 1 content\n--- Page 2 ---\nPage 2 content",
      numpages: 2,
      pages: [
        { text: "Page 1 content", num: 1 },
        { text: "Page 2 content", num: 2 },
      ],
    }),
  };
});

describe("PdfParserAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract text from valid buffer", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.parse(Buffer.from("good"));
    expect(result).toBe(
      "--- Page 1 ---\nPage 1 content\n--- Page 2 ---\nPage 2 content",
    );
  });

  it("should get page count", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.getPageCount(Buffer.from("test"));
    expect(result).toBe(2);
  });

  it("should parse pages", async () => {
    const adapter = new PdfParserAdapter();
    const result = await adapter.parsePages(Buffer.from("test"));
    expect(result.length).toBe(2);
    expect(result[0]).toContain("Page 1");
    expect(result[1]).toContain("Page 2");
  });
});
