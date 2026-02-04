import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Session Check & Google Redirect Handler
  useEffect(() => {
    const initAuth = async () => {
       // 1. Handle Google Redirect Hash (before session check)
       const hash = window.location.hash;
       if (hash && hash.includes('access_token')) {
           console.log('🔍 GLOBAL: Google Auth Hash Detected');
           const params = new URLSearchParams(hash.substring(1));
           const token = params.get('access_token');
           if (token) {
               try {
                   setIsLoading(true);
                   const api = await import('../services/auth.service');
                   const response = await api.loginWithGoogle(token);
                   localStorage.setItem('user', JSON.stringify(response.user));
                   setUser(response.user);
                   console.log('🎉 GLOBAL: Google Auth Success');
                   window.history.replaceState(null, '', window.location.pathname);
                   window.location.href = '/dashboard';
                   return; // Exit and let the redirect handle it
               } catch (error) {
                   console.error('❌ GLOBAL: Google Auth Error:', error);
               }
           }
       }

       // 2. Normal Session Check
       try {
          const user = await getMe();
          if (user) {
             setUser(user);
             localStorage.setItem('user', JSON.stringify(user));
          } else {
             localStorage.removeItem('user');
          }
       } catch {
          localStorage.removeItem('user');
       } finally {
          setIsLoading(false);
       }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await apiLogin(email, password, rememberMe);
    // Token is set by Cookie
    
    // Remember Me logic could be handled here by maybe saving email to local storage
    // But persistence is now controlled by Cookie expiration (Session vs Permanent)
    // For now we just focus on the cookie being set.
    
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const response = await apiRegister(name, email, password, company);
    // Token is set by Cookie
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const requestPasswordReset = async (email: string) => {
    await import('../services/auth.service').then(service => service.requestPasswordReset(email));
  };

  const loginWithGoogle = async (googleToken: string) => {
     const api = await import('../services/auth.service');
     const response = await api.loginWithGoogle(googleToken);
     localStorage.setItem('user', JSON.stringify(response.user));
     setUser(response.user);
  };

  const logout = () => {
    apiLogout(); // Calls backend to clear cookie
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      requestPasswordReset,
      loginWithGoogle,
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
