import { DebitFilterParams, DebitFormData, PaginatedResponse } from '@/types'
import type { FilterRule } from '@/types/filters'
import { Debit } from '@/types/models'
import { apiClient } from './apiClient'

/**
 * Debits service - handles all debit/expense-related API calls
 */
export class DebitsService {
  private apiClient = apiClient

  /**
   * Build query string from filter parameters
   */
  private buildQueryString(params: DebitFilterParams): string {
    const query = new URLSearchParams()

    if (params.page !== undefined) {
      query.append('page', params.page.toString())
    }
    if (params.size !== undefined) {
      query.append('size', params.size.toString())
    }
    if (params.from_date) {
      query.append('from_date', params.from_date)
    }
    if (params.to_date) {
      query.append('to_date', params.to_date)
    }
    // Support both single and multiple category IDs
    if (params.category_ids && params.category_ids.length > 0) {
      query.append('category_ids', JSON.stringify(params.category_ids))
    } else if (params.category_id) {
      query.append('category_id', params.category_id.toString())
    }
    // Support both single and multiple place IDs
    if (params.place_ids && params.place_ids.length > 0) {
      query.append('place_ids', JSON.stringify(params.place_ids))
    } else if (params.place_id) {
      query.append('place_id', params.place_id.toString())
    }
    if (params.concept) {
      query.append('concept', params.concept)
    }
    // Support both single and multiple method values
    if (params.method_values && params.method_values.length > 0) {
      query.append('method_values', JSON.stringify(params.method_values))
    } else if (params.method) {
      query.append('method', params.method)
    }
    if (params.amount_gt !== undefined) {
      query.append('amount_gt', params.amount_gt.toString())
    }
    if (params.amount_lt !== undefined) {
      query.append('amount_lt', params.amount_lt.toString())
    }
    if (params.sort_field) {
      query.append('sort_field', params.sort_field)
    }
    if (params.sort_order) {
      query.append('sort_order', params.sort_order)
    }

    const queryString = query.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Get all debits with optional filters and pagination
   */
  async getAll(filters?: DebitFilterParams): Promise<PaginatedResponse<Debit>> {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.apiClient.get<PaginatedResponse<Debit>>(`/debits${queryString}`)
  }

  /**
   * Get all debits with Notion-style filter rules
   * Converts FilterRule[] to DebitFilterParams
   */
  async getAllWithFilters(
    filterRules: FilterRule[],
    page: number = 0,
    size: number = 25,
    sortField: string = 'expensed_at',
    sortOrder: string = 'desc'
  ): Promise<PaginatedResponse<Debit>> {
    const params: DebitFilterParams = {
      page,
      size,
      sort_field: sortField as any as
        | 'expensed_at'
        | 'category'
        | 'place'
        | 'amount'
        | 'concept'
        | 'method'
        | undefined,
      sort_order: sortOrder as any as 'asc' | 'desc' | undefined,
    }

    // Convert FilterRule[] to DebitFilterParams
    filterRules.forEach((rule) => {
      if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
        return // Skip empty value operators
      }

      switch (rule.field) {
        case 'expensed_at':
          if (rule.operator === 'equals' && rule.value) {
            params.from_date = String(rule.value)
            params.to_date = String(rule.value)
          } else if (rule.operator === 'before' && rule.value) {
            params.to_date = String(rule.value)
          } else if (rule.operator === 'after' && rule.value) {
            params.from_date = String(rule.value)
          } else if (rule.operator === 'between' && Array.isArray(rule.value)) {
            params.from_date = String(rule.value[0])
            params.to_date = String(rule.value[1])
          }
          break

        case 'category_id':
          if (rule.operator === 'contains' && Array.isArray(rule.value)) {
            params.category_ids = rule.value.map((v) => parseInt(String(v)))
          } else if (rule.operator === 'equals' && rule.value) {
            params.category_id = parseInt(String(rule.value))
          }
          break

        case 'place_id':
          if (rule.operator === 'contains' && Array.isArray(rule.value)) {
            params.place_ids = rule.value.map((v) => parseInt(String(v)))
          } else if (rule.operator === 'equals' && rule.value) {
            params.place_id = parseInt(String(rule.value))
          }
          break

        case 'concept':
          if (rule.operator === 'contains' && rule.value) {
            params.concept = String(rule.value)
          } else if (rule.operator === 'equals' && rule.value) {
            params.concept = String(rule.value)
          }
          break

        case 'method':
          if (rule.operator === 'contains' && Array.isArray(rule.value)) {
            params.method_values = rule.value as ('debit' | 'credit' | 'cash')[]
          } else if (rule.operator === 'equals' && rule.value) {
            params.method = rule.value as 'debit' | 'credit' | 'cash'
          }
          break

        case 'amount':
          if (rule.operator === 'equals' && rule.value) {
            params.amount_gt = parseFloat(String(rule.value)) - 0.01
            params.amount_lt = parseFloat(String(rule.value)) + 0.01
          } else if (rule.operator === 'gt' && rule.value) {
            params.amount_gt = parseFloat(String(rule.value))
          } else if (rule.operator === 'lt' && rule.value) {
            params.amount_lt = parseFloat(String(rule.value))
          } else if (rule.operator === 'between' && Array.isArray(rule.value)) {
            params.amount_gt = parseFloat(rule.value[0])
            params.amount_lt = parseFloat(rule.value[1])
          }
          break
      }
    })

    return this.getAll(params)
  }

  /**
   * Get a single debit by ID
   */
  async getById(id: number): Promise<Debit> {
    return this.apiClient.get<Debit>(`/debits/${id}`)
  }

  /**
   * Create a new debit
   */
  async create(data: DebitFormData): Promise<Debit> {
    return this.apiClient.post<Debit>('/debits', data)
  }

  /**
   * Update an existing debit
   */
  async update(id: number, data: DebitFormData): Promise<Debit> {
    return this.apiClient.put<Debit>(`/debits/${id}`, data)
  }

  /**
   * Delete a debit
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/debits/${id}`)
  }

  /**
   * Get debits by category
   */
  async getByCategory(categoryId: number): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ category_id: categoryId })
  }

  /**
   * Get debits by place
   */
  async getByPlace(placeId: number): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ place_id: placeId })
  }

  /**
   * Get debits in date range
   */
  async getByDateRange(fromDate: string, toDate: string): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ from_date: fromDate, to_date: toDate })
  }
}

// Export singleton instance
export const debitsService = new DebitsService()
