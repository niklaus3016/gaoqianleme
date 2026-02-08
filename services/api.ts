const API_BASE_URL = 'https://fxbzymqsusze.sealoshzh.site';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = API_BASE_URL ? `${this.baseUrl}${endpoint}` : endpoint;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log('API Request:', { method: options.method, url, body: options.body });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response status:', response.status, response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '网络请求失败' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.code !== 200) {
        console.error('Business Error:', data.message);
        throw new Error(data.message || '操作失败');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined 
    });
  }
}

export const api = new ApiService(API_BASE_URL);
export type { ApiResponse };
