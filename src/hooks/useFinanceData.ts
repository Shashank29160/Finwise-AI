import { useState, useEffect, useCallback } from 'react';
import { AppData, Transaction, SplitExpense } from '@/types/finance';

const STORAGE_KEY = 'financialTrackerData';

const defaultData: AppData = {
  hdfc: {
    balance: 0,
    transactions: [],
  },
  postal: {
    balance: 0,
    transactions: [],
  },
  splits: {
    expenses: [],
    pending: 0,
    settled: 0,
  },
};

export const useFinanceData = () => {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const setBalance = useCallback((bank: 'hdfc' | 'postal', balance: number) => {
    setData((prev) => ({
      ...prev,
      [bank]: {
        ...prev[bank],
        balance,
      },
    }));
  }, []);

  const addTransaction = useCallback(
    (bank: 'hdfc' | 'postal', transaction: Omit<Transaction, 'id' | 'balance'>) => {
      setData((prev) => {
        const newBalance =
          transaction.type === 'expense'
            ? prev[bank].balance - transaction.amount
            : prev[bank].balance + transaction.amount;

        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
          balance: newBalance,
        };

        return {
          ...prev,
          [bank]: {
            balance: newBalance,
            transactions: [...prev[bank].transactions, newTransaction],
          },
        };
      });
    },
    []
  );

  const deleteTransaction = useCallback((bank: 'hdfc' | 'postal', transactionId: string) => {
    setData((prev) => {
      const transactionIndex = prev[bank].transactions.findIndex((t) => t.id === transactionId);
      if (transactionIndex === -1) return prev;

      const transaction = prev[bank].transactions[transactionIndex];
      let newBalance = prev[bank].balance;

      // Reverse the transaction effect on balance
      if (transaction.type === 'expense') {
        newBalance += transaction.amount;
      } else {
        newBalance -= transaction.amount;
      }

      const newTransactions = prev[bank].transactions.filter((t) => t.id !== transactionId);

      // Recalculate balances for remaining transactions after the deleted one
      let runningBalance = newBalance;
      for (let i = transactionIndex; i < newTransactions.length; i++) {
        if (newTransactions[i].type === 'expense') {
          runningBalance -= newTransactions[i].amount;
        } else {
          runningBalance += newTransactions[i].amount;
        }
        newTransactions[i] = { ...newTransactions[i], balance: runningBalance };
      }

      return {
        ...prev,
        [bank]: {
          balance: newBalance,
          transactions: newTransactions,
        },
      };
    });
  }, []);

  const addSplitExpense = useCallback((expense: Omit<SplitExpense, 'id'>) => {
    setData((prev) => {
      const newExpense: SplitExpense = {
        ...expense,
        id: Date.now().toString(),
      };

      return {
        ...prev,
        splits: {
          ...prev.splits,
          expenses: [...prev.splits.expenses, newExpense],
          pending: prev.splits.pending + expense.total,
        },
      };
    });
  }, []);

  const toggleParticipantSettlement = useCallback(
    (expenseId: string, participantIndex: number) => {
      setData((prev) => {
        const expenseIndex = prev.splits.expenses.findIndex((e) => e.id === expenseId);
        if (expenseIndex === -1) return prev;

        const expense = prev.splits.expenses[expenseIndex];
        const participant = expense.participants[participantIndex];
        const wasSettled = participant.settled;

        const updatedParticipants = [...expense.participants];
        updatedParticipants[participantIndex] = {
          ...participant,
          settled: !wasSettled,
        };

        const updatedExpenses = [...prev.splits.expenses];
        updatedExpenses[expenseIndex] = {
          ...expense,
          participants: updatedParticipants,
        };

        return {
          ...prev,
          splits: {
            expenses: updatedExpenses,
            pending: wasSettled
              ? prev.splits.pending + participant.share
              : prev.splits.pending - participant.share,
            settled: wasSettled
              ? prev.splits.settled - participant.share
              : prev.splits.settled + participant.share,
          },
        };
      });
    },
    []
  );

  const getFinancialSummary = useCallback(() => {
    const allTransactions = [
      ...data.hdfc.transactions.map((t) => ({ ...t, account: 'HDFC Bank' })),
      ...data.postal.transactions.map((t) => ({ ...t, account: 'Postal Bank' })),
    ];

    const totalBalance = data.hdfc.balance + data.postal.balance;
    
    const expenses = allTransactions.filter((t) => t.type === 'expense');
    const income = allTransactions.filter((t) => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((t) => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }));

    // Recent transactions
    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalBalance,
      hdfcBalance: data.hdfc.balance,
      postalBalance: data.postal.balance,
      totalExpenses,
      totalIncome,
      categoryBreakdown: sortedCategories,
      recentTransactions,
      splitsPending: data.splits.pending,
      splitsSettled: data.splits.settled,
      transactionCount: allTransactions.length,
    };
  }, [data]);

  return {
    data,
    isLoaded,
    setBalance,
    addTransaction,
    deleteTransaction,
    addSplitExpense,
    toggleParticipantSettlement,
    getFinancialSummary,
  };
};
