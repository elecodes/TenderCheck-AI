export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
  token?: string; // Fallback token
}

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
console.log('🔌 [AuthService] Initialized in', API_URL ? `Absolute Mode (${API_URL})` : 'Proxy/Relative Mode');

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const login = async (email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> => {
  const target = `${API_URL}/api/auth/login`;
  console.log(`📡 [AuthService] Login Request -> ${target}`);

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, rememberMe }),
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

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  return data;
};

export const register = async (name: string, email: string, password: string, company?: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, company }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Registration failed');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
  }
  return data;
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
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Google Login failed');
    }
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  };

export const logout = async () => {
  await fetch(`${API_URL}/api/auth/logout`, {
     method: 'POST',
     credentials: 'include'
  });
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token'); // Cleanup token
};

// New Method: Verify Session via Cookie OR Token
export const getMe = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
       method: 'GET',
       headers: getAuthHeaders(), // Send token if available
       credentials: 'include'
    });
    
    if (response.ok) {
       const data = await response.json();
       return data.user;
    }
    return null;
  } catch {
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
