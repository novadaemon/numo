import { CreditFilterParams, PaginatedResponse } from '@/types'
import type { FilterRule } from '@/types/filters'
import { CreditFormData } from '@/types/forms'
import { Credit } from '@/types/models'
import { apiClient } from './apiClient'

/**
 * Credits service - handles all credit/income-related API calls
 */
export class CreditsService {
  private apiClient = apiClient

  /**
   * Build query string from filter parameters
   */
  private buildQueryString(params: CreditFilterParams): string {
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
    if (params.observations) {
      query.append('observations', params.observations)
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
   * Get all credits with optional filters and pagination
   */
  async getAll(filters?: CreditFilterParams): Promise<PaginatedResponse<Credit>> {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.apiClient.get<PaginatedResponse<Credit>>(`/credits${queryString}`)
  }

  /**
   * Get all credits with Notion-style filter rules
   * Converts FilterRule[] to CreditFilterParams
   */
  async getAllWithFilters(
    filterRules: FilterRule[],
    page: number = 0,
    size: number = 25,
    sortField: string = 'credited_at',
    sortOrder: string = 'desc'
  ): Promise<PaginatedResponse<Credit>> {
    const params: CreditFilterParams = {
      page,
      size,
      sort_field: sortField as any,
      sort_order: sortOrder as any,
    }

    // Convert FilterRule[] to CreditFilterParams
    filterRules.forEach((rule) => {
      if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
        return // Skip empty value operators
      }

      switch (rule.field) {
        case 'credited_at':
          if (rule.operator === 'equals' && rule.value) {
            params.from_date = rule.value
            params.to_date = rule.value
          } else if (rule.operator === 'before' && rule.value) {
            params.to_date = rule.value
          } else if (rule.operator === 'after' && rule.value) {
            params.from_date = rule.value
          } else if (rule.operator === 'between' && Array.isArray(rule.value)) {
            params.from_date = rule.value[0]
            params.to_date = rule.value[1]
          }
          break

        case 'amount':
          if (rule.operator === 'equals' && rule.value) {
            params.amount_gt = parseFloat(rule.value) - 0.01
            params.amount_lt = parseFloat(rule.value) + 0.01
          } else if (rule.operator === 'gt' && rule.value) {
            params.amount_gt = parseFloat(rule.value)
          } else if (rule.operator === 'lt' && rule.value) {
            params.amount_lt = parseFloat(rule.value)
          } else if (rule.operator === 'between' && Array.isArray(rule.value)) {
            params.amount_gt = parseFloat(rule.value[0])
            params.amount_lt = parseFloat(rule.value[1])
          }
          break

        case 'observations':
          if (rule.operator === 'contains' && rule.value) {
            params.observations = rule.value
          } else if (rule.operator === 'equals' && rule.value) {
            params.observations = rule.value
          }
          break
      }
    })

    return this.getAll(params)
  }

  /**
   * Get a single credit by ID
   */
  async getById(id: number): Promise<Credit> {
    return this.apiClient.get<Credit>(`/credits/${id}`)
  }

  /**
   * Create a new credit
   */
  async create(data: CreditFormData): Promise<Credit> {
    return this.apiClient.post<Credit>('/credits', data)
  }

  /**
   * Update an existing credit
   */
  async update(id: number, data: CreditFormData): Promise<Credit> {
    return this.apiClient.put<Credit>(`/credits/${id}`, data)
  }

  /**
   * Delete a credit
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/credits/${id}`)
  }

  /**
   * Get credits in date range
   */
  async getByDateRange(fromDate: string, toDate: string): Promise<PaginatedResponse<Credit>> {
    return this.getAll({ from_date: fromDate, to_date: toDate })
  }
}

// Export singleton instance
export const creditsService = new CreditsService()
