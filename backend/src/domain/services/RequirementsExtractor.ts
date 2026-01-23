import { randomUUID } from 'crypto';
import type { Requirement } from '../entities/Requirement.js';

export class RequirementsExtractor {
  extract(text: string): Requirement[] {
    // Simple heuristic: split by sentences and look for keywords
    // In production, this would use NLP or the AIModelService
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const keywords = ['deberá', 'must', 'requiere', 'obligatorio', 'shall'];
    
    const found: Requirement[] = [];

    // Assuming page 1 for simple extraction now
    let pageCounter = 1;

    for (const sentence of sentences) {
      if (keywords.some(kw => sentence.toLowerCase().includes(kw))) {
        found.push({
          id: randomUUID(),
          text: sentence,
          type: 'MANDATORY',
          source: {
            pageNumber: pageCounter,
            snippet: sentence.substring(0, 100)
          },
          keywords: keywords.filter(k => sentence.toLowerCase().includes(k)),
          confidence: 0.8
        });
      }
    }

    return found;
  }
}
