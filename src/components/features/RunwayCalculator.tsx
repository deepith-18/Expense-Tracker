import React, { useState } from 'react';
import {
  Compass,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

export const RunwayCalculator: React.FC = () => {
  const { accounts, transactions, userProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);
  const [extraCut, setExtraCut] = useState<number>(0);

  // Total liquid assets (bank + cash + wallet balances)
  const totalLiquid = accounts.reduce((sum, acc) => {
    return sum + (acc.balance || 0);
  }, 0);

  // Baseline monthly burn rate
  const baseMonthlyBurn = summary.spentThisMonth > 0
    ? summary.projectedMonthEndSpend
    : userProfile.overallMonthlyBudget || 4500;

  // Adjusted burn with extra cut
  const effectiveBurn = Math.max(100, Math.round(baseMonthlyBurn * (1 - extraCut / 100)));

  // Runway in months
  const runwayMonths = totalLiquid > 0 ? (totalLiquid / effectiveBurn).toFixed(1) : '0.0';

  // Target milestones
  const oneMonthTarget = effectiveBurn;
  const threeMonthTarget = effectiveBurn * 3;
  const sixMonthTarget = effectiveBurn * 6;

  const getMilestoneProgress = (target: number) => {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((totalLiquid / target) * 100));
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Independence Runway
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Survival cushion and milestone targets based on liquid cash
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Liquid Capital
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalLiquid, userProfile.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Big Runway Number */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Current Emergency Runway
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {runwayMonths}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Months
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
            Effective Monthly Burn
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {formatCurrency(effectiveBurn, userProfile.currencySymbol)}/mo
          </span>
        </div>
      </div>

      {/* Emergency Fund Milestones */}
      <div className="space-y-3 mb-4">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Emergency Fund Milestones
        </span>

        {/* 1 Month */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              1-Month Starter Cushion ({formatCurrency(oneMonthTarget, userProfile.currencySymbol)})
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {getMilestoneProgress(oneMonthTarget)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${getMilestoneProgress(oneMonthTarget)}%` }}
            />
          </div>
        </div>

        {/* 3 Months */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              3-Month Stability Fund ({formatCurrency(threeMonthTarget, userProfile.currencySymbol)})
            </span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {getMilestoneProgress(threeMonthTarget)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-700"
              style={{ width: `${getMilestoneProgress(threeMonthTarget)}%` }}
            />
          </div>
        </div>

        {/* 6 Months */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              6-Month Freedom Fortress ({formatCurrency(sixMonthTarget, userProfile.currencySymbol)})
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {getMilestoneProgress(sixMonthTarget)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${getMilestoneProgress(sixMonthTarget)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Burn Reduction Slider */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Simulate Spending Cutback:
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {extraCut}% reduction
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={extraCut}
          onChange={(e) => setExtraCut(Number(e.target.value))}
          className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
