import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GoogleLoginButton } from './GoogleLoginButton';
import { vi } from 'vitest';
import * as AuthContext from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const baseMockAuth = {
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    requestPasswordReset: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
};

describe('GoogleLoginButton', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        delete (window as any).location;
        (window as any).location = {
            ...originalLocation,
            href: '',
            origin: 'http://localhost:3000',
            hostname: 'localhost'
        };
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    it('renders nothing if client ID is missing', () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders button if client ID is present', () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(baseMockAuth);

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        expect(screen.getByText('Continuar con Google')).toBeInTheDocument();
    });

    it('redirects to dashboard if user is already authenticated', () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
            ...baseMockAuth,
            user: { id: '123', email: 'test@example.com', name: 'Test' },
            isAuthenticated: true,
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('redirects to Google OAuth URL with PKCE params on click', async () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(baseMockAuth);

        // Mock crypto.subtle for PKCE
        const mockDigest = vi.fn().mockResolvedValue(new Uint8Array(32).buffer);
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                getRandomValues: (arr: Uint8Array) => { arr.fill(1); return arr; },
                subtle: { digest: mockDigest },
            },
            writable: true,
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /continuar con google/i });
        await act(async () => {
            fireEvent.click(button);
        });

        expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(window.location.href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
        });
        expect(window.location.href).toContain('response_type=code');
        expect(window.location.href).toContain('code_challenge=');
        expect(window.location.href).toContain('code_challenge_method=S256');
        expect(window.location.href).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000');
        expect(sessionStorage.getItem('pkce_code_verifier')).toBeTruthy();
        expect(sessionStorage.getItem('pkce_state')).toBeTruthy();
    });

    it('uses correct redirect URI in production', async () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');

        delete (window as any).location;
        (window as any).location = {
            ...originalLocation,
            href: '',
            origin: 'https://app.tendercheck.ai',
            hostname: 'app.tendercheck.ai',
        };

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(baseMockAuth);

        // Mock crypto for PKCE
        const mockDigest = vi.fn().mockResolvedValue(new Uint8Array(32).buffer);
        Object.defineProperty(globalThis, 'crypto', {
            value: {
                getRandomValues: (arr: Uint8Array) => { arr.fill(1); return arr; },
                subtle: { digest: mockDigest },
            },
            writable: true,
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /continuar con google/i });
        await act(async () => {
            fireEvent.click(button);
        });

        await waitFor(() => {
            expect(window.location.href).toContain('redirect_uri=https%3A%2F%2Fapp.tendercheck.ai');
        });
    });
});
