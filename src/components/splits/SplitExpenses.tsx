import React, { useState } from 'react';
import { Plus, X, Check, Users } from 'lucide-react';
import { useFinance } from '@/components/FinanceContext';
import { formatCurrency, formatDate, getCurrentDateTime } from '@/lib/formatters';
import { CATEGORIES, SplitParticipant } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export const SplitExpenses: React.FC = () => {
  const { data, addSplitExpense, toggleParticipantSettlement } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    total: '',
    date: getCurrentDateTime(),
    category: 'Other',
  });
  const [participants, setParticipants] = useState<{ name: string; share: string }[]>([
    { name: '', share: '' },
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const addParticipant = () => {
    setParticipants([...participants, { name: '', share: '' }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: 'name' | 'share', value: string) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const splitEqually = () => {
    const total = parseFloat(formData.total);
    if (total && participants.length > 0) {
      const share = (total / participants.length).toFixed(2);
      setParticipants(participants.map((p) => ({ ...p, share })));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = parseFloat(formData.total);
    const participantData: SplitParticipant[] = participants.map((p) => ({
      name: p.name,
      share: parseFloat(p.share),
      settled: false,
    }));

    const totalShares = participantData.reduce((sum, p) => sum + p.share, 0);
    if (Math.abs(total - totalShares) > 0.01) {
      alert('The sum of individual shares must equal the total amount.');
      return;
    }

    addSplitExpense({
      description: formData.description,
      total,
      date: formData.date,
      category: formData.category,
      participants: participantData,
    });

    setFormData({
      description: '',
      total: '',
      date: getCurrentDateTime(),
      category: 'Other',
    });
    setParticipants([{ name: '', share: '' }]);
    setShowForm(false);
  };

  const filteredExpenses = [...data.splits.expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((expense) => {
      const allSettled = expense.participants.every((p) => p.settled);
      const status = allSettled ? 'settled' : 'pending';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.participants.some((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });

  // Calculate participant summary
  const participantStats: Record<
    string,
    { totalSplits: number; totalAmount: number; pending: number; settled: number }
  > = {};

  data.splits.expenses.forEach((expense) => {
    expense.participants.forEach((participant) => {
      if (!participantStats[participant.name]) {
        participantStats[participant.name] = {
          totalSplits: 0,
          totalAmount: 0,
          pending: 0,
          settled: 0,
        };
      }
      participantStats[participant.name].totalSplits++;
      participantStats[participant.name].totalAmount += participant.share;
      if (participant.settled) {
        participantStats[participant.name].settled += participant.share;
      } else {
        participantStats[participant.name].pending += participant.share;
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Split Expenses</h2>
          <p className="text-muted-foreground">
            Pending:{' '}
            <span className="font-mono-nums font-semibold text-expense">
              {formatCurrency(data.splits.pending)}
            </span>{' '}
            | Settled:{' '}
            <span className="font-mono-nums font-semibold text-income">
              {formatCurrency(data.splits.settled)}
            </span>
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Split
        </Button>
      </div>

      {showForm && (
        <div className="finance-card p-5 animate-slide-up">
          <h3 className="font-semibold mb-4">New Split Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this expense for?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total Amount (₹)</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  required
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="splitDate">Date</Label>
                <Input
                  id="splitDate"
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="splitCategory">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Participants</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={splitEqually}>
                    Split Equally
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {participants.map((participant, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Name"
                    required
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Share"
                    required
                    value={participant.share}
                    onChange={(e) => updateParticipant(index, 'share', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipant(index)}
                    disabled={participants.length === 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit">Add Split Expense</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Participants Summary */}
      {Object.keys(participantStats).length > 0 && (
        <div className="finance-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Participant</th>
                  <th className="text-center py-2 font-medium">Splits</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  <th className="text-right py-2 font-medium">Pending</th>
                  <th className="text-right py-2 font-medium">Settled</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(participantStats).map(([name, stats]) => (
                  <tr key={name} className="border-b last:border-0">
                    <td className="py-2">{name}</td>
                    <td className="py-2 text-center">{stats.totalSplits}</td>
                    <td className="py-2 text-right font-mono-nums">
                      {formatCurrency(stats.totalAmount)}
                    </td>
                    <td className="py-2 text-right font-mono-nums text-expense">
                      {formatCurrency(stats.pending)}
                    </td>
                    <td className="py-2 text-right font-mono-nums text-income">
                      {formatCurrency(stats.settled)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="finance-card p-5">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No split expenses found
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => {
              const allSettled = expense.participants.every((p) => p.settled);
              return (
                <div
                  key={expense.id}
                  className={cn(
                    'border rounded-lg p-4 transition-all',
                    allSettled
                      ? 'border-l-4 border-l-income'
                      : 'border-l-4 border-l-warning'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{expense.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(expense.date)} • {expense.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono-nums">
                        {formatCurrency(expense.total)}
                      </p>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          allSettled
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        )}
                      >
                        {allSettled ? 'Settled' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    {expense.participants.map((participant, pIndex) => (
                      <div
                        key={pIndex}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={participant.settled}
                            onCheckedChange={() =>
                              toggleParticipantSettlement(expense.id, pIndex)
                            }
                          />
                          <span
                            className={cn(
                              'text-sm',
                              participant.settled && 'line-through text-muted-foreground'
                            )}
                          >
                            {participant.name}
                          </span>
                        </div>
                        <span className="font-mono-nums text-sm">
                          {formatCurrency(participant.share)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
