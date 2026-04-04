import { apiClient } from './apiClient';
import { Place } from '@/types/models';
import { PlaceFormData } from '@/types/forms';

/**
 * Places service - handles all place-related API calls
 */
export class PlacesService {
  private apiClient = apiClient;

  /**
   * Get all places
   */
  async getAll(): Promise<Place[]> {
    return this.apiClient.get<Place[]>('/places');
  }

  /**
   * Get a single place by ID
   */
  async getById(id: number): Promise<Place> {
    return this.apiClient.get<Place>(`/places/${id}`);
  }

  /**
   * Create a new place
   */
  async create(data: PlaceFormData): Promise<Place> {
    return this.apiClient.post<Place>('/places', data);
  }

  /**
   * Update an existing place
   */
  async update(id: number, data: PlaceFormData): Promise<Place> {
    return this.apiClient.put<Place>(`/places/${id}`, data);
  }

  /**
   * Delete a place
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/places/${id}`);
  }
}

// Export singleton instance
export const placesService = new PlacesService();
