import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFinance } from '@/components/FinanceContext';

const COLORS = [
  'hsl(220, 60%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(40, 85%, 55%)',
  'hsl(15, 80%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(190, 70%, 45%)',
  'hsl(330, 60%, 55%)',
  'hsl(100, 50%, 45%)',
  'hsl(60, 70%, 50%)',
];

export const ExpenseChart: React.FC = () => {
  const { getFinancialSummary } = useFinance();
  const summary = getFinancialSummary();

  const data = summary.categoryBreakdown.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="finance-card p-5 h-80">
        <h3 className="font-semibold mb-4">Expense Breakdown</h3>
        <div className="flex items-center justify-center h-56 text-muted-foreground">
          No expenses recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card p-5">
      <h3 className="font-semibold mb-4">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
