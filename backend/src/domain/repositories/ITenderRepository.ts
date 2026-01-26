import type { TenderAnalysis } from "../entities/TenderAnalysis.js";

export interface ITenderRepository {
  save(tender: TenderAnalysis): Promise<void>;
  findById(id: string): Promise<TenderAnalysis | null>;
  findByUserId(userId: string): Promise<TenderAnalysis[]>;
}
