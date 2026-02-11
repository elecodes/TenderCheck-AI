import { describe, it, expect, vi, beforeEach } from "vitest";
import { TursoTenderRepository } from "../../../src/infrastructure/repositories/TursoTenderRepository.js";
import { TursoDatabase } from "../../../src/infrastructure/database/TursoDatabase.js";

vi.mock("../../../src/infrastructure/database/TursoDatabase.js", () => ({
  TursoDatabase: {
    getInstance: vi.fn(),
  },
}));

describe("TursoTenderRepository", () => {
  let repository: TursoTenderRepository;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      execute: vi.fn(),
      batch: vi.fn(),
    };
    (TursoDatabase.getInstance as any).mockReturnValue(mockClient);
    repository = new TursoTenderRepository();
  });

  it("should save a tender and its requirements/results", async () => {
    const mockTender = {
      id: "tender1",
      userId: "user1",
      tenderTitle: "Test Tender",
      status: "COMPLETED",
      documentUrl: "http://test.com/doc.pdf",
      createdAt: new Date(),
      requirements: [
        {
          id: "req1",
          text: "Req 1",
          type: "MANDATORY",
          confidence: 0.9,
          keywords: ["k1"],
          source: { pageNumber: 1, snippet: "snippet" },
        },
      ],
      results: [
        {
          requirementId: "req1",
          status: "MET",
          reasoning: "Passed",
        },
      ],
    };

    await repository.save(mockTender as any);

    expect(mockClient.batch).toHaveBeenCalled();
    const stmts = mockClient.batch.mock.calls[0][0];
    expect(stmts.length).toBe(5); // insert tender, delete reqs, insert req, delete results, insert result
    expect(stmts[0].sql).toContain("INSERT OR REPLACE INTO tenders");
    expect(stmts[2].sql).toContain("INSERT INTO requirements");
    expect(stmts[4].sql).toContain("INSERT INTO validation_results");
  });

  it("should find a tender by id", async () => {
    mockClient.execute
      .mockResolvedValueOnce({
        rows: [
          {
            id: "tender1",
            user_id: "user1",
            title: "Test",
            status: "COMPLETED",
            document_url: "url",
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "req1",
            text: "Text",
            type: "MANDATORY",
            confidence: 1,
            keywords: '["k1"]',
            page_number: 1,
            snippet: "snippet",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: "req1", status: "MET", message: "msg" }],
      });

    const result = await repository.findById("tender1");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("tender1");
    expect(result?.requirements).toHaveLength(1);
    expect(result?.results).toHaveLength(1);
  });

  it("should find tenders by user id", async () => {
    mockClient.execute
      .mockResolvedValueOnce({
        rows: [
          {
            id: "tender1",
            user_id: "user1",
            title: "Test",
            status: "COMPLETED",
            document_url: "url",
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "req1",
            text: "Text",
            type: "MANDATORY",
            confidence: 1,
            keywords: '["k1"]',
            page_number: 1,
            snippet: "snippet",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: "req1", status: "MET", message: "msg" }],
      });

    const results = await repository.findByUserId("user1");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("tender1");
  });

  it("should return null if tender not found", async () => {
    mockClient.execute.mockResolvedValueOnce({ rows: [] });
    const result = await repository.findById("unknown");
    expect(result).toBeNull();
  });

  it("should delete a tender", async () => {
    await repository.delete("tender1");
    expect(mockClient.execute).toHaveBeenCalledWith({
      sql: "DELETE FROM tenders WHERE id = ?",
      args: ["tender1"],
    });
  });
});
