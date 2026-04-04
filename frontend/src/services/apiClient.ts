import { API_CONFIG } from '@/config';
import { ApiError } from '@/types/api';

/**
 * ApiClient - base HTTP client for all API requests
 * Handles fetch requests with error handling, headers, and timeout
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseURL: string = API_CONFIG.baseURL,
    timeout: number = API_CONFIG.timeout,
    headers: Record<string, string> = API_CONFIG.headers
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = headers;
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }

  /**
   * Handle fetch with timeout
   */
  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Log request (for debugging)
   */
  private logRequest(method: string, url: string, body?: any): void {
    if (import.meta.env.DEV) {
      console.log(`[API] ${method} ${url}`, body || '');
    }
  }

  /**
   * Log response (for debugging)
   */
  private logResponse(method: string, url: string, status: number, data?: any): void {
    if (import.meta.env.DEV) {
      console.log(`[API] ✓ ${method} ${url} (${status})`, data || '');
    }
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  /**
   * Generic request method
   */
  async request<T = any>(
    method: string,
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = {
      ...this.defaultHeaders,
      ...customHeaders,
    };

    const init: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      init.body = JSON.stringify(body);
    }

    try {
      this.logRequest(method, url, body);

      const response = await this.fetchWithTimeout(url, init);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        console.error(`[API] ✗ ${method} ${url} (${response.status})`, errorData);

        const error = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        ) as Error & { status?: number; data?: ApiError };
        error.status = response.status;
        error.data = errorData;

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        this.logResponse(method, url, response.status);
        return undefined as T;
      }

      const data = await response.json();
      this.logResponse(method, url, response.status, data);

      return data as T;
    } catch (error) {
      // Re-throw API errors (with status/data attached)
      if (error instanceof Error && (error as any).status) {
        throw error;
      }

      // Handle network/timeout errors
      if (error instanceof TypeError && error.message.includes('abort')) {
        const timeoutError = new Error('Request timeout') as Error & { status?: number };
        timeoutError.status = 408;
        throw timeoutError;
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('POST', endpoint, body, customHeaders);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, body, customHeaders);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
