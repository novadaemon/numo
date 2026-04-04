import { apiClient } from './apiClient';
import { Category } from '@/types/models';
import { CategoryFormData } from '@/types/forms';

/**
 * Categories service - handles all category-related API calls
 */
export class CategoriesService {
  private apiClient = apiClient;

  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return this.apiClient.get<Category[]>('/categories');
  }

  /**
   * Get a single category by ID
   */
  async getById(id: number): Promise<Category> {
    return this.apiClient.get<Category>(`/categories/${id}`);
  }

  /**
   * Create a new category
   */
  async create(data: CategoryFormData): Promise<Category> {
    return this.apiClient.post<Category>('/categories', data);
  }

  /**
   * Update an existing category
   */
  async update(id: number, data: CategoryFormData): Promise<Category> {
    return this.apiClient.put<Category>(`/categories/${id}`, data);
  }

  /**
   * Delete a category
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/categories/${id}`);
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();
