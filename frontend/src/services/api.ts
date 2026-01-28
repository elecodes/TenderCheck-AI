import type { TenderAnalysis, ValidationResult } from '../types';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const API_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const uploadTender = async (file: File): Promise<TenderAnalysis> => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });
  
  const formData = new FormData();
  formData.append('file', blob, file.name);



  const response = await fetch(`${API_URL}/api/tenders/analyze`, {
    method: 'POST',
    headers: {
        ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze tender');
  }

  return response.json();
};

export const validateProposal = async (tenderId: string, file: File): Promise<{ results: ValidationResult[] }> => {
  // Read file into memory to avoid ERR_UPLOAD_FILE_CHANGED if the file on disk is touched
  const fileData = await file.arrayBuffer();
  const blob = new Blob([fileData], { type: file.type });

  const formData = new FormData();
  formData.append('file', blob, file.name);

  const response = await fetch(`${API_URL}/api/tenders/${tenderId}/validate-proposal`, {
    method: 'POST',
    headers: {
        ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Validation failed');
  }

  return response.json();
};
export const fetchHistory = async (): Promise<TenderAnalysis[]> => {
  const response = await fetch(`${API_URL}/api/tenders`, {
    headers: {
        ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
};

export const deleteTender = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/tenders/${id}`, {
    method: 'DELETE',
    headers: {
        ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete tender');
  }
};
