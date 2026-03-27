import * as pdf from "pdf-parse";
import type { IPdfParser } from "../../domain/interfaces/IPdfParser.js";
import { AppError } from "../../domain/errors/AppError.js";
import { safeExecute } from "../utils/safeExecute.js";

export class PdfParserAdapter implements IPdfParser {
  async parse(buffer: Buffer): Promise<string> {
    return safeExecute(async () => {
      try {
        const data = await pdf.default(buffer);
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
        const data = await pdf.default(buffer);

        if (!data?.text) {
          throw new Error("Failed to extract PDF text");
        }

        const fullText = data.text;
        const pageCount = data.numpages || 1;

        if (pageCount <= 1) {
          return [fullText];
        }

        const pageRegex = /--- Page (\d+) ---/gi;
        const pages: string[] = [];
        let lastIndex = 0;
        let match;

        while ((match = pageRegex.exec(fullText)) !== null) {
          if (lastIndex > 0) {
            pages.push(fullText.substring(lastIndex, match.index).trim());
          }
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < fullText.length) {
          pages.push(fullText.substring(lastIndex).trim());
        }

        if (pages.length === 0) {
          const charsPerPage = Math.ceil(fullText.length / pageCount);
          for (let i = 0; i < pageCount; i++) {
            const start = i * charsPerPage;
            const end = Math.min(start + charsPerPage, fullText.length);
            pages.push(fullText.substring(start, end));
          }
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
        const data = await pdf.default(buffer);
        return data?.numpages || 0;
      } catch (error) {
        throw AppError.badRequest(
          `Failed to get PDF page count: ${(error as Error).message}`,
        );
      }
    }, "PDF Page Count Error");
  }
}
