/**
 * Generic API error response
 */
export interface ApiError {
  message: string
  [key: string]: any
}

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

/**
 * Generic API response wrapper (optional, for flexibility)
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * Request configuration
 */
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

/**
 * Pagination parameters (for future use)
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  page: number
  size: number
  total: number
}

/**
 * Debit filter parameters
 */
export interface DebitFilterParams {
  from_date?: string // ISO-8601 date
  to_date?: string // ISO-8601 date
  category_ids?: number[] // Multiple category IDs for 'contains' operator
  category_id?: number // Single category ID (deprecated, use category_ids)
  place_ids?: number[] // Multiple place IDs for 'contains' operator
  place_id?: number // Single place ID (deprecated, use place_ids)
  concept?: string // Partial text match
  method_values?: ('debit' | 'credit' | 'cash')[] // Multiple method values for 'contains' operator
  method?: 'debit' | 'credit' | 'cash' // Single method (deprecated, use method_values)
  amount_gt?: number // Amount greater than
  amount_lt?: number // Amount less than
  page?: number // Page number (0-indexed)
  size?: number // Page size (10, 25, 50, or 100)
  sort_field?: 'expensed_at' | 'category' | 'place' | 'amount' | 'concept' | 'method'
  sort_order?: 'asc' | 'desc'
}

/**
 * Credit filter parameters
 */
export interface CreditFilterParams {
  from_date?: string // ISO-8601 date
  to_date?: string // ISO-8601 date
  observations?: string // Text search in observations
  amount_gt?: number // Greater than
  amount_lt?: number // Less than
  page?: number // Page number (0-indexed)
  size?: number // Page size (10, 25, 50, or 100)
  sort_field?: 'credited_at' | 'amount' | 'observations'
  sort_order?: 'asc' | 'desc'
}
