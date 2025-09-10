// Note: Express types will be available when this package is used in the API app
export interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
  };
}

export interface FileUploadRequest {
  file?: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    filename?: string;
    path?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: ValidationError[];
}

export interface RequestWithPagination {
  pagination?: {
    page: number;
    limit: number;
    skip: number;
  };
}
