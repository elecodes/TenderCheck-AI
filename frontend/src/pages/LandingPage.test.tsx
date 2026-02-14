import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

// Mock Navbar to isolate LandingPage testing
vi.mock('../components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

describe('LandingPage', () => {
  it('renders the navbar', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the hero title and description', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    
    // Title with line break
    expect(screen.getByText(/Precisión en cada/i)).toBeInTheDocument();
    expect(screen.getByText(/propuesta/i)).toBeInTheDocument();
    
    // Description
    expect(screen.getByText(/Análisis de alta fidelidad para documentos complejos/i)).toBeInTheDocument();
  });

  it('renders the "Subir Licitación" call-to-action link', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const ctaLink = screen.getByRole('link', { name: /subir licitación/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/register');
  });

  it('renders the feature section with correct items', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Extracción Inteligente')).toBeInTheDocument();
    expect(screen.getByText('Análisis Automático de Requisitos')).toBeInTheDocument();

    expect(screen.getByText('Verificación de Cumplimiento')).toBeInTheDocument();
    expect(screen.getByText('Validación contra criterios')).toBeInTheDocument();

    expect(screen.getByText('Análisis Instantáneo')).toBeInTheDocument();
    expect(screen.getByText('Retroalimentación IA en tiempo real')).toBeInTheDocument();
  });

  it('renders the "Nuevo Análisis" card content', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Nuevo Análisis')).toBeInTheDocument();
    expect(screen.getByText(/Sube tus documentos PDF de licitación/i)).toBeInTheDocument();
  });
});
