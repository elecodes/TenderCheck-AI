import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = getCurrentUser();
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null' && savedUser) {
      return savedUser;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      return savedToken;
    }
    return null;
  });

  const isLoading = false;

  useEffect(() => {
    // Check if we need to clear corrupted state
    const savedToken = localStorage.getItem('token');
    if (savedToken === 'undefined' || savedToken === 'null') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const response = await apiRegister(name, email, password, company);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    apiLogout(); // Clears localStorage
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
