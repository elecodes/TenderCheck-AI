import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// Mock AuthContext
const mockLogin = vi.fn();
const mockLogout = vi.fn();

const renderLoginForm = (isAuthenticated = false, user = null) => {
  return render(
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login: mockLogin, 
      logout: mockLogout, 
      register: vi.fn(), 
      loginWithGoogle: vi.fn(),
      requestPasswordReset: vi.fn(),
      isLoading: false
    }}>
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
  });

  it('handles user input', () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('Password123!');
  });

  it('submits form with valid data', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!', false);
    });
  });

  it('shows validation error for invalid email', async () => {
    renderLoginForm();
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const submitButton = screen.getByRole('button', { name: /iniciar/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput); // Trigger validation
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Por favor introduce un email válido/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows "Welcome Back" screen when authenticated', () => {
    const user = { name: 'John Doe', email: 'john@example.com', id: '1', role: 'USER' };
    // @ts-ignore
    renderLoginForm(true, user);

    expect(screen.getByText(/Hola de nuevo, John/i)).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Continuar al Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Cambiar de usuario/i)).toBeInTheDocument();
  });

  it('calls logout when "Cambiar de usuario" is clicked', () => {
    const user = { name: 'John Doe', email: 'john@example.com', id: '1', role: 'USER' };
    // @ts-ignore
    renderLoginForm(true, user);

    const logoutButton = screen.getByText(/Cambiar de usuario/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});
