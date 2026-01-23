import { describe, it, expect } from 'vitest';
import { ValidationEngine } from '../src/domain/validation/ValidationEngine.js';
import type { IRule } from '../src/domain/interfaces/IRule.js';
import type { TenderAnalysis } from '../src/domain/entities/TenderAnalysis.js';
import type { ValidationResult } from '../src/domain/entities/ValidationResult.js';

class MockRule implements IRule {
  id = 'mock-rule';
  async validate(analysis: TenderAnalysis): Promise<ValidationResult | null> {
    // Only flag if title is 'Forbidden'
    if (analysis.tenderTitle === 'Forbidden') {
      return { id: 'v1', requirementId: 'r1', passed: false, justification: 'Title forbidden' };
    }
    return null;
  }
}

describe('ValidationEngine', () => {
  it('should execute injected rules (OCP)', async () => {
    const engine = new ValidationEngine([new MockRule()]);
    
    // Test case 1: Violation
    const badAnalysis = { tenderTitle: 'Forbidden' } as TenderAnalysis;
    const results = await engine.validate(badAnalysis);
    expect(results).toHaveLength(1);
    expect(results[0].passed).toBe(false);

    // Test case 2: Pass
    const goodAnalysis = { tenderTitle: 'Allowed' } as TenderAnalysis;
    const results2 = await engine.validate(goodAnalysis);
    expect(results2).toHaveLength(0);
  });
});
