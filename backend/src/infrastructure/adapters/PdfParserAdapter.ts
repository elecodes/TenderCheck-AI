import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

import type { IPdfParser } from '../../domain/interfaces/IPdfParser.js';
import { AppError } from '../../domain/errors/AppError.js';
import { safeExecute } from '../utils/safeExecute.js';

export class PdfParserAdapter implements IPdfParser {
  async parse(buffer: Buffer): Promise<string> {
    return safeExecute(async () => {
      try {
        const data = await pdf(buffer);
        if (!data || !data.text) {
          throw new Error('PDF extraction returned empty result');
        }
        return data.text;
      } catch (error) {
        throw AppError.badRequest(`Failed to parse PDF: ${(error as Error).message}`);
      }
    }, 'PDF Parsing Error');
  }
}
