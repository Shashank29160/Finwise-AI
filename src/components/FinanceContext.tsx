import React, { createContext, useContext, ReactNode } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { AppData, Transaction, SplitExpense } from '@/types/finance';

interface FinanceContextType {
  data: AppData;
  isLoaded: boolean;
  setBalance: (bank: 'hdfc' | 'postal', balance: number) => void;
  addTransaction: (bank: 'hdfc' | 'postal', transaction: Omit<Transaction, 'id' | 'balance'>) => void;
  deleteTransaction: (bank: 'hdfc' | 'postal', transactionId: string) => void;
  addSplitExpense: (expense: Omit<SplitExpense, 'id'>) => void;
  toggleParticipantSettlement: (expenseId: string, participantIndex: number) => void;
  getFinancialSummary: () => {
    totalBalance: number;
    hdfcBalance: number;
    postalBalance: number;
    totalExpenses: number;
    totalIncome: number;
    categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
    recentTransactions: Array<any>;
    splitsPending: number;
    splitsSettled: number;
    transactionCount: number;
  };
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const financeData = useFinanceData();

  return (
    <FinanceContext.Provider value={financeData}>
      {children}
    </FinanceContext.Provider>
  );
};
