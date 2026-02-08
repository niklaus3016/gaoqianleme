
export enum AppRoute {
  GOAL = 'goal',
  ACCOUNTING = 'accounting',
  EARN = 'earn',
  WELFARE = 'welfare'
}

export interface IncomeRecord {
  id: string;
  source: string;
  amount: number;
  timestamp: number;
  category: string; // 新增：记录收入所属分类ID
}

export interface CoinLog {
  id: string;
  amount: number;
  time: string;
}

export type ThemeMode = 'light' | 'dark';

// Defines the structure for wealth generation ideas returned by AI
export interface WealthIdea {
  title: string;
  description: string;
  difficulty: '简单' | '中等' | '困难';
  potentialMonthlyIncome: string;
  steps: string[];
}

// Defines the structure for chat messages in the WealthGuru component
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
