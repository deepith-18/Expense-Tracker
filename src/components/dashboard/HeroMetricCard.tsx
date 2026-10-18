import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency, calculateTimeCost } from '../../lib/currency';

export const HeroMetricCard: React.FC = () => {
  const {
    transactions,
    userProfile,
    timeRange,
    setTimeRange,
    timeCostMode,
    setTimeCostMode,
  } = useExpenseStore();

  const summary = calculateMonthSummary(transactions, userProfile);

  // Time-Cost calculation
  const timeCost = calculateTimeCost(
    summary.spentThisMonth,
    userProfile.monthlyIncome,
    userProfile.workHoursPerMonth
  );

  // Animated Count-Up state
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = summary.spentThisMonth;
    const duration = 800; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const stepAmount = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += stepAmount;
      if ((stepAmount > 0 && start >= end) || (stepAmount <= 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [summary.spentThisMonth]);

  const isSpendLower = summary.changePercentage <= 0;

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass">
      {/* Top row: Selector & Time horizon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Spending
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} • All accounts
          </span>
        </div>

        {/* Weekly / Monthly / Yearly toggles */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
          {(['week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                timeRange === r
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {r === 'week' ? 'Week' : r === 'month' ? 'Month' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Number Display */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <motion.h1
            key={displayValue}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-sans"
          >
            {formatCurrency(displayValue, userProfile.currencySymbol, false)}
          </motion.h1>

          {/* Month over month badge */}
          {summary.spentLastMonth > 0 ? (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isSpendLower
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {isSpendLower ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>
                {Math.abs(summary.changePercentage)}% {isSpendLower ? 'less' : 'more'} vs last month
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span>Current Cycle</span>
            </div>
          )}
        </div>

        {/* Time Cost Lens Sub-Hero */}
        {timeCostMode ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 pt-1 text-amber-600 dark:text-amber-300 text-sm font-medium"
          >
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>
              Equivalent to <strong className="text-amber-700 dark:text-amber-200 font-bold">{timeCost.formatted}</strong> of your working hours
            </span>
            <button
              onClick={() => setTimeCostMode(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline ml-2 cursor-pointer"
            >
              (switch back)
            </button>
          </motion.div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Total recorded outflow across bank accounts, UPI wallets, and cards
          </p>
        )}
      </div>

      {/* Income vs Outflow Balance Bar */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium mb-1">
            Total Income
          </span>
          <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(summary.incomeThisMonth, userProfile.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium mb-1">
            Net Savings
          </span>
          <span
            className={`text-lg sm:text-xl font-bold ${
              summary.incomeThisMonth >= summary.spentThisMonth ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(summary.incomeThisMonth - summary.spentThisMonth, userProfile.currencySymbol)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-medium mb-1">
            Monthly Target Budget
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(userProfile.overallMonthlyBudget, userProfile.currencySymbol)}
          </span>
        </div>
      </div>
    </div>
  );
};
