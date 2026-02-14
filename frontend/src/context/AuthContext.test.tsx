import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { vi } from 'vitest';
import * as AuthService from '../services/auth.service';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock auth service
vi.mock('../services/auth.service', () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    loginWithGoogle: vi.fn(),
    requestPasswordReset: vi.fn(),
}));

// Helper component to consume context
const TestComponent = () => {
    const { user, login, register, logout, isLoading, isAuthenticated, requestPasswordReset, loginWithGoogle } = useAuth();
    return (
        <div>
            {isLoading ? 'Loading...' : 'Loaded'}
            {user ? `User: ${user.email}` : 'No User'}
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            <button onClick={() => login('test@example.com', 'password')}>Login</button>
            <button onClick={() => register('Test User', 'test@example.com', 'password')}>Register</button>
            <button onClick={() => logout()}>Logout</button>
            <button onClick={() => requestPasswordReset('test@example.com')}>Reset Password</button>
            <button onClick={() => loginWithGoogle('manual-token')}>Google Login</button>
        </div>
    );
};

describe('AuthContext', () => {
    const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER'
    };

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
        window.location.hash = '';
        vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    });

    it('loads session on mount (getMe success)', async () => {
        (AuthService.getMe as any).mockResolvedValue(mockUser);

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <TestComponent />
                    </AuthProvider>
                </MemoryRouter>
            );
        });

        expect(AuthService.getMe).toHaveBeenCalled();
        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();
        expect(await screen.findByText(/Authenticated/i)).toBeInTheDocument();
    });

    it('handles session load failure (getMe error)', async () => {
        (AuthService.getMe as any).mockRejectedValue(new Error('Unauthorized'));

        await act(async () => {
            render(
                <MemoryRouter>
                    <AuthProvider>
                        <TestComponent />
                    </AuthProvider>
                </MemoryRouter>
            );
        });

        expect(AuthService.getMe).toHaveBeenCalled();
        expect(await screen.findByText(/No User/i)).toBeInTheDocument();
        expect(await screen.findByText(/Not Authenticated/i)).toBeInTheDocument();
    });

    it('handles login success', async () => {
        (AuthService.getMe as any).mockResolvedValue(null);
        (AuthService.login as any).mockResolvedValue({ user: mockUser });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        // Wait for initial load
        await screen.findByText(/Loaded/i);

        const loginBtn = screen.getByText('Login');
        await act(async () => {
            loginBtn.click();
        });

        expect(AuthService.login).toHaveBeenCalledWith('test@example.com', 'password', false);
        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();
    });

    it('handles register success', async () => {
        (AuthService.getMe as any).mockResolvedValue(null);
        (AuthService.register as any).mockResolvedValue({ user: mockUser });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        await screen.findByText(/Loaded/i);

        const registerBtn = screen.getByText('Register');
        await act(async () => {
            registerBtn.click();
        });

        expect(AuthService.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password', undefined);
        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();
    });

    it('handles logout', async () => {
        (AuthService.getMe as any).mockResolvedValue(mockUser);
        (AuthService.logout as any).mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();

        const logoutBtn = screen.getByText('Logout');
        await act(async () => {
            logoutBtn.click();
        });

        expect(AuthService.logout).toHaveBeenCalled();
        expect(await screen.findByText(/No User/i)).toBeInTheDocument();
    });

    it('handles Google login from URL hash', async () => {
        // Redefine window.location to ensure hash is readable
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { ...originalLocation, hash: '#access_token=google-test-token' };

        (AuthService.loginWithGoogle as any).mockResolvedValue({ user: mockUser });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => expect(AuthService.loginWithGoogle).toHaveBeenCalledWith('google-test-token'));
        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

        // Cleanup
        window.location = originalLocation;
    });

    it('handles Google login error', async () => {
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { ...originalLocation, hash: '#access_token=invalid-token' };

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (AuthService.loginWithGoogle as any).mockRejectedValue(new Error('Google Auth Failed'));
        // Make sure getMe resolves to null to verify fallback to No User
        (AuthService.getMe as any).mockResolvedValue(null);

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => expect(AuthService.loginWithGoogle).toHaveBeenCalledWith('invalid-token'));
        expect(await screen.findByText(/No User/i)).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalled();
        
        // Cleanup
        window.location = originalLocation;
    });

    it('handles password reset request', async () => {
        (AuthService.getMe as any).mockResolvedValue(null);
        (AuthService.requestPasswordReset as any).mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        await screen.findByText(/Loaded/i);

        const resetBtn = screen.getByText('Reset Password');
        await act(async () => {
            resetBtn.click();
        });

        expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('handles explicit Google login', async () => {
        (AuthService.getMe as any).mockResolvedValue(null);
        (AuthService.loginWithGoogle as any).mockResolvedValue({ user: mockUser });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </MemoryRouter>
        );

        await screen.findByText(/Loaded/i);

        const googleLoginBtn = screen.getByText('Google Login');
        await act(async () => {
            googleLoginBtn.click();
        });

        expect(AuthService.loginWithGoogle).toHaveBeenCalledWith('manual-token');
        expect(await screen.findByText(new RegExp(`User: ${mockUser.email}`))).toBeInTheDocument();
    });

    it('throws error when useAuth is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
        
        consoleSpy.mockRestore();
    });
});
