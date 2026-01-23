import { describe, it, expect } from 'vitest';
import { RequirementsExtractor } from '../src/domain/services/RequirementsExtractor.js';

describe('RequirementsExtractor', () => {
  it('should find mandatory requirements based on keywords', () => {
    const extractor = new RequirementsExtractor();
    const text = 'El sistema deberá soportar carga masiva. Esto es opcional. El usuario must login.';
    
    const results = extractor.extract(text);
    
    expect(results).toHaveLength(2);
    expect(results[0].text).toContain('deberá');
    expect(results[0].type).toBe('MANDATORY');
    expect(results[1].text).toContain('must');
  });

  it('should return empty list if no requirements found', () => {
    const extractor = new RequirementsExtractor();
    const text = 'Hola mundo. Todo bien.';
    
    const results = extractor.extract(text);
    
    expect(results).toHaveLength(0);
  });
});
