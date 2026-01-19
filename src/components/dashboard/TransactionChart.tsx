import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '@/components/FinanceContext';

export const TransactionChart: React.FC = () => {
  const { data } = useFinance();

  // Combine all transactions
  const allTransactions = [
    ...data.hdfc.transactions,
    ...data.postal.transactions,
  ];

  // Generate last 7 days data
  const today = new Date();
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    const income = allTransactions
      .filter((t) => {
        const transDate = new Date(t.date);
        return (
          transDate.getDate() === date.getDate() &&
          transDate.getMonth() === date.getMonth() &&
          transDate.getFullYear() === date.getFullYear() &&
          t.type === 'income'
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = allTransactions
      .filter((t) => {
        const transDate = new Date(t.date);
        return (
          transDate.getDate() === date.getDate() &&
          transDate.getMonth() === date.getMonth() &&
          transDate.getFullYear() === date.getFullYear() &&
          t.type === 'expense'
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    chartData.push({
      date: dateString,
      Income: income,
      Expense: expense,
    });
  }

  const hasData = chartData.some((d) => d.Income > 0 || d.Expense > 0);

  if (!hasData) {
    return (
      <div className="finance-card p-5 h-80">
        <h3 className="font-semibold mb-4">Transaction History (7 Days)</h3>
        <div className="flex items-center justify-center h-56 text-muted-foreground">
          No transactions in the last 7 days
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card p-5">
      <h3 className="font-semibold mb-4">Transaction History (7 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(value)
            }
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
