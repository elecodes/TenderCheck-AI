export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
console.log('🔌 Auth Service Initialized. Backend URL:', `"${API_URL}"`); // Quote to see whitespace

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const target = `${API_URL}/api/auth/login`;
  console.log(`📡 [AuthService] Login Request -> ${target}`);

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    console.error('❌ [AuthService] received HTML instead of JSON. Check API_URL configuration.');
    throw new Error('Server configuration error (Received HTML)');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Login failed');
  }

  return response.json();
};

export const register = async (name: string, email: string, password: string, company?: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, company }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed');
  }

  return response.json();
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/reset-password-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to request password reset');
  }
};

export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
    const targetUrl = `${API_URL}/api/auth/google`;
    console.log('🚀 Attempting Google Login Fetch:', targetUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Google Login failed');
    }
  
    return response.json();
  };

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
