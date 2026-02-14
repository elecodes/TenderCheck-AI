import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the components rendered by routes
vi.mock('./pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>
}));

vi.mock('./components/dashboard/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>
}));

vi.mock('./components/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>
}));

vi.mock('./components/auth/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form</div>
}));

vi.mock('./components/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">Forgot Password Form</div>
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('./context/AuthContext', async () => {
    const actual = await vi.importActual('./context/AuthContext');
    return {
        ...actual,
        AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useAuth: () => mockUseAuth()
    };
});

describe('App Routing', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });
  });

  it('renders LandingPage at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders LoginForm at /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders RegisterForm at /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('renders ForgotPasswordForm at /forgot-password', () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /dashboard to /login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders Dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Test User', email: 'test@example.com' }
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('shows loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue({
          isAuthenticated: false,
          isLoading: true,
          user: null
      });

      render(
          <MemoryRouter initialEntries={['/dashboard']}>
              <App />
          </MemoryRouter>
      );
      
      // ProtectedRoute shows a spinner/loading state, verify it doesn't show dashboard or login
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      // You might want to test specifically for the spinner if you add a test-id to it in ProtectedRoute
  });
});
