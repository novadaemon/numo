import { PaginatedResponse } from '@/types'
import { CategoryFormData } from '@/types/forms'
import { Category } from '@/types/models'
import { apiClient } from './apiClient'

/**
 * Categories service - handles all category-related API calls
 */
export class CategoriesService {
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
   * Get all categories without pagination (for forms, etc.)
   * Returns just the array of categories
   */
  async getAllSimple(): Promise<Category[]> {
    const response = await this.apiClient.get<PaginatedResponse<Category>>('/categories')
    return response.data || []
  }

  /**
   * Get all categories with pagination and sorting (for data tables)
   */
  async getAll(
    page: number = 0,
    size: number = 10,
    sortField: string = 'name',
    sortOrder: string = 'asc'
  ): Promise<PaginatedResponse<Category>> {
    const queryString = this.buildQueryString(page, size, sortField, sortOrder)
    return this.apiClient.get<PaginatedResponse<Category>>(`/categories${queryString}`)
  }

  /**
   * Get a single category by ID
   */
  async getById(id: number): Promise<Category> {
    return this.apiClient.get<Category>(`/categories/${id}`)
  }

  /**
   * Create a new category
   */
  async create(data: CategoryFormData): Promise<Category> {
    return this.apiClient.post<Category>('/categories', data)
  }

  /**
   * Update an existing category
   */
  async update(id: number, data: CategoryFormData): Promise<Category> {
    return this.apiClient.put<Category>(`/categories/${id}`, data)
  }

  /**
   * Delete a category
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/categories/${id}`)
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService()
