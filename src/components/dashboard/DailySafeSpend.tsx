import React, { useState } from 'react';
import { ShieldCheck, Calendar, AlertCircle, Edit3, Check, X } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

export const DailySafeSpend: React.FC = () => {
  const { transactions, userProfile, updateUserProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [tempDailyLimit, setTempDailyLimit] = useState(String(userProfile.dailyBudgetLimit || 150));

  const maxLimit = userProfile.dailyBudgetLimit || 150;
  const isSafe = summary.safeToSpendDaily >= maxLimit * 0.7;
  const isTight = summary.safeToSpendDaily > 0 && summary.safeToSpendDaily < maxLimit * 0.7;
  const isExceeded = summary.safeToSpendDaily <= 0;

  const percentageOfLimit = Math.min(100, Math.round((summary.safeToSpendDaily / maxLimit) * 100));

  const handleSaveDailyLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = Math.abs(parseInt(tempDailyLimit, 10) || 150);
    if (limit > 0) {
      updateUserProfile({
        dailyBudgetLimit: limit,
        overallMonthlyBudget: limit * summary.totalDaysInMonth,
      });
    }
    setIsEditing(false);
  };

  const dailyPresets = [50, 100, 150, 200, 300];

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Safe Allowance</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Paced to stay within your daily ceiling</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{summary.daysRemaining} days left</span>
          </div>

          <button
            onClick={() => {
              setTempDailyLimit(String(userProfile.dailyBudgetLimit || 150));
              setIsEditing(!isEditing);
            }}
            title="Adjust your max daily spending limit"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveDailyLimit} className="my-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Set Max Daily Spending Limit
            </label>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              Monthly: {formatCurrency((parseInt(tempDailyLimit, 10) || 150) * summary.totalDaysInMonth, userProfile.currencySymbol)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 font-bold">
                {userProfile.currencySymbol}
              </span>
              <input
                type="number"
                value={tempDailyLimit}
                onChange={(e) => setTempDailyLimit(e.target.value)}
                placeholder="e.g. 150"
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
            {dailyPresets.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setTempDailyLimit(String(p))}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  parseInt(tempDailyLimit, 10) === p
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {formatCurrency(p, userProfile.currencySymbol)}/day
              </button>
            ))}
          </div>
        </form>
      ) : (
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ day</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Max {formatCurrency(maxLimit, userProfile.currencySymbol)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {isExceeded ? (
              <span className="text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" /> Monthly allocation has been reached. Outflow paused.
              </span>
            ) : isTight ? (
              <span className="text-amber-600 dark:text-amber-300 font-medium">
                Allowance is tight for the remaining {summary.daysRemaining} days. Keep daily spend strictly under {formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}.
              </span>
            ) : (
              <span>
                Capped at a maximum target of{' '}
                <strong className="text-slate-900 dark:text-white font-semibold">{formatCurrency(maxLimit, userProfile.currencySymbol)}/day</strong>{' '}
                ({formatCurrency(userProfile.overallMonthlyBudget, userProfile.currencySymbol)}/month).
              </span>
            )}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
          <span>Safe Daily Pacing</span>
          <span className={percentageOfLimit >= 70 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
            {percentageOfLimit}% of max allowance
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isExceeded
                ? 'bg-rose-500 w-full'
                : percentageOfLimit >= 70
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, percentageOfLimit))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
