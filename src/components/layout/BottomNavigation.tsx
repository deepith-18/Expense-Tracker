import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Sparkles,
  GitFork,
  Calculator,
  Users,
} from 'lucide-react';
import { useExpenseStore, ActiveTab } from '../../store/useExpenseStore';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, setKeypadOpen } = useExpenseStore();

  const navItems: { tab: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { tab: 'transactions', label: 'Transactions', icon: ReceiptText },
    { tab: 'insights', label: 'Insights', icon: Sparkles },
    { tab: 'simulator', label: 'Simulator', icon: Calculator },
    { tab: 'sankey', label: 'Flow', icon: GitFork },
    { tab: 'split', label: 'Split', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around safe-bottom">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Center Keypad Button */}
      <div className="-mt-6">
        <button
          onClick={() => setKeypadOpen(true)}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/40 active:scale-90 transition-transform border-4 border-slate-950"
          title="Quick Add Expense"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {navItems.slice(2, 5).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
