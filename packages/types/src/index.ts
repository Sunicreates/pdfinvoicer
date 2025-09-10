export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

export interface InvoiceDetails {
  number: string;
  date: string;
  currency?: string;
  subtotal?: number;
  taxPercent?: number;
  total?: number;
  poNumber?: string;
  poDate?: string;
  lineItems: LineItem[];
}

export interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceDetails;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileUrl?: string;
}

export interface ExtractRequest {
  fileId: string;
  model: 'gemini' | 'groq';
}

export interface ExtractResponse {
  success: boolean;
  data?: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Re-export from other modules
export * from './config';
export * from './api';
