import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTender } from "./CreateTender.js";
import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";

describe("CreateTender Use Case", () => {
  let repository: ITenderRepository;
  let useCase: CreateTender;

  beforeEach(() => {
    // Mock the repository using Vitest
    repository = {
      save: vi.fn(),
      findById: vi.fn(),
    };
    useCase = new CreateTender(repository);
  });

  it("should create a new tender analysis with parsed details", async () => {
    // Arrange
    const input = {
      title: "Tender 001",
      fileUrl: "/tmp/tender.pdf",
    };

    // Act
    const result = await useCase.execute(input.title, input.fileUrl);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.tenderTitle).toBe(input.title);
    expect(result.documentUrl).toBe(input.fileUrl);
    expect(result.status).toBe("PENDING"); // Initial status
    expect(result.createdAt).toBeInstanceOf(Date);

    // Verify Repository interaction
    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedTender = (repository.save as any).mock
      .calls[0][0] as TenderAnalysis;
    expect(savedTender.id).toBe(result.id);
  });
});
