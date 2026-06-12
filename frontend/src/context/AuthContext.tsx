import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Handle PKCE callback (code from Google)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const returnedState = params.get('state');
      const storedState = sessionStorage.getItem('pkce_state');

      if (code && returnedState && returnedState === storedState) {
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');

        if (codeVerifier) {
          try {
            setIsLoading(true);
            const api = await import('../services/auth.service');
            const response = await api.googleCallback(code, codeVerifier);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
            console.log('✅ [Auth] Google PKCE Auth Success');
            window.history.replaceState(null, '', window.location.pathname);
            setIsLoading(false);
            navigate('/dashboard');
            return;
          } catch (error) {
            console.error('❌ [Auth] Google PKCE Auth Error:', error);
            setIsLoading(false);
          }
        }
      }

      // Clear leftover PKCE session storage
      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('pkce_state');

      // 2. Normal Session Check
      try {
         const user = await getMe();
         if (user) {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
         } else {
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
         }
      } catch {
         localStorage.removeItem('user');
         localStorage.removeItem('auth_token');
      } finally {
         setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await apiLogin(email, password, rememberMe);

    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const response = await apiRegister(name, email, password, company);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const requestPasswordReset = async (email: string) => {
    await import('../services/auth.service').then(service => service.requestPasswordReset(email));
  };

  const logout = () => {
    apiLogout();
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      requestPasswordReset,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
