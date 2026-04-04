/**
 * Generic API error response
 */
export interface ApiError {
  message: string;
  [key: string]: any;
}

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

/**
 * Generic API response wrapper (optional, for flexibility)
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Pagination parameters (for future use)
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
}

/**
 * Debit filter parameters
 */
export interface DebitFilterParams {
  from_date?: string; // ISO-8601 date
  to_date?: string; // ISO-8601 date
  category_id?: number;
  place_id?: number;
  page?: number; // Page number (0-indexed)
  size?: number; // Page size (10, 25, 50, or 100)
  sort_field?: 'created_at' | 'category' | 'place' | 'amount' | null;
  sort_order?: 'asc' | 'desc';
}

/**
 * Credit filter parameters
 */
export interface CreditFilterParams {
  from_date?: string; // ISO-8601 date
  to_date?: string; // ISO-8601 date
  page?: number; // Page number (0-indexed)
  size?: number; // Page size (10, 25, 50, or 100)
}
