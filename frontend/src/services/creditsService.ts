import { apiClient } from './apiClient';
import { Credit } from '@/types/models';
import { CreditFormData } from '@/types/forms';

/**
 * Credits service - handles all credit/income-related API calls
 */
export class CreditsService {
  private apiClient = apiClient;

  /**
   * Get all credits
   */
  async getAll(): Promise<Credit[]> {
    return this.apiClient.get<Credit[]>('/credits');
  }

  /**
   * Get a single credit by ID
   */
  async getById(id: number): Promise<Credit> {
    return this.apiClient.get<Credit>(`/credits/${id}`);
  }

  /**
   * Create a new credit
   */
  async create(data: CreditFormData): Promise<Credit> {
    return this.apiClient.post<Credit>('/credits', data);
  }

  /**
   * Update an existing credit
   */
  async update(id: number, data: CreditFormData): Promise<Credit> {
    return this.apiClient.put<Credit>(`/credits/${id}`, data);
  }

  /**
   * Delete a credit
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/credits/${id}`);
  }
}

// Export singleton instance
export const creditsService = new CreditsService();
