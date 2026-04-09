import { apiClient } from './apiClient';
import { Debit } from '@/types/models';
import { DebitFormData, DebitFilterParams, PaginatedResponse } from '@/types';

/**
 * Debits service - handles all debit/expense-related API calls
 */
export class DebitsService {
  private apiClient = apiClient;

  /**
   * Build query string from filter parameters
   */
  private buildQueryString(params: DebitFilterParams): string {
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
    if (params.category_id) {
      query.append('category_id', params.category_id.toString());
    }
    if (params.place_id) {
      query.append('place_id', params.place_id.toString());
    }
    if (params.sort_field) {
      query.append('sort_field', params.sort_field);
    }
    if (params.sort_order) {
      query.append('sort_order', params.sort_order);
    }

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get all debits with optional filters and pagination
   */
  async getAll(filters?: DebitFilterParams): Promise<PaginatedResponse<Debit>> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    return this.apiClient.get<PaginatedResponse<Debit>>(`/debits${queryString}`);
  }

  /**
   * Get a single debit by ID
   */
  async getById(id: number): Promise<Debit> {
    return this.apiClient.get<Debit>(`/debits/${id}`);
  }

  /**
   * Create a new debit
   */
  async create(data: DebitFormData): Promise<Debit> {
    return this.apiClient.post<Debit>('/debits', data);
  }

  /**
   * Update an existing debit
   */
  async update(id: number, data: DebitFormData): Promise<Debit> {
    return this.apiClient.put<Debit>(`/debits/${id}`, data);
  }

  /**
   * Delete a debit
   */
  async delete(id: number): Promise<void> {
    return this.apiClient.delete<void>(`/debits/${id}`);
  }

  /**
   * Get debits by category
   */
  async getByCategory(categoryId: number): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ category_id: categoryId });
  }

  /**
   * Get debits by place
   */
  async getByPlace(placeId: number): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ place_id: placeId });
  }

  /**
   * Get debits in date range
   */
  async getByDateRange(fromDate: string, toDate: string): Promise<PaginatedResponse<Debit>> {
    return this.getAll({ from_date: fromDate, to_date: toDate });
  }
}

// Export singleton instance
export const debitsService = new DebitsService();
