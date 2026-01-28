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

  async findByUserId(userId: string): Promise<TenderAnalysis[]> {
    return Array.from(this.tenders.values()).filter((t) => t.userId === userId);
  }

  async delete(id: string): Promise<void> {
    this.tenders.delete(id);
  }

  async clear(): Promise<void> {
    this.tenders.clear();
  }
}
