import type { ITenderRepository } from "../../domain/repositories/ITenderRepository.js";
import type { TenderAnalysis } from "../../domain/entities/TenderAnalysis.js";
import { TursoDatabase } from "../database/TursoDatabase.js";
import type { Client, InStatement } from "@libsql/client";

export class TursoTenderRepository implements ITenderRepository {
  private db: Client;

  constructor() {
    this.db = TursoDatabase.getInstance();
  }

  async save(tender: TenderAnalysis): Promise<void> {
    const stmts: InStatement[] = [];

    // 1. Insert Tender
    stmts.push({
      sql: `INSERT OR REPLACE INTO tenders (id, user_id, title, status, document_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        tender.id,
        tender.userId,
        tender.tenderTitle,
        tender.status,
        tender.documentUrl || null,
        tender.createdAt instanceof Date
          ? tender.createdAt.toISOString()
          : new Date().toISOString(),
      ],
    });

    // 2. Clear old requirements (for replacement update)
    stmts.push({
      sql: "DELETE FROM requirements WHERE tender_id = ?",
      args: [tender.id],
    });

    // 3. Insert Requirements
    if (tender.requirements) {
      for (const req of tender.requirements) {
        stmts.push({
          sql: `INSERT INTO requirements (id, tender_id, text, type, confidence, keywords, page_number, snippet, embedding)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            req.id,
            tender.id,
            req.text,
            req.type,
            req.confidence,
            JSON.stringify(req.keywords),
            req.source?.pageNumber || null,
            req.source?.snippet || null,
            (req as any).embedding || null,
          ],
        });
      }
    }

    // 4. Clear old results
    stmts.push({
      sql: "DELETE FROM validation_results WHERE tender_id = ?",
      args: [tender.id],
    });

    // 5. Insert Results
    if (tender.results) {
      for (const res of tender.results) {
        stmts.push({
          sql: `INSERT INTO validation_results (id, tender_id, status, message, created_at)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            res.requirementId,
            tender.id,
            res.status,
            res.reasoning,
            new Date().toISOString(),
          ],
        });
      }
    }

    // Execute Batch Transaction
    await this.db.batch(stmts, "write");
  }

  async findById(id: string): Promise<TenderAnalysis | null> {
    const tenderResult = await this.db.execute({
      sql: "SELECT * FROM tenders WHERE id = ?",
      args: [id],
    });

    const tenderRow = tenderResult.rows[0] as any;
    if (!tenderRow) return null;

    const requirementRows = (
      await this.db.execute({
        sql: "SELECT * FROM requirements WHERE tender_id = ?",
        args: [id],
      })
    ).rows as any[];

    const resultRows = (
      await this.db.execute({
        sql: "SELECT * FROM validation_results WHERE tender_id = ?",
        args: [id],
      })
    ).rows as any[];

    return {
      id: tenderRow.id,
      userId: tenderRow.user_id,
      tenderTitle: tenderRow.title,
      status: tenderRow.status,
      documentUrl: tenderRow.document_url,
      createdAt: new Date(tenderRow.created_at),
      updatedAt: new Date(tenderRow.created_at),
      requirements: requirementRows.map((r: any) => ({
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
      results: resultRows.map((r: any) => ({
        requirementId: r.id,
        status: r.status as "MET" | "NOT_MET",
        reasoning: r.message,
        confidence: 0.9,
        evidence: { text: "", pageNumber: 0 },
      })),
    } as TenderAnalysis;
  }

  async findByUserId(userId: string): Promise<TenderAnalysis[]> {
    const tenderRows = (
      await this.db.execute({
        sql: "SELECT * FROM tenders WHERE user_id = ? ORDER BY created_at DESC",
        args: [userId],
      })
    ).rows as any[];

    const result: TenderAnalysis[] = [];

    // Note: This is N+1 problem, but cleaner code for now.
    // Optimization: Fetch all reqs/results in one query using IN clause if performance degrades.
    for (const row of tenderRows) {
      const requirements = (
        await this.db.execute({
          sql: "SELECT * FROM requirements WHERE tender_id = ?",
          args: [row.id],
        })
      ).rows as any[];

      const validationResults = (
        await this.db.execute({
          sql: "SELECT * FROM validation_results WHERE tender_id = ?",
          args: [row.id],
        })
      ).rows as any[];

      result.push({
        id: row.id,
        userId: row.user_id,
        tenderTitle: row.title,
        status: row.status,
        documentUrl: row.document_url,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.created_at),
        requirements: requirements.map((r: any) => ({
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
        results: validationResults.map((rv: any) => ({
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

  async delete(id: string): Promise<void> {
    await this.db.execute({
      sql: "DELETE FROM tenders WHERE id = ?",
      args: [id],
    });
  }
}
