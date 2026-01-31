import { describe, it, expect, vi, beforeEach } from "vitest";
import { TenderController } from "../../../../src/presentation/controllers/TenderController.js";
import { CreateTender } from "../../../../src/application/use-cases/CreateTender.js";
import { AppError } from "../../../../src/domain/errors/AppError.js";
import type { Request, Response, NextFunction } from "express";

// Mock CreateTender
vi.mock("../../../../src/application/use-cases/CreateTender.js");

describe("TenderController", () => {
  let controller: TenderController;
  let mockCreateTender: CreateTender;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockCreateTender = new CreateTender({} as any, {} as any, {} as any);
    mockCreateTender.execute = vi.fn(); // Explicitly mock the method
    controller = new TenderController(mockCreateTender);

    req = {
      file: {
        buffer: Buffer.from("fake pdf"),
        mimetype: "application/pdf",
        size: 1024,
      } as any,
      body: { title: "Test Tender" },
      user: { userId: "user-1" } as any,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });

  it("should analyze tender successfully and return 201", async () => {
    vi.mocked(mockCreateTender.execute).mockResolvedValue({
        id: "t1",
        tenderTitle: "Test Tender",
        status: "COMPLETED",
        requirements: [], 
        createdAt: new Date(),
        updatedAt: new Date(),
    } as any);

    await controller.analyze(req as Request, res as Response, next);

    expect(mockCreateTender.execute).toHaveBeenCalledWith("user-1", expect.any(Buffer));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("should return 400 if validation fails (wrong mime type)", async () => {
    req.file!.mimetype = "image/png";

    await controller.analyze(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Validation Error" }));
    expect(mockCreateTender.execute).not.toHaveBeenCalled();
  });

  it("should call next with AppError if no file uploaded", async () => {
    req.file = undefined;

    await controller.analyze(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error.message).toBe("No file uploaded");
  });

  it("should call next with AppError if user not authenticated", async () => {
    req.user = undefined;

    await controller.analyze(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it("should pass unexpected errors to next", async () => {
    const error = new Error("Surprise");
    vi.mocked(mockCreateTender.execute).mockRejectedValue(error);

    await controller.analyze(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
