import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
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
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage first (Persistent)
    let savedToken = localStorage.getItem('token');
    let savedUserStr = localStorage.getItem('user');
    
    // Check sessionStorage second (Session)
    if (!savedToken) {
        savedToken = sessionStorage.getItem('token');
        savedUserStr = sessionStorage.getItem('user');
    }

    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null' && savedUserStr) {
       try {
          return JSON.parse(savedUserStr);
       } catch {
          return null;
       }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    let savedToken = localStorage.getItem('token');
    if (!savedToken) {
        savedToken = sessionStorage.getItem('token');
    }
    
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      return savedToken;
    }
    return null;
  });

  const isLoading = false;

  useEffect(() => {
    // Check if we need to clear corrupted state from both storages
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');

    if (localToken === 'undefined' || localToken === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    if (sessionToken === 'undefined' || sessionToken === 'null') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await apiLogin(email, password);
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear other storage to avoid conflicts
    if (rememberMe) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    storage.setItem('token', response.token);
    storage.setItem('user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const response = await apiRegister(name, email, password, company);
    // Default to localStorage for registration flow (usually assumed they want to stay inside)
    // Or we could default to session. Let's default to Persistent as it's friendlier.
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  };

  const requestPasswordReset = async (email: string) => {
    await import('../services/auth.service').then(service => service.requestPasswordReset(email));
  };

  const loginWithGoogle = async (googleToken: string) => {
     const api = await import('../services/auth.service');
     const response = await api.loginWithGoogle(googleToken);
     // Google Login usually implies persistence
     localStorage.setItem('token', response.token);
     localStorage.setItem('user', JSON.stringify(response.user));
     setToken(response.token);
     setUser(response.user);
  };

  const logout = () => {
    apiLogout(); // Clears everything via helper
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      requestPasswordReset,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user && !!token && token !== 'undefined'
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
