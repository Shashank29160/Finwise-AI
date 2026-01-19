import React, { useState } from 'react';
import { Building2, Mail, Users, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import { useFinance } from '@/components/FinanceContext';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const BalanceCards: React.FC = () => {
  const { data, setBalance } = useFinance();
  const [editModal, setEditModal] = useState<{ open: boolean; bank: 'hdfc' | 'postal' | null }>({
    open: false,
    bank: null,
  });
  const [balanceInput, setBalanceInput] = useState('');

  const openEditModal = (bank: 'hdfc' | 'postal') => {
    setBalanceInput(data[bank].balance.toString());
    setEditModal({ open: true, bank });
  };

  const handleSaveBalance = () => {
    if (editModal.bank) {
      setBalance(editModal.bank, parseFloat(balanceInput) || 0);
      setEditModal({ open: false, bank: null });
    }
  };

  const totalBalance = data.hdfc.balance + data.postal.balance;
  const isPositive = totalBalance >= 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div className="finance-card p-5 col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary to-primary/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary-foreground/80 text-sm font-medium">Total Balance</span>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-accent" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-3xl font-bold text-primary-foreground font-mono-nums">
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {/* HDFC Card */}
        <div className="finance-card p-5 balance-card-hdfc">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground text-sm font-medium">HDFC Bank</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEditModal('hdfc')}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-2xl font-bold font-mono-nums">
            {formatCurrency(data.hdfc.balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.hdfc.transactions.length} transactions
          </p>
        </div>

        {/* Postal Card */}
        <div className="finance-card p-5 balance-card-postal">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground text-sm font-medium">Postal Bank</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEditModal('postal')}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-2xl font-bold font-mono-nums">
            {formatCurrency(data.postal.balance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.postal.transactions.length} transactions
          </p>
        </div>

        {/* Splits Card */}
        <div className="finance-card p-5 balance-card-split">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground text-sm font-medium">Split Expenses</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Pending</span>
              <span className="text-sm font-semibold text-expense font-mono-nums">
                {formatCurrency(data.splits.pending)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Settled</span>
              <span className="text-sm font-semibold text-income font-mono-nums">
                {formatCurrency(data.splits.settled)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Balance Modal */}
      <Dialog open={editModal.open} onOpenChange={(open) => setEditModal({ open, bank: editModal.bank })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Set {editModal.bank === 'hdfc' ? 'HDFC' : 'Postal'} Bank Balance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Initial Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                placeholder="Enter balance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal({ open: false, bank: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveBalance}>Save Balance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
