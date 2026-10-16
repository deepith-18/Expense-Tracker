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
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: Pill selector & Time horizon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Total Outflow
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Weekly / Monthly / Yearly toggles */}
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
          {(['week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                timeRange === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}ly
            </button>
          ))}
        </div>
      </div>

      {/* Hero Number Display */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <motion.h1
            key={displayValue}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white font-sans"
          >
            {formatCurrency(displayValue, userProfile.currencySymbol, false)}
          </motion.h1>

          {/* Month over month badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isSpendLower
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
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
        </div>

        {/* Time Cost Lens Sub-Hero */}
        {timeCostMode ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 pt-2 text-amber-300 text-sm font-semibold"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Represents <strong className="text-amber-200 underline">{timeCost.formatted}</strong> of your life's work
            </span>
            <button
              onClick={() => setTimeCostMode(false)}
              className="text-xs text-slate-400 hover:text-slate-200 underline ml-2"
            >
              (revert to ₹)
            </button>
          </motion.div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-400">
            Total recorded spending for October 2026 across all accounts and cards
          </p>
        )}
      </div>

      {/* Income vs Outflow Balance Bar */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
            Total Inflow
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-400">
            +{formatCurrency(summary.incomeThisMonth, userProfile.currencySymbol)}
          </span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
            Net Savings
          </span>
          <span
            className={`text-base sm:text-lg font-bold ${
              summary.incomeThisMonth >= summary.spentThisMonth ? 'text-teal-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(summary.incomeThisMonth - summary.spentThisMonth, userProfile.currencySymbol)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">
            Monthly Target
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-200">
            {formatCurrency(userProfile.overallMonthlyBudget, userProfile.currencySymbol)}
          </span>
        </div>
      </div>
    </div>
  );
};
