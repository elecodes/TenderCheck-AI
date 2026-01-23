import type { TenderAnalysis } from '../types';

export const uploadTender = async (file: File): Promise<TenderAnalysis> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/tenders/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to analyze tender');
  }

  return response.json();
};
