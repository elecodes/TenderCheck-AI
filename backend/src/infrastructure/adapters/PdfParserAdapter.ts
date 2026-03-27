import pdf from "pdf-parse";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import { AppError } from "../../domain/errors/AppError.js";
import { safeExecute } from "../utils/safeExecute.js";

export class PdfParserAdapter implements IPdfParser {
  async parse(buffer: Buffer): Promise<string> {
    return safeExecute(async () => {
      try {
        const data = await pdf(buffer);
        if (!data || !data.text) {
          throw new Error("PDF extraction returned empty result");
        }
        return data.text;
      } catch (error) {
        throw AppError.badRequest(
          `Failed to parse PDF: ${(error as Error).message}`,
        );
      }
    }, "PDF Parsing Error");
  }

  async parsePages(buffer: Buffer): Promise<string[]> {
    return safeExecute(async () => {
      try {
        const data = await pdf(buffer);
        
        if (!data?.pages || data.pages.length === 0) {
          const fullText = data?.text || "";
          if (fullText) {
            return [fullText];
          }
          throw new Error("Failed to extract page information");
        }

        const pages: string[] = [];
        for (const page of data.pages) {
          pages.push(page.text || "");
        }

        return pages;
      } catch (error) {
        throw AppError.badRequest(
          `Failed to parse PDF pages: ${(error as Error).message}`,
        );
      }
    }, "PDF Page Parsing Error");
  }

  async getPageCount(buffer: Buffer): Promise<number> {
    return safeExecute(async () => {
      try {
        const data = await pdf(buffer);
        return data?.numpages || 0;
      } catch (error) {
        throw AppError.badRequest(
          `Failed to get PDF page count: ${(error as Error).message}`,
        );
      }
    }, "PDF Page Count Error");
  }
}
