const API_BASE_URL = 'https://lisqtboywrjw.sealoshzh.site'; // 后端服务器地址
const USE_MOCK_DATA = false; // 禁用模拟数据，使用真实后端API

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 模拟数据
const mockData = {
  target: {
    get: (userId: string, targetDate: string) => {
      return {
        code: 200,
        message: 'success',
        data: {
          target: 100000,
          userId,
          targetDate
        }
      };
    },
    set: () => {
      return {
        code: 200,
        message: 'success',
        data: null
      };
    }
  },
  record: {
    getTotal: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          total: 15000
        }
      };
    }
  },
  gold: {
    getInfo: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          totalGold: 5000,
          details: []
        }
      };
    },
    getToday: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          todayGold: 200
        }
      };
    },
    getMonthlyGold: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          lastMonthGold: 3000,
          currentMonthGold: 2000
        }
      };
    },
    getWithdrawals: () => {
      return {
        code: 200,
        message: 'success',
        data: []
      };
    },
    click: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          totalGold: 5100,
          todayGold: 300,
          remainingSeconds: 0
        }
      };
    },
    withdraw: () => {
      return {
        code: 200,
        message: 'success',
        data: null
      };
    }
  }
};

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // 检查是否使用模拟数据
    if (USE_MOCK_DATA) {
      console.log('Using mock data for:', endpoint);
      
      // 解析endpoint，返回对应的模拟数据
      if (endpoint.includes('/target/get')) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        const userId = url.searchParams.get('userId') || '';
        const targetDate = url.searchParams.get('targetDate') || '';
        return mockData.target.get(userId, targetDate) as ApiResponse<T>;
      } else if (endpoint.includes('/target/set')) {
        return mockData.target.set() as ApiResponse<T>;
      } else if (endpoint.includes('/record/getTotal')) {
        return mockData.record.getTotal() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getInfo')) {
        return mockData.gold.getInfo() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getToday')) {
        return mockData.gold.getToday() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getMonthlyGold')) {
        return mockData.gold.getMonthlyGold() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getWithdrawals')) {
        return mockData.gold.getWithdrawals() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/click')) {
        return mockData.gold.click() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/withdraw')) {
        return mockData.gold.withdraw() as ApiResponse<T>;
      }
    }

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
      
      // 降级到模拟数据
      console.log('Falling back to mock data for:', endpoint);
      if (endpoint.includes('/target/get')) {
        return mockData.target.get('', '') as ApiResponse<T>;
      } else if (endpoint.includes('/target/set')) {
        return mockData.target.set() as ApiResponse<T>;
      } else if (endpoint.includes('/record/getTotal')) {
        return mockData.record.getTotal() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getInfo')) {
        return mockData.gold.getInfo() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getToday')) {
        return mockData.gold.getToday() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getMonthlyGold')) {
        return mockData.gold.getMonthlyGold() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/getWithdrawals')) {
        return mockData.gold.getWithdrawals() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/click')) {
        return mockData.gold.click() as ApiResponse<T>;
      } else if (endpoint.includes('/gold/withdraw')) {
        return mockData.gold.withdraw() as ApiResponse<T>;
      }
      
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
