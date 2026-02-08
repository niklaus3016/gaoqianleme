import { api, ApiResponse } from './api';

interface GoldInfo {
  userId: string;
  totalGold: number;
  todayGold: number;
  lastClickTime: string;
  details: any[];
  pagination?: any;
}

interface GoldClickResponse {
  userId: string;
  totalGold: number;
  todayGold: number;
  goldEarned: number;
  remainingSeconds: number;
}

interface Ticket {
  ticketNumber: string;
  buyDate: string;
  drawDate: string;
  isWinning?: boolean;
  prizeLevel?: string;
  prizeAmount?: number;
}

interface BuyTicketResponse {
  userId: string;
  tickets: Ticket[];
  totalCost: number;
  remainingGold: number;
}

interface LotteryResult {
  drawDate: string;
  winningNumbers: string[];
  totalPool: number;
  totalTickets: number;
  prizeDistribution: any;
  isDrawn?: boolean;
}

interface Target {
  userId: string;
  target: number;
  current: number;
  period: string;
  targetDate: string;
  progress: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

interface Record {
  _id: string;
  uid: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  relatedTargetId?: string | null;
  createTime: string;
}

export const goldService = {
  click: async (userId: string): Promise<ApiResponse<GoldClickResponse>> => {
    return api.post('/api/gold/click', { userId });
  },

  getInfo: async (userId: string, page = 1, limit = 20): Promise<ApiResponse<GoldInfo>> => {
    return api.get('/api/gold/info', { userId, page, limit });
  },

  getToday: async (userId: string): Promise<ApiResponse<{ userId: string; todayGold: number }>> => {
    return api.get('/api/gold/today', { userId });
  },

  withdraw: async (userId: string, alipayAccount: string, alipayName: string, goldAmount: number): Promise<ApiResponse<{ success: boolean }>> => {
    return api.post('/api/gold/withdraw', { userId, alipayAccount, alipayName, goldAmount });
  },

  getWithdrawals: async (userId: string, limit = 10): Promise<ApiResponse<any[]>> => {
    return api.get('/api/gold/withdrawals', { userId, limit });
  },

  getMonthlyGold: async (userId: string, year?: number, month?: number): Promise<ApiResponse<{ lastMonthGold: number; currentMonthGold: number }>> => {
    return api.get('/api/gold/monthly', { userId, year, month });
  },
};

export const lotteryService = {
  buy: async (userId: string, ticketCount = 1): Promise<ApiResponse<BuyTicketResponse>> => {
    return api.post('/api/lottery/buy', { userId, ticketCount });
  },

  open: async (drawDate?: string): Promise<ApiResponse<LotteryResult>> => {
    return api.post('/api/lottery/open', drawDate ? { drawDate } : {});
  },

  getTickets: async (userId: string, drawDate?: string): Promise<ApiResponse<{ userId: string; tickets: Ticket[] }>> => {
    return api.get('/api/lottery/tickets', { userId, drawDate });
  },

  getLatest: async (): Promise<ApiResponse<{ result: LotteryResult | null }>> => {
    return api.get('/api/lottery/latest');
  },

  getStats: async (): Promise<ApiResponse<{ totalPool: number; totalTickets: number; participants: number; latestDrawDate: string | null }>> => {
    return api.get('/api/lottery/stats');
  },

  getUpcoming: async (): Promise<ApiResponse<{ result: any }>> => {
    return api.get('/api/lottery/upcoming');
  },

  getResultByDate: async (drawDate: string): Promise<ApiResponse<{ result: LotteryResult }>> => {
    return api.get(`/api/lottery/result/${drawDate}`);
  },

  getHistory: async (limit = 10): Promise<ApiResponse<{ results: LotteryResult[] }>> => {
    return api.get('/api/lottery/history', { limit });
  },

  getAllTickets: async (userId: string): Promise<ApiResponse<{ tickets: Ticket[] }>> => {
    return api.get('/api/lottery/all-tickets', { userId });
  },
};

export const targetService = {
  set: async (userId: string, target: number, period: string, targetDate: string): Promise<ApiResponse<Target>> => {
    return api.post('/api/target/set', { userId, target, period, targetDate });
  },

  get: async (userId: string, targetDate?: string): Promise<ApiResponse<Target | { target: null; message: string }>> => {
    return api.get('/api/target/get', { userId, targetDate });
  },

  getMonth: async (userId: string, year?: number, month?: number): Promise<ApiResponse<{ targets: Target[] }>> => {
    return api.get('/api/target/month', { userId, year, month });
  },

  update: async (userId: string, targetDate: string, amount: number): Promise<ApiResponse<Target>> => {
    return api.post('/api/target/update', { userId, targetDate, amount });
  },
};

export const recordService = {
  add: async (userId: string, amount: number, type: string, category = 'other', description = '', relatedTargetId?: string): Promise<ApiResponse<Record>> => {
    return api.post('/api/record/add', { userId, amount, type, category, description, relatedTargetId });
  },

  getList: async (userId: string, page = 1, limit = 20): Promise<ApiResponse<{ records: Record[]; pagination: any }>> => {
    return api.get('/api/record/list', { userId, page, limit });
  },

  getToday: async (userId: string): Promise<ApiResponse<{ records: Record[] }>> => {
    return api.get('/api/record/today', { userId });
  },

  getMonth: async (userId: string, year?: number, month?: number): Promise<ApiResponse<{ records: Record[] }>> => {
    return api.get('/api/record/month', { userId, year, month });
  },

  getTotal: async (userId: string, startDate?: string, endDate?: string, type?: string): Promise<ApiResponse<{ total: number; count: number }>> => {
    return api.get('/api/record/total', { userId, startDate, endDate, type });
  },

  getTodayTotal: async (userId: string, type?: string): Promise<ApiResponse<{ total: number; count: number }>> => {
    return api.get('/api/record/today-total', { userId, type });
  },

  getMonthTotal: async (userId: string, year?: number, month?: number, type?: string): Promise<ApiResponse<{ total: number; count: number }>> => {
    return api.get('/api/record/month-total', { userId, year, month, type });
  },

  getStatistics: async (userId: string, days = 7): Promise<ApiResponse<{ statistics: any[] }>> => {
    return api.get('/api/record/statistics', { userId, days });
  },

  delete: async (recordId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.post('/api/record/delete', { recordId });
  },
};
