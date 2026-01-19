import React from 'react';
import { BalanceCards } from './BalanceCards';
import { ExpenseChart } from './ExpenseChart';
import { TransactionChart } from './TransactionChart';
import { RecentTransactions } from './RecentTransactions';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-1">Financial Summary</h2>
        <p className="text-muted-foreground">Overview of your finances</p>
      </div>

      <BalanceCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <TransactionChart />
      </div>

      <RecentTransactions />
    </div>
  );
};
