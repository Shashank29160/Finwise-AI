import React, { useState } from 'react';
import { FinanceProvider } from '@/components/FinanceContext';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { BankSection } from '@/components/bank/BankSection';
import { SplitExpenses } from '@/components/splits/SplitExpenses';
import { AIChat } from '@/components/ai/AIChat';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="container mx-auto px-4 py-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'hdfc' && <BankSection bank="hdfc" title="HDFC Bank Transactions" />}
          {activeTab === 'postal' && <BankSection bank="postal" title="Postal Bank Transactions" />}
          {activeTab === 'splits' && <SplitExpenses />}
          {activeTab === 'ai-advisor' && <AIChat />}
        </main>
      </div>
    </FinanceProvider>
  );
};

export default Index;
