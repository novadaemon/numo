import { PaginatedResponse } from '@/types'
import { ConceptFormData } from '@/types/forms'
import { Concept } from '@/types/models'
import { apiClient } from './apiClient'

/**
 * Concepts service - handles all concept-related API calls
 */
export class ConceptsService {
  private apiClient = apiClient

  /**
   * Build query string for pagination and sorting
   */
  private buildQueryString(
    page?: number,
    size?: number,
    sortField?: string,
    sortOrder?: string
  ): string {
    const query = new URLSearchParams()

    if (page !== undefined) {
      query.append('page', page.toString())
    }
    if (size !== undefined) {
      query.append('size', size.toString())
    }
    if (sortField) {
      query.append('sort_field', sortField)
    }
    if (sortOrder) {
      query.append('sort_order', sortOrder)
    }

    const queryString = query.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Get all concepts with pagination and sorting (for data tables)
   */
  async getAll(
    page: number = 0,
    size: number = 10,
    sortField: string = 'name',
    sortOrder: string = 'asc'
  ): Promise<PaginatedResponse<Concept>> {
    const queryString = this.buildQueryString(page, size, sortField, sortOrder)
    return this.apiClient.get<PaginatedResponse<Concept>>(`/concepts${queryString}`)
  }

  /**
   * Search concepts by name (case-insensitive partial match)
   * Returns flat array for autocomplete/combobox usage
   */
  async search(query: string): Promise<Concept[]> {
    if (!query.trim()) {
      return []
    }
    return this.apiClient.get<Concept[]>(`/concepts?q=${encodeURIComponent(query)}`)
  }

  /**
   * Get a single concept by ID
   */
  async getById(id: number): Promise<Concept> {
    return this.apiClient.get<Concept>(`/concepts/${id}`)
  }

  /**
   * Create a new concept
   */
  async create(data: ConceptFormData): Promise<Concept> {
    return this.apiClient.post<Concept>('/concepts', data)
  }

  /**
   * Update an existing concept
   */
  async update(id: number, data: ConceptFormData): Promise<Concept> {
    return this.apiClient.put<Concept>(`/concepts/${id}`, data)
  }

  /**
   * Delete a concept
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete(`/concepts/${id}`)
  }
}

// Export singleton instance
export const conceptsService = new ConceptsService()
