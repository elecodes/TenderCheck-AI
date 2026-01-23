import { randomUUID } from "crypto";
import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";

export class CreateTender {
  constructor(private readonly tenderRepository: ITenderRepository) {}

  async execute(
    tenderTitle: string,
    documentUrl: string,
  ): Promise<TenderAnalysis> {
    const newTender: TenderAnalysis = {
      id: randomUUID(),
      tenderTitle,
      documentUrl,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
      requirements: [],
      results: [],
    };

    await this.tenderRepository.save(newTender);
    return newTender;
  }
}
