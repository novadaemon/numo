import { PaginatedResponse } from '@/types'
import { PlaceFormData } from '@/types/forms'
import { Place } from '@/types/models'
import { apiClient } from './apiClient'

/**
 * Places service - handles all place-related API calls
 */
export class PlacesService {
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
   * Get all places without pagination (for forms, etc.)
   * Returns just the array of places
   */
  async getAllSimple(): Promise<Place[]> {
    const response = await this.apiClient.get<PaginatedResponse<Place>>('/places')
    return response.data || []
  }

  /**
   * Get all places with pagination and sorting (for data tables)
   */
  async getAll(
    page: number = 0,
    size: number = 10,
    sortField: string = 'name',
    sortOrder: string = 'asc'
  ): Promise<PaginatedResponse<Place>> {
    const queryString = this.buildQueryString(page, size, sortField, sortOrder)
    return this.apiClient.get<PaginatedResponse<Place>>(`/places${queryString}`)
  }

  /**
   * Get a single place by ID
   */
  async getById(id: number): Promise<Place> {
    return this.apiClient.get<Place>(`/places/${id}`)
  }

  /**
   * Create a new place
   */
  async create(data: PlaceFormData): Promise<Place> {
    return this.apiClient.post<Place>('/places', data)
  }

  /**
   * Update an existing place
   */
  async update(id: number, data: PlaceFormData): Promise<Place> {
    return this.apiClient.put<Place>(`/places/${id}`, data)
  }

  /**
   * Delete a place
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/places/${id}`)
  }
}

// Export singleton instance
export const placesService = new PlacesService()
