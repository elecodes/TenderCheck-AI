import type { TenderAnalysis } from '../types';

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Helper for Fetch Options with Credentials (Cookies)
const getFetchOptions = (method: string, body?: any) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  return {
    method,
    headers,
    credentials: 'include' as RequestCredentials, // IMPORTANT: Send cookies
    body: body ? JSON.stringify(body) : undefined,
  };
};

export const uploadTender = async (file: File): Promise<TenderAnalysis> => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });
  
  const formData = new FormData();
  formData.append('file', blob, file.name);

  const response = await fetch(`${API_URL}/api/tenders/analyze`, {
    method: 'POST',
    // No Content-Type header; fetch adds boundary for FormData
    credentials: 'include', // Send cookies
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze tender');
  }

  return response.json();
};

export const validateProposal = async (tenderId: string, file: File) => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });

  const formData = new FormData();
  formData.append('file', blob, file.name);

  const response = await fetch(`${API_URL}/api/tenders/${tenderId}/validate-proposal`, {
    method: 'POST',
    // No Content-Type header; fetch adds boundary for FormData
    credentials: 'include', // Send cookies
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Validation failed');
  }

  return data;
};

export const fetchHistory = async (): Promise<TenderAnalysis[]> => {
  const response = await fetch(`${API_URL}/api/tenders`, getFetchOptions('GET'));

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
};

export const deleteTender = async (id: string) => {
  const response = await fetch(`${API_URL}/api/tenders/${id}`, getFetchOptions('DELETE'));

  if (!response.ok) {
    throw new Error('Failed to delete tender');
  }

  return response.json();
};
