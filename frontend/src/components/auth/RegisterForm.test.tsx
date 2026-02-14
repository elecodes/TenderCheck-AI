import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from './RegisterForm';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Mock AuthContext
const mockRegister = vi.fn();

const renderRegisterForm = () => {
  return render(
    <AuthContext.Provider value={{ 
      isAuthenticated: false, 
      user: null, 
      login: vi.fn(), 
      logout: vi.fn(), 
      register: mockRegister, 
      loginWithGoogle: vi.fn(),
      requestPasswordReset: vi.fn(),
      isLoading: false
    }}>
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form correctly', () => {
    renderRegisterForm();
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa \(Opcional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it('handles user input', () => {
    renderRegisterForm();
    const nameInput = screen.getByLabelText(/Nombre Completo/i);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const companyInput = screen.getByLabelText(/Empresa \(Opcional\)/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(companyInput, { target: { value: 'Acme Corp' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(companyInput).toHaveValue('Acme Corp');
    expect(passwordInput).toHaveValue('Password123!');
  });

  it('submits form with valid data', async () => {
    renderRegisterForm();
    const nameInput = screen.getByLabelText(/Nombre Completo/i);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const companyInput = screen.getByLabelText(/Empresa \(Opcional\)/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(companyInput, { target: { value: 'Acme Corp' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'Password123!', 'Acme Corp');
    });
  });

  it('shows validation error for short password', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
