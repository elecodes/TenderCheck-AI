import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { SqliteDatabase } from "../database/SqliteDatabase.js";
import Database from "better-sqlite3";

export class SqliteTenderRepository implements ITenderRepository {
  private db: Database.Database;

  constructor() {
    this.db = SqliteDatabase.getInstance();
  }

  async save(tender: TenderAnalysis): Promise<void> {
    const db = this.db;

    // Statements must be prepared outside or inside, but let's be explicit
    const insertTender = db.prepare(`
      INSERT OR REPLACE INTO tenders (id, user_id, title, status, document_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertRequirement = db.prepare(`
      INSERT OR REPLACE INTO requirements (id, tender_id, text, type, confidence, keywords, page_number, snippet)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertResult = db.prepare(`
      INSERT OR REPLACE INTO validation_results (id, tender_id, status, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const deleteRequirements = db.prepare(
      "DELETE FROM requirements WHERE tender_id = ?",
    );
    const deleteResults = db.prepare(
      "DELETE FROM validation_results WHERE tender_id = ?",
    );

    const runTransaction = db.transaction((t: TenderAnalysis) => {
      insertTender.run(
        t.id,
        t.userId,
        t.tenderTitle,
        t.status,
        t.documentUrl || null,
        t.createdAt instanceof Date
          ? t.createdAt.toISOString()
          : new Date().toISOString(),
      );

      deleteRequirements.run(t.id);
      if (t.requirements) {
        for (const req of t.requirements) {
          insertRequirement.run(
            req.id,
            t.id,
            req.text,
            req.type,
            req.confidence,
            JSON.stringify(req.keywords),
            req.source?.pageNumber || null,
            req.source?.snippet || null,
          );
        }
      }

      deleteResults.run(t.id);
      if (t.results) {
        for (const res of t.results) {
          insertResult.run(
            res.requirementId,
            t.id,
            res.status,
            res.reasoning,
            new Date().toISOString(),
          );
        }
      }
    });

    runTransaction(tender);
  }

  async findById(id: string): Promise<TenderAnalysis | null> {
    const tenderRow = this.db
      .prepare("SELECT * FROM tenders WHERE id = ?")
      .get(id) as any;

    if (!tenderRow) return null;

    const requirementRows = this.db
      .prepare("SELECT * FROM requirements WHERE tender_id = ?")
      .all(id) as any[];

    const resultRows = this.db
      .prepare("SELECT * FROM validation_results WHERE tender_id = ?")
      .all(id) as any[];

    return {
      id: tenderRow.id,
      userId: tenderRow.user_id,
      tenderTitle: tenderRow.title,
      status: tenderRow.status,
      documentUrl: tenderRow.document_url,
      createdAt: new Date(tenderRow.created_at),
      updatedAt: new Date(tenderRow.created_at),
      requirements: requirementRows.map((r) => ({
        id: r.id,
        text: r.text,
        type: r.type,
        confidence: r.confidence,
        keywords: r.keywords ? JSON.parse(r.keywords) : [],
        source: {
          pageNumber: r.page_number,
          snippet: r.snippet,
        },
      })),
      results: resultRows.map((r) => ({
        requirementId: r.id,
        status: r.status as "MET" | "NOT_MET",
        reasoning: r.message,
        confidence: 0.9,
        evidence: { text: "", pageNumber: 0 },
      })),
    } as TenderAnalysis;
  }

  async findByUserId(userId: string): Promise<TenderAnalysis[]> {
    const tenderRows = this.db
      .prepare(
        "SELECT * FROM tenders WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(userId) as any[];

    const result: TenderAnalysis[] = [];

    for (const row of tenderRows) {
      const requirements = this.db
        .prepare("SELECT * FROM requirements WHERE tender_id = ?")
        .all(row.id) as any[];

      const validationResults = this.db
        .prepare("SELECT * FROM validation_results WHERE tender_id = ?")
        .all(row.id) as any[];

      result.push({
        id: row.id,
        userId: row.user_id,
        tenderTitle: row.title,
        status: row.status,
        documentUrl: row.document_url,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.created_at),
        requirements: requirements.map((r) => ({
          id: r.id,
          text: r.text,
          type: r.type,
          confidence: r.confidence,
          keywords: r.keywords ? JSON.parse(r.keywords) : [],
          source: {
            pageNumber: r.page_number,
            snippet: r.snippet,
          },
        })),
        results: validationResults.map((rv) => ({
          requirementId: rv.id,
          status: rv.status as "MET" | "NOT_MET",
          reasoning: rv.message,
          confidence: 0.9,
          evidence: { text: "", pageNumber: 0 },
        })),
      } as TenderAnalysis);
    }

    return result;
  }
}
