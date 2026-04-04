import { apiClient } from './apiClient';
import { Credit } from '@/types/models';
import { CreditFormData } from '@/types/forms';
import { CreditFilterParams, PaginatedResponse } from '@/types';

/**
 * Credits service - handles all credit/income-related API calls
 */
export class CreditsService {
  private apiClient = apiClient;

  /**
   * Build query string from filter parameters
   */
  private buildQueryString(params: CreditFilterParams): string {
    const query = new URLSearchParams();

    if (params.page !== undefined) {
      query.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      query.append('size', params.size.toString());
    }
    if (params.from_date) {
      query.append('from_date', params.from_date);
    }
    if (params.to_date) {
      query.append('to_date', params.to_date);
    }

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get all credits with optional filters and pagination
   */
  async getAll(filters?: CreditFilterParams): Promise<PaginatedResponse<Credit>> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.apiClient.get<PaginatedResponse<Credit>>(`/credits${queryString}`);
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

  /**
   * Get credits in date range
   */
  async getByDateRange(fromDate: string, toDate: string): Promise<PaginatedResponse<Credit>> {
    return this.getAll({ from_date: fromDate, to_date: toDate });
  }
}

// Export singleton instance
export const creditsService = new CreditsService();
