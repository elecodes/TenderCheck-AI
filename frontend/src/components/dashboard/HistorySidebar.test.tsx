import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistorySidebar } from './HistorySidebar';
import { BrowserRouter } from 'react-router-dom';
import type { TenderAnalysis } from '../../types';

const mockTenders: TenderAnalysis[] = [
  { 
    id: '1', 
    tenderTitle: 'Tender 1', 
    createdAt: '2023-01-01T00:00:00.000Z', 
    status: 'COMPLETED',
    requirements: [],
    summary: '',
    score: 0,
    uploadedFileUrl: ''
  },
  { 
    id: '2', 
    tenderTitle: 'Tender 2', 
    createdAt: '2023-01-02T00:00:00.000Z', 
    status: 'PROCESSING',
    requirements: [],
    summary: '',
    score: 0,
    uploadedFileUrl: ''
  },
];

const mockOnSelect = vi.fn();
const mockOnDelete = vi.fn();

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <HistorySidebar 
        history={mockTenders} 
        onSelect={mockOnSelect} 
        onDelete={mockOnDelete}
        selectedId="1"
      />
    </BrowserRouter>
  );
};

describe('HistorySidebar', () => {
  it('renders sidebar correctly when open', () => {
    renderSidebar(true);
    expect(screen.getByText(/Historial/i)).toBeInTheDocument();
    expect(screen.getByText(/Tender 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Tender 2/i)).toBeInTheDocument();
  });

  it('calls onSelectTender when a tender is clicked', () => {
    renderSidebar();
    fireEvent.click(screen.getByText(/Tender 1/i));
    expect(mockOnSelect).toHaveBeenCalledWith(mockTenders[0]);
  });

  it('calls onDelete when trash icon is clicked and confirmed', () => {
    // Mock confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    renderSidebar();
    
    // Find the delete button for the first item
    const deleteButtons = screen.getAllByTitle(/Eliminar del historial/i);
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith('1');
    
    confirmSpy.mockRestore();
  });
});
