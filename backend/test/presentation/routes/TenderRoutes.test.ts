import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { tenderRouter } from "../../../src/presentation/routes/TenderRoutes.js";
import { AppError } from "../../../src/domain/errors/AppError.js";

// Hoisted mocks to be available inside vi.mock factory
const {
  mockCreateTenderExecute,
  mockValidateProposalExecute,
  mockRepoFindByUserId,
  mockRepoFindById,
  mockRepoDelete,
} = vi.hoisted(() => ({
  mockCreateTenderExecute: vi.fn(),
  mockValidateProposalExecute: vi.fn(),
  mockRepoFindByUserId: vi.fn(),
  mockRepoFindById: vi.fn(),
  mockRepoDelete: vi.fn(),
}));

vi.mock("../../../src/application/use-cases/CreateTender.js", () => ({
  CreateTender: class {
    execute = mockCreateTenderExecute;
  },
}));

vi.mock("../../../src/application/use-cases/ValidateProposal.js", () => ({
  ValidateProposal: class {
    execute = mockValidateProposalExecute;
  },
}));

vi.mock(
  "../../../src/infrastructure/repositories/TursoTenderRepository.js",
  () => ({
    TursoTenderRepository: class {
      findByUserId = mockRepoFindByUserId;
      findById = mockRepoFindById;
      delete = mockRepoDelete;
    },
  }),
);

vi.mock("../../../src/infrastructure/adapters/PdfParserAdapter.js", () => ({
  PdfParserAdapter: class {},
}));

vi.mock("../../../src/infrastructure/services/GeminiGenkitService.js", () => ({
  GeminiGenkitService: class {},
}));

vi.mock("../../../src/infrastructure/services/VectorSearchService.js", () => ({
  VectorSearchService: class {},
}));

// Mock Auth Middleware to inject user
vi.mock("../../../src/infrastructure/middleware/authMiddleware.js", () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { userId: "test-user-id" };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use("/api/tenders", tenderRouter);

// Error handling middleware for testing
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

describe("TenderRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/tenders/analyze", () => {
    it("should analyze uploaded PDF successfully", async () => {
      mockCreateTenderExecute.mockResolvedValue({
        id: "tender-123",
        status: "COMPLETED",
      });

      const res = await request(app)
        .post("/api/tenders/analyze")
        .attach("file", Buffer.from("test pdf"), "test.pdf");

      expect(res.status).toBe(201);
      expect(res.body.id).toBe("tender-123");
      expect(mockCreateTenderExecute).toHaveBeenCalledWith(
        "test-user-id",
        expect.any(Buffer),
        undefined,
      );
    });

    it("should reject if no file is uploaded", async () => {
      const res = await request(app).post("/api/tenders/analyze");

      expect(res.status).toBe(400); // Multer might handle this or our check
    });

    it("should handle invalid file type", async () => {
      const res = await request(app)
        .post("/api/tenders/analyze")
        .attach("file", Buffer.from("test text"), "test.txt");

      expect(res.status).toBe(500); // Multer error usually 500 unless handled specifically
      expect(res.body.error).toContain("Invalid file type");
    });
  });

  describe("POST /api/tenders/:id/validate-proposal", () => {
    it("should validate proposal successfully", async () => {
      mockValidateProposalExecute.mockResolvedValue([]);

      const res = await request(app)
        .post("/api/tenders/tender-123/validate-proposal")
        .attach("file", Buffer.from("proposal pdf"), "proposal.pdf");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(mockValidateProposalExecute).toHaveBeenCalledWith(
        "tender-123",
        expect.any(Buffer),
      );
    });
  });

  describe("GET /api/tenders", () => {
    it("should return user tender history", async () => {
      mockRepoFindByUserId.mockResolvedValue([{ id: "t1", title: "Tender 1" }]);

      const res = await request(app).get("/api/tenders");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(mockRepoFindByUserId).toHaveBeenCalledWith("test-user-id");
    });
  });

  describe("DELETE /api/tenders/:id", () => {
    it("should delete user tender", async () => {
      mockRepoFindById.mockResolvedValue({ userId: "test-user-id" });

      const res = await request(app).delete("/api/tenders/tender-123");

      expect(res.status).toBe(200);
      expect(mockRepoDelete).toHaveBeenCalledWith("tender-123");
    });

    it("should return 404 if tender not found", async () => {
      mockRepoFindById.mockResolvedValue(null);

      const res = await request(app).delete("/api/tenders/tender-123");

      expect(res.status).toBe(404);
    });

    it("should return 403 if tender belongs to another user", async () => {
      mockRepoFindById.mockResolvedValue({ userId: "other-user" });

      const res = await request(app).delete("/api/tenders/tender-123");

      expect(res.status).toBe(403);
    });
  });
});
