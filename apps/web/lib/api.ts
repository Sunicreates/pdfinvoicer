import axios from 'axios';
import { ApiResponse, UploadResponse, ExtractRequest, Invoice, PaginatedResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// File upload
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<UploadResponse>>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Upload failed');
  }

  return response.data.data;
}

// AI extraction
export async function extractData(request: ExtractRequest): Promise<Invoice> {
  const response = await api.post<ApiResponse<Invoice>>('/api/extract', request);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Extraction failed');
  }

  return response.data.data;
}

// Invoice operations
export async function getInvoices(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Invoice>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Invoice>>>('/api/invoices', {
    params,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch invoices');
  }

  return response.data.data;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await api.get<ApiResponse<Invoice>>(`/api/invoices/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch invoice');
  }

  return response.data.data;
}

export async function createInvoice(data: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const response = await api.post<ApiResponse<Invoice>>('/api/invoices', data);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to create invoice');
  }

  return response.data.data;
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
  const response = await api.put<ApiResponse<Invoice>>(`/api/invoices/${id}`, data);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to update invoice');
  }

  return response.data.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await api.delete<ApiResponse>(`/api/invoices/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete invoice');
  }
}

// Health check
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await api.get('/health');
  return response.data;
}
