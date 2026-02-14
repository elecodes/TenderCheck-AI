import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleLoginButton } from './GoogleLoginButton';
import { vi } from 'vitest';
import * as AuthContext from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('GoogleLoginButton', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.location mock
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
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ 
            user: null, 
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            logOut: vi.fn(),
            requestPasswordReset: vi.fn(),
            updatePassword: vi.fn(),
            startGoogleLogin: vi.fn(),
            updateProfile: vi.fn(),
            error: null,
            clearError: vi.fn(),
            completeGoogleLogin: vi.fn()
        });

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
            user: { uid: '123', email: 'test@example.com' } as any, 
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            logOut: vi.fn(),
            requestPasswordReset: vi.fn(),
            updatePassword: vi.fn(),
            startGoogleLogin: vi.fn(),
            updateProfile: vi.fn(),
            error: null,
            clearError: vi.fn(),
            completeGoogleLogin: vi.fn()
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('redirects to Google OAuth URL on click', async () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ 
            user: null, 
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            logOut: vi.fn(),
            requestPasswordReset: vi.fn(),
            updatePassword: vi.fn(),
            startGoogleLogin: vi.fn(),
            updateProfile: vi.fn(),
            error: null,
            clearError: vi.fn(),
            completeGoogleLogin: vi.fn()
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /continuar con google/i });
        fireEvent.click(button);

        // Check if loading state appears
        expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
        expect(button).toBeDisabled();

        // Verify window.location.href was set correctly
        // The component constructs the URL.
        // http://localhost:3000 -> redirect_uri=http%3A%2F%2Flocalhost%3A3000
        const expectedUrlPart = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test-client-id';
        expect(window.location.href).toContain(expectedUrlPart);
        expect(window.location.href).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000');
    });

    it('uses correct redirect URI in production', () => {
        vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id');
        
        // Mock window.location for production
        delete (window as any).location;
        (window as any).location = {
            ...window.location,
            href: '',
            origin: 'https://app.tendercheck.ai',
            hostname: 'app.tendercheck.ai',
            assign: vi.fn(),
        };

        vi.spyOn(AuthContext, 'useAuth').mockReturnValue({ 
            user: null, 
            loading: false,
            signIn: vi.fn(), 
            signUp: vi.fn(), 
            logOut: vi.fn(), 
            requestPasswordReset: vi.fn(), 
            updatePassword: vi.fn(), 
            startGoogleLogin: vi.fn(), 
            updateProfile: vi.fn(), 
            error: null, 
            clearError: vi.fn(), 
            completeGoogleLogin: vi.fn() 
        });

        render(
            <MemoryRouter>
                <GoogleLoginButton />
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /continuar con google/i });
        fireEvent.click(button);

        // Expected URI: https://app.tendercheck.ai (origin)
        // Encoded: https%3A%2F%2Fapp.tendercheck.ai
        expect(window.location.href).toContain('redirect_uri=https%3A%2F%2Fapp.tendercheck.ai');
    });
});
