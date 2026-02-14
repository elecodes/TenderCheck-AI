import type { TenderAnalysis } from '../types';

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Helper for Fetch Options with Credentials (Cookies) + Auth Header
const getFetchOptions = (method: string, body?: any) => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Fallback for when cookies fail
  }

  return {
    method,
    headers,
    credentials: 'include' as RequestCredentials, // IMPORTANT: Send cookies
    body: body ? JSON.stringify(body) : undefined,
  };
};


export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.message || errorData.error || errorMessage, response.status);
  }
  return response.json();
};

export const uploadTender = async (file: File): Promise<TenderAnalysis> => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });
  
  const formData = new FormData();
  formData.append('file', blob, file.name);

  // Get token for auth header
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/tenders/analyze`, {
    method: 'POST',
    // No Content-Type header; fetch adds boundary for FormData
    headers,
    credentials: 'include', // Send cookies
    body: formData,
  });

  return handleResponse(response, 'Failed to analyze tender');
};

export const validateProposal = async (tenderId: string, file: File) => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });

  const formData = new FormData();
  formData.append('file', blob, file.name);

  // Get token for auth header
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/tenders/${tenderId}/validate-proposal`, {
    method: 'POST',
    // No Content-Type header; fetch adds boundary for FormData
    headers,
    credentials: 'include', // Send cookies
    body: formData,
  });

  return handleResponse(response, 'Validation failed');
};

export const fetchHistory = async (): Promise<TenderAnalysis[]> => {
  const response = await fetch(`${API_URL}/api/tenders`, getFetchOptions('GET'));
  return handleResponse(response, 'Failed to fetch history');
};

export const deleteTender = async (id: string) => {
  const response = await fetch(`${API_URL}/api/tenders/${id}`, getFetchOptions('DELETE'));
  return handleResponse(response, 'Failed to delete tender');
};
