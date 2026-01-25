import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";

export class InMemoryTenderRepository implements ITenderRepository {
  private tenders: Map<string, TenderAnalysis> = new Map();

  async save(tender: TenderAnalysis): Promise<void> {
    this.tenders.set(tender.id, tender);
  }

  async findById(id: string): Promise<TenderAnalysis | null> {
    return this.tenders.get(id) || null;
  }
}
