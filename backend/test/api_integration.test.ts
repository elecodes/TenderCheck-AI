import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/presentation/server.js';
import { PdfParserAdapter } from '../src/infrastructure/adapters/PdfParserAdapter.js';

describe('Integration: POST /api/tenders/analyze', () => {
    
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should upload a PDF, extract requirements, and return 201', async () => {
    // Spy on the real PdfParserAdapter to return fake text without needing a real PDF
    const parseSpy = vi.spyOn(PdfParserAdapter.prototype, 'parse')
        .mockResolvedValue('El sistema deberá procesar pagos. Must be secure.');

    const response = await request(app)
      .post('/api/tenders/analyze')
      .attach('file', Buffer.from('fake pdf content'), 'test.pdf')
      .field('title', 'Integration Test Tender');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.tenderTitle).toBe('Integration Test Tender');
    expect(response.body.status).toBe('COMPLETED');
    expect(response.body.requirements).toHaveLength(2);
    expect(response.body.requirements[0].text).toContain('deberá');
    expect(parseSpy).toHaveBeenCalled();
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/tenders/analyze')
      .send({ title: 'No File' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.status).toBe('error');
  });
});
