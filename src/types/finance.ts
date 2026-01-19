export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  description: string;
  balance: number;
}

export interface SplitParticipant {
  name: string;
  share: number;
  settled: boolean;
}

export interface SplitExpense {
  id: string;
  description: string;
  total: number;
  date: string;
  category: string;
  participants: SplitParticipant[];
}

export interface BankAccount {
  balance: number;
  transactions: Transaction[];
}

export interface SplitsData {
  expenses: SplitExpense[];
  pending: number;
  settled: number;
}

export interface AppData {
  hdfc: BankAccount;
  postal: BankAccount;
  splits: SplitsData;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Udhari',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
