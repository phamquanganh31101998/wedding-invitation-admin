// Enhanced fetch client that gives you axios-like features
interface FetchConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class FetchClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL = '/api', timeout = 10000) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    config: FetchConfig = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, baseURL, ...fetchConfig } = config;

    const url = `${baseURL || this.baseURL}${endpoint}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = fetchConfig.body instanceof FormData;
    const headers = isFormData
      ? { ...fetchConfig.headers }
      : {
          'Content-Type': 'application/json',
          ...fetchConfig.headers,
        };

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || `HTTP ${response.status}`);
      }

      return result.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      throw new Error('Network error');
    }
  }

  async get<T>(endpoint: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: FetchConfig
  ): Promise<T> {
    const isFormData = data instanceof FormData;

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: FetchConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const fetchClient = new FetchClient();

// Export class for custom instances
export { FetchClient };
