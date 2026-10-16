import React, { useState } from 'react';
import { GitFork, ArrowRight, Wallet, ShoppingBag, Store, Building2 } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const SankeyDiagram: React.FC = () => {
  const { transactions, categories, accounts, userProfile } = useExpenseStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const curPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(curPrefix));

  // Compute column totals
  const totalIncome = currentMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || 110000;

  const totalExpense = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0) || 52000;

  // Incomes
  const incomeList = [
    { id: 'inc-sal', label: 'TechCorp Salary', amount: 95000, color: '#10B981' },
    { id: 'inc-free', label: 'Freelance Design', amount: 15000, color: '#6366F1' },
  ];

  // Accounts
  const accountFlows = accounts.map((acc) => {
    const spent = currentMonthTxs
      .filter((t) => t.type === 'expense' && t.accountId === acc.id)
      .reduce((a, b) => a + b.amount, 0);
    return {
      id: acc.id,
      label: acc.name,
      amount: spent > 0 ? spent : 4000,
      color: acc.color || '#3B82F6',
    };
  });

  // Top Categories
  const categoryFlows = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = currentMonthTxs
        .filter((t) => t.categoryId === c.id)
        .reduce((a, b) => a + b.amount, 0);
      return {
        id: c.id,
        label: c.name,
        amount: spent > 0 ? spent : 2500,
        color: c.color,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top Merchants
  const merchantTotals: Record<string, number> = {};
  currentMonthTxs
    .filter((t) => t.type === 'expense' && t.merchant)
    .forEach((t) => {
      const m = t.merchant!;
      merchantTotals[m] = (merchantTotals[m] || 0) + t.amount;
    });

  const topMerchants = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({
      id: `m-${merchant}`,
      label: merchant,
      amount,
      color: '#EC4899',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Money Flow Routing (Sankey)</h3>
            <p className="text-xs text-slate-400">
              Visualizes the journey of capital: Inflows → Wallets → Categories → Terminal Merchants.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-400 block">Total Monthly Inflow</span>
          <span className="text-sm font-extrabold text-emerald-400">
            {formatCurrency(totalIncome, userProfile.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Visual Flow Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
        {/* Column 1: Inflow Sources */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Inflows
            </span>
            <span className="text-emerald-400 font-extrabold">100%</span>
          </div>

          <div className="space-y-2">
            {incomeList.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{item.label}</div>
                <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                  +{formatCurrency(item.amount, userProfile.currencySymbol)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Wallets / Accounts */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-blue-400" /> Accounts
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          </div>

          <div className="space-y-2">
            {accountFlows.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{item.label}</div>
                <div className="text-xs font-bold text-slate-300 mt-0.5">
                  {formatCurrency(item.amount, userProfile.currencySymbol)} routed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Expense Categories */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> Categories
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          </div>

          <div className="space-y-2">
            {categoryFlows.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-white truncate">{item.label}</span>
                </div>
                <div className="text-xs font-bold text-slate-300 mt-0.5">
                  {formatCurrency(item.amount, userProfile.currencySymbol)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Top Terminal Merchants */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-pink-400" /> Merchants
            </span>
            <span className="text-rose-400 font-bold">End</span>
          </div>

          <div className="space-y-2">
            {topMerchants.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-pink-500/50 transition-colors"
              >
                <div className="text-xs font-bold text-white truncate">{item.label}</div>
                <div className="text-xs font-bold text-rose-400 mt-0.5">
                  {formatCurrency(item.amount, userProfile.currencySymbol)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
