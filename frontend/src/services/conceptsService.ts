import { apiClient } from './apiClient';
import { Concept } from '@/types/models';

/**
 * Concepts service - handles all concept-related API calls
 */
export class ConceptsService {
  private apiClient = apiClient;

  /**
   * Get all concepts
   */
  async getAll(): Promise<Concept[]> {
    return this.apiClient.get<Concept[]>('/concepts');
  }

  /**
   * Search concepts by name (case-insensitive partial match)
   */
  async search(query: string): Promise<Concept[]> {
    if (!query.trim()) {
      return [];
    }
    return this.apiClient.get<Concept[]>(`/concepts?q=${encodeURIComponent(query)}`);
  }
}

// Export singleton instance
export const conceptsService = new ConceptsService();
