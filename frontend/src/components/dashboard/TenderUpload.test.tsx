import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TenderUpload } from './TenderUpload';

describe('TenderUpload', () => {
    const mockOnFileSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly with label', () => {
        render(
            <TenderUpload 
                onFileSelect={mockOnFileSelect} 
                selectedFile={null} 
                disabled={false} 
                label="Pliego" 
            />
        );
        expect(screen.getByText('Subir Pliego')).toBeInTheDocument();
        expect(screen.getByText('O arrastra el PDF aquí')).toBeInTheDocument();
    });

    it('displays selected file name', () => {
        const file = new File(['dummy'], 'test-file.pdf', { type: 'application/pdf' });
        render(
            <TenderUpload 
                onFileSelect={mockOnFileSelect} 
                selectedFile={file} 
                disabled={false} 
            />
        );
        expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
        expect(screen.getByText('Documento Listo')).toBeInTheDocument();
        expect(screen.getByText('Cambiar Archivo')).toBeInTheDocument();
    });

    it('calls onFileSelect when a file is uploaded', () => {
        render(
            <TenderUpload 
                onFileSelect={mockOnFileSelect} 
                selectedFile={null} 
                disabled={false} 
                variant="pliego"
            />
        );
        
        // Find input by ID (TenderUpload uses variant as ID suffix)
        // id="file-upload-pliego"
        // Since input is hidden, we use direct DOM selection or label? 
        // Component uses `role="button"` wrapper with click handler document.getElementById...
        // But for testing verify hidden input change event.
        // We can use container.querySelector or getByLabelText if labeled correctly.
        // The input has className "hidden", so it's not visible.
        // Let's use `fireEvent.change` on the hidden input.
        
        // However, standard RTL way involves userEvent or fireEvent on input
        // Since RTL queries ignore hidden, we can query by selector
        const input = document.body.querySelector('#file-upload-pliego') as HTMLInputElement;
        
        const file = new File(['dummy'], 'pliego.pdf', { type: 'application/pdf' });
        fireEvent.change(input!, { target: { files: [file] } });

        expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it('shows alert for non-pdf files', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        render(
            <TenderUpload 
                onFileSelect={mockOnFileSelect} 
                selectedFile={null} 
                disabled={false}
                variant="default"
            />
        );

        const input = document.body.querySelector('#file-upload-default') as HTMLInputElement;
        const file = new File(['dummy'], 'image.png', { type: 'image/png' });
        
        fireEvent.change(input!, { target: { files: [file] } });

        expect(alertMock).toHaveBeenCalledWith('Only PDF files are allowed');
        expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
});
