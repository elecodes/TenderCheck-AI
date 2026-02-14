import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Mock AuthContext
const mockRequestPasswordReset = vi.fn();

const renderForgotPasswordForm = () => {
  return render(
    <AuthContext.Provider value={{ 
      isAuthenticated: false, 
      user: null, 
      login: vi.fn(), 
      logout: vi.fn(), 
      register: vi.fn(), 
      loginWithGoogle: vi.fn(),
      requestPasswordReset: mockRequestPasswordReset,
      isLoading: false
    }}>
      <BrowserRouter>
        <ForgotPasswordForm />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    renderForgotPasswordForm();
    expect(screen.getByText(/Recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar Instrucciones/i })).toBeInTheDocument();
  });

  it('submits form with valid email', async () => {
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Instrucciones/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    await waitFor(() => {
      // The component calls useAuth().requestPasswordReset
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows validation error for invalid email', async () => {
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const submitButton = screen.getByRole('button', { name: /Enviar Instrucciones/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Por favor introduce un email válido/i)).toBeInTheDocument();
    });
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });
});
