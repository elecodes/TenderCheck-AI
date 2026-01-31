import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AnalysisResults } from './AnalysisResults';
import type { TenderAnalysis } from '../../types';

// Mock export service
vi.mock('../../services/export.service', () => ({
    exportToJSON: vi.fn(),
    exportToPDF: vi.fn(),
}));

import { exportToJSON, exportToPDF } from '../../services/export.service';

const mockAnalysis: TenderAnalysis = {
    id: "123",
    userId: "user-1",
    tenderTitle: "Test Tender Deployment",
    status: "COMPLETED",
    createdAt: new Date(),
    updatedAt: new Date(),
    documentUrl: "url",
    requirements: [
        {
            id: "r1",
            text: "Must use React",
            type: "MANDATORY",
            keywords: ["React"],
            source: { pageNumber: 1, snippet: "snippet" },
            confidence: 0.95
        }
    ],
    results: []
};

describe('AnalysisResults', () => {
    const mockOnReset = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders tender title and metadata', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        expect(screen.getByText('Test Tender Deployment')).toBeInTheDocument();
        expect(screen.getByText('COMPLETADO')).toBeInTheDocument();
        // Check ID slice
        expect(screen.getByText(`ID: ${mockAnalysis.id.slice(0, 8)}`)).toBeInTheDocument();
    });

    it('renders requirements list', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        expect(screen.getByText('Requisitos Extraídos del Pliego')).toBeInTheDocument();
        expect(screen.getByText('Must use React')).toBeInTheDocument();
        expect(screen.getByText('OBLIGATORIO')).toBeInTheDocument();
    });

    it('calls onReset when "Nuevo" button is clicked', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        const resetButton = screen.getByText('Nuevo').closest('button');
        fireEvent.click(resetButton!);
        
        expect(mockOnReset).toHaveBeenCalled();
    });

    it('calls export functions', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        const jsonBtn = screen.getByTitle('Exportar como JSON');
        fireEvent.click(jsonBtn);
        expect(exportToJSON).toHaveBeenCalledWith(mockAnalysis);

        const pdfBtn = screen.getByTitle('Exportar como PDF');
        fireEvent.click(pdfBtn);
        expect(exportToPDF).toHaveBeenCalledWith(mockAnalysis);
    });
});
