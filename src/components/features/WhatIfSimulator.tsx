import React, { useState } from 'react';
import { Calculator, TrendingUp, Clock, PlusCircle } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency, calculateTimeCost } from '../../lib/currency';

export const WhatIfSimulator: React.FC = () => {
  const { transactions, categories, userProfile, setKeypadOpen } = useExpenseStore();

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  // Derive active expense categories with real spend
  const activeCategories = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = currentMonthExpenses
        .filter((t) => t.categoryId === c.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...c,
        spent,
      };
    })
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Store reduction percentages per category id: Record<string, number>
  const [cuts, setCuts] = useState<Record<string, number>>({
    'cat-food': 25,
    'cat-shopping': 20,
    'cat-entertainment': 20,
    'cat-commute': 15,
  });

  const getCutPercentage = (catId: string) => cuts[catId] ?? 20;

  const handleCutChange = (catId: string, value: number) => {
    setCuts((prev) => ({ ...prev, [catId]: value }));
  };

  // Calculate actual total monthly saved based on active categories
  const totalMonthlySaved = activeCategories.reduce((acc, cat) => {
    const cutPct = getCutPercentage(cat.id);
    return acc + Math.round((cat.spent * cutPct) / 100);
  }, 0);

  const yearlySaved = totalMonthlySaved * 12;

  // 5-Year compounding SIP calculation at 12% annual return (r = 0.01 per month, n = 60 months)
  const r = 0.12 / 12;
  const n = 60;
  const futureValue5Years = totalMonthlySaved > 0
    ? Math.round(totalMonthlySaved * ((Math.pow(1 + r, n) - 1) / r) * (1 + r))
    : 0;

  // Time recovered (hours of life work saved)
  const timeRecovered = calculateTimeCost(
    totalMonthlySaved,
    userProfile.monthlyIncome,
    userProfile.workHoursPerMonth
  );

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Savings Projection Simulator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust spending reduction targets on your real expenses to see monthly, annual, and 5-year investment impact.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Saved */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Monthly Potential Savings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block">
            +{formatCurrency(totalMonthlySaved, userProfile.currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-300 font-medium mt-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>
              {totalMonthlySaved > 0 && userProfile.monthlyIncome > 0
                ? `Saves ${timeRecovered.formatted} of work hours`
                : 'Based on your actual logged spend'}
            </span>
          </div>
        </div>

        {/* 1 Year Saved */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            1-Year Cumulative Capital
          </span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1.5 block">
            +{formatCurrency(yearlySaved, userProfile.currencySymbol)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 block">
            Direct retained cash over 12 months
          </span>
        </div>

        {/* 5 Year Compounding at 12% */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-500/30">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider block">
            5-Year Invested Growth (12% Return)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 block">
            {formatCurrency(futureValue5Years, userProfile.currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-300 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>
              {futureValue5Years > 0
                ? `+${formatCurrency(futureValue5Years - totalMonthlySaved * 60, userProfile.currencySymbol)} compounding growth`
                : 'Projected with 12% annual SIP return'}
            </span>
          </div>
        </div>
      </div>

      {/* Sliders Section */}
      {activeCategories.length === 0 ? (
        <div className="p-10 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">No Expense Categories Recorded Yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Once you log transactions in categories like Food, Commute, or Shopping, this simulator will automatically activate sliders for your real expenses so you can test realistic cutbacks.
          </p>
          <button
            onClick={() => setKeypadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow hover:bg-emerald-400 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add an Expense</span>
          </button>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Adjust Target Cutbacks on Active Categories
          </h4>

          <div className="space-y-3">
            {activeCategories.map((cat) => {
              const currentCut = getCutPercentage(cat.id);
              const catSaved = Math.round((cat.spent * currentCut) / 100);

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2"
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cat.name} (Logged Spend: {formatCurrency(cat.spent, userProfile.currencySymbol)})
                      </span>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {currentCut}% ({formatCurrency(catSaved, userProfile.currencySymbol)}/mo)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={currentCut}
                    onChange={(e) => handleCutChange(cat.id, Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
