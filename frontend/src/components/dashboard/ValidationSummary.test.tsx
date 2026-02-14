import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ValidationSummary } from './ValidationSummary';
import { TenderAnalysis, ValidationResult } from '../../types';

const mockAnalysis: TenderAnalysis = {
  id: '123',
  tenderTitle: 'Test Tender',
  createdAt: new Date().toISOString(),
  status: 'COMPLETED',
  requirements: [
    { id: '1', text: 'Req 1', type: 'MANDATORY', keywords: [], source: { pageNumber: 1, paragraphNumber: 1, textSnippet: '' } },
    { id: '2', text: 'Req 2', type: 'OPTIONAL', keywords: [], source: { pageNumber: 2, paragraphNumber: 2, textSnippet: '' } },
  ],
  summary: 'Test summary',
  score: 50,
  uploadedFileUrl: '',
};

const mockResults: ValidationResult[] = [
  { requirementId: '1', status: 'MET', evidence: '', confidence: 0.9 },
  { requirementId: '2', status: 'NOT_MET', evidence: '', confidence: 0.8 },
];

describe('ValidationSummary', () => {
  it('renders validation summary correctly', () => {
    render(<ValidationSummary analysis={mockAnalysis} results={mockResults} />);
    
    expect(screen.getByText(/Puntuación/i)).toBeInTheDocument();
    expect(screen.getByText(/Cumplimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/Obligatorios/i)).toBeInTheDocument();
    expect(screen.getByText(/Opcionales/i)).toBeInTheDocument();
  });

  it('displays correct stats', () => {
    render(<ValidationSummary analysis={mockAnalysis} results={mockResults} />);

    // Mandatory: 1 total, 1 met
    expect(screen.getByText('1')).toBeInTheDocument(); 
    // Optional: 1 total, 0 met (so 0 will be displayed for met)
    // Note: The score logic calculation: 1 met / 2 total = 50%
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
