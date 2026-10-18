import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Check,
  TrendingDown,
  Edit2,
  X,
  Plus,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';
import { IconHelper } from '../common/IconHelper';

export const BudgetGuardCard: React.FC = () => {
  const { categories, transactions, userProfile, updateCategoryBudget } = useExpenseStore();
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'warning' | 'overspent'>('all');

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute spend and status per category
  const categoryStats = expenseCategories.map((cat) => {
    const spent = currentMonthExpenses
      .filter((t) => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = cat.monthlyBudget || 0;
    const ratio = budget > 0 ? spent / budget : 0;
    const percentage = Math.round(ratio * 100);
    const remaining = budget - spent;

    let status: 'safe' | 'warning' | 'overspent' = 'safe';
    if (ratio > 1) status = 'overspent';
    else if (ratio >= 0.75) status = 'warning';

    return {
      ...cat,
      spent,
      budget,
      percentage,
      remaining,
      status,
    };
  });

  const overspentCount = categoryStats.filter((c) => c.status === 'overspent').length;
  const warningCount = categoryStats.filter((c) => c.status === 'warning').length;

  const filteredStats = categoryStats.filter((c) => {
    if (filterMode === 'overspent') return c.status === 'overspent';
    if (filterMode === 'warning') return c.status === 'warning' || c.status === 'overspent';
    return true;
  });

  const handleStartEdit = (catId: string, currentBudget: number) => {
    setEditingCatId(catId);
    setTempBudget(String(currentBudget));
  };

  const handleSaveBudget = (catId: string) => {
    const num = Math.max(0, parseInt(tempBudget, 10) || 0);
    updateCategoryBudget(catId, num);
    setEditingCatId(null);
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
            {overspentCount > 0 ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Budget Guard
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live pacing against monthly category limits
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({categoryStats.length})
          </button>
          <button
            onClick={() => setFilterMode('warning')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'warning'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Near Cap ({warningCount})
          </button>
          <button
            onClick={() => setFilterMode('overspent')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'overspent'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Overspent ({overspentCount})
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {filteredStats.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No categories matching this filter criteria.
          </div>
        ) : (
          filteredStats.map((cat) => {
            const isEditing = editingCatId === cat.id;
            const barWidth = Math.min(100, cat.percentage);

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <IconHelper name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          placeholder="Budget"
                          className="w-20 px-2 py-0.5 text-xs font-bold rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                          title="Save"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrency(cat.spent, userProfile.currencySymbol)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          / {formatCurrency(cat.budget, userProfile.currencySymbol)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(cat.id, cat.budget)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Edit Category Budget"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.status === 'overspent'
                        ? 'bg-rose-500'
                        : cat.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Status subtext */}
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={
                      cat.status === 'overspent'
                        ? 'text-rose-500 dark:text-rose-400 font-semibold'
                        : cat.status === 'warning'
                        ? 'text-amber-500 dark:text-amber-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {cat.status === 'overspent'
                      ? `Exceeded by ${formatCurrency(Math.abs(cat.remaining), userProfile.currencySymbol)}`
                      : cat.status === 'warning'
                      ? `${cat.percentage}% spent • ${formatCurrency(cat.remaining, userProfile.currencySymbol)} cushion`
                      : `${cat.percentage}% spent • ${formatCurrency(cat.remaining, userProfile.currencySymbol)} left`}
                  </span>

                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      cat.status === 'overspent'
                        ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20'
                        : cat.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {cat.status === 'overspent'
                      ? 'ALERT'
                      : cat.status === 'warning'
                      ? 'CAUTION'
                      : 'OK'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
