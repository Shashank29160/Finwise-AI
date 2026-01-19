import React from 'react';
import { Wallet, Bot, LayoutDashboard, Building2, Mail, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hdfc', label: 'HDFC Bank', icon: Building2 },
  { id: 'postal', label: 'Postal Bank', icon: Mail },
  { id: 'splits', label: 'Split Expenses', icon: Users },
  { id: 'ai-advisor', label: 'AI Advisor', icon: Bot },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Financial Tracker</h1>
          </div>
        </div>

        <nav className="flex gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isAI = tab.id === 'ai-advisor';
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                  isActive
                    ? isAI
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                      : "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isAI && !isActive && (
                  <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-semibold">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
