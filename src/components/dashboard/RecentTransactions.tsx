import React from 'react';
import { Trash2 } from 'lucide-react';
import { useFinance } from '@/components/FinanceContext';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const RecentTransactions: React.FC = () => {
  const { getFinancialSummary, deleteTransaction } = useFinance();
  const summary = getFinancialSummary();

  if (summary.recentTransactions.length === 0) {
    return (
      <div className="finance-card p-5">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No transactions recorded yet
        </div>
      </div>
    );
  }

  const handleDelete = (transaction: any) => {
    const bank = transaction.account === 'HDFC Bank' ? 'hdfc' : 'postal';
    deleteTransaction(bank, transaction.id);
  };

  return (
    <div className="finance-card p-5">
      <h3 className="font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.recentTransactions.map((transaction: any) => (
              <TableRow key={transaction.id} className="animate-fade-in">
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="text-sm">{transaction.account}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-muted rounded-full">
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono-nums font-medium',
                    transaction.type === 'expense' ? 'text-expense' : 'text-income'
                  )}
                >
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(transaction)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
