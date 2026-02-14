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
        
        expect(screen.getByText('Requisitos Detectados')).toBeInTheDocument();
        expect(screen.getByText('Must use React')).toBeInTheDocument();
        expect(screen.getByText('OBLIGATORIO')).toBeInTheDocument();
    });

    it('calls onReset when "Nuevo" button is clicked', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        const resetButton = screen.getByText('Nuevo').closest('button');
        fireEvent.click(resetButton!);
        
        expect(mockOnReset).toHaveBeenCalled();
    });

    it('renders all requirement types correctly', () => {
        const mixedAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            requirements: [
                { ...mockAnalysis.requirements[0], type: 'OPTIONAL', text: 'Optional Req' },
                { ...mockAnalysis.requirements[0], type: 'TECHNICAL', text: 'Technical Req' },
                { ...mockAnalysis.requirements[0], type: 'ADMINISTRATIVE', text: 'Finc Req' },
                { ...mockAnalysis.requirements[0], type: 'LEGAL', text: 'Legal Req' },
                { ...mockAnalysis.requirements[0], type: 'FINANCIAL', text: 'Financial Req' },
                { ...mockAnalysis.requirements[0], type: 'UNKNOWN' as any, text: 'Unknown Req' },
            ]
        };
        render(<AnalysisResults analysis={mixedAnalysis} onReset={mockOnReset} />);
        
        expect(screen.getByText('OPCIONAL')).toBeInTheDocument();
        expect(screen.getByText('TÉCNICO')).toBeInTheDocument();
        expect(screen.getByText('ADMINISTRATIVO')).toBeInTheDocument();
        expect(screen.getByText('LEGAL')).toBeInTheDocument();
        expect(screen.getByText('FINANCIERO')).toBeInTheDocument();
        expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    });

    it('renders empty state when no requirements found', () => {
        const emptyAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            requirements: []
        };
        render(<AnalysisResults analysis={emptyAnalysis} onReset={mockOnReset} />);
        
        expect(screen.getByText(/No se han detectado requisitos/i)).toBeInTheDocument();
    });

    it('renders requirement without page number', () => {
        const noPageAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            requirements: [
                { ...mockAnalysis.requirements[0], source: { ...mockAnalysis.requirements[0].source, pageNumber: 0 } }
            ]
        };
        render(<AnalysisResults analysis={noPageAnalysis} onReset={mockOnReset} />);
        
        expect(screen.queryByText(/Pág\./)).not.toBeInTheDocument();
    });

    it('calls export functions with validation results if provided', () => {
        const mockValidation = [{
            requirementId: 'r1',
            status: 'COMPLIANT' as const,
            complianceScore: 1,
            proposalText: 'text',
            explanation: 'explanation'
        }];

        render(
            <AnalysisResults 
                analysis={mockAnalysis} 
                validationResults={mockValidation} 
                onReset={mockOnReset} 
            />
        );
        
        const jsonBtn = screen.getByTitle('Exportar como JSON');
        fireEvent.click(jsonBtn);
        
        expect(exportToJSON).toHaveBeenCalledWith({
            ...mockAnalysis,
            results: mockValidation
        });
    });

    it('calls export functions', () => {
        render(<AnalysisResults analysis={mockAnalysis} onReset={mockOnReset} />);
        
        const jsonBtn = screen.getByTitle('Exportar como JSON');
        fireEvent.click(jsonBtn);
        expect(exportToJSON).toHaveBeenCalledWith({
            ...mockAnalysis,
            results: []
        });

        const pdfBtn = screen.getByTitle('Exportar como PDF');
        fireEvent.click(pdfBtn);
        expect(exportToPDF).toHaveBeenCalledWith({
            ...mockAnalysis,
            results: []
        });
    });

    it('renders long title with smaller font', () => {
        const longTitleAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            tenderTitle: 'A very long tender title that exceeds eighty characters to trigger the smaller font size class in the header component for better responsiveness and layout handling.'
        };
        render(<AnalysisResults analysis={longTitleAnalysis} onReset={mockOnReset} />);
        
        const titleElement = screen.getByText(longTitleAnalysis.tenderTitle);
        expect(titleElement).toHaveClass('text-xl md:text-2xl');
    });

    it('renders pending status with correct styling', () => {
        const pendingAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            status: 'PENDING' as any
        };
        render(<AnalysisResults analysis={pendingAnalysis} onReset={mockOnReset} />);
        
        const statusElement = screen.getByText('PENDING');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement.className).toContain('text-amber-600');
    });

    it('handles undefined analysis results in export', () => {
        const noResultsAnalysis: TenderAnalysis = {
            ...mockAnalysis,
            results: undefined as any
        };
        render(<AnalysisResults analysis={noResultsAnalysis} onReset={mockOnReset} />);
        
        const jsonBtn = screen.getByTitle('Exportar como JSON');
        fireEvent.click(jsonBtn);
        
        expect(exportToJSON).toHaveBeenCalledWith({
            ...noResultsAnalysis,
            results: []
        });
    });
});
