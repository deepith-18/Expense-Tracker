import React from 'react';
import { ShieldCheck, Calendar, AlertCircle } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

export const DailySafeSpend: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);

  const isSafe = summary.safeToSpendDaily > 500;
  const isTight = summary.safeToSpendDaily > 0 && summary.safeToSpendDaily <= 500;
  const isExceeded = summary.safeToSpendDaily <= 0;

  const targetDailyAverage = Math.round(userProfile.overallMonthlyBudget / summary.totalDaysInMonth);
  const percentageOfTarget = targetDailyAverage > 0 ? Math.round((summary.safeToSpendDaily / targetDailyAverage) * 100) : 100;

  return (
    <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Daily Safe-To-Spend</h3>
            <span className="text-xs text-slate-400">Guaranteed budget safety</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{summary.daysRemaining} days left</span>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-400">/ day</span>
        </div>

        <p className="text-xs text-slate-400 mt-1">
          {isExceeded ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Monthly budget cap surpassed. Tap into reserves.
            </span>
          ) : isTight ? (
            <span className="text-amber-400 font-medium">
              Budget is tight for the remaining {summary.daysRemaining} days. Keep discretionary low.
            </span>
          ) : (
            <span>
              Spend up to this amount every single day without overshooting your{' '}
              <strong className="text-slate-200">{formatCurrency(userProfile.overallMonthlyBudget, userProfile.currencySymbol)}</strong> limit.
            </span>
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1.5">
          <span>Daily Allowance Pace</span>
          <span className={percentageOfTarget >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
            {percentageOfTarget}% of ideal pace
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isExceeded
                ? 'bg-rose-500 w-full'
                : percentageOfTarget >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, percentageOfTarget))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
