import React from 'react';
import { Flame, Target, AlertTriangle } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

export const BurnRateGauge: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);

  const budget = userProfile.overallMonthlyBudget || 55000;
  const projected = summary.projectedMonthEndSpend;
  const ratio = projected / budget;
  const percentage = Math.round(ratio * 100);

  // Status calculation
  let color = 'from-emerald-500 to-teal-400';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let label = 'On Track';

  if (ratio > 1.15) {
    color = 'from-rose-500 to-red-600';
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    label = 'Over-Budget Burn';
  } else if (ratio > 0.95) {
    color = 'from-amber-500 to-orange-500';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    label = 'Near Ceiling';
  }

  // Arc calculation for semi-circle gauge (0% to 150%)
  const gaugePercent = Math.min(100, (percentage / 150) * 100);
  const strokeDashoffset = 251.2 - (251.2 * gaugePercent) / 100;

  return (
    <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Burn Rate Velocity</h3>
            <span className="text-xs text-slate-400">Trajectory vs Budget</span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          {label}
        </span>
      </div>

      {/* Center Gauge Arc */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <svg className="w-44 h-24 overflow-visible" viewBox="0 0 100 55">
          {/* Background Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Dynamic Progress Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={ratio > 1.15 ? '#F43F5E' : ratio > 0.95 ? '#F59E0B' : '#10B981'}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset={Math.max(0, 125.6 - (125.6 * Math.min(100, percentage)) / 100)}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="text-center -mt-8">
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatCurrency(projected, userProfile.currencySymbol)}
          </span>
          <span className="block text-[11px] text-slate-400 font-medium">
            Projected Month-End ({percentage}% of cap)
          </span>
        </div>
      </div>

      {/* Comparison footer */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Target className="w-3.5 h-3.5 text-slate-500" />
          <span>Budget: {formatCurrency(budget, userProfile.currencySymbol)}</span>
        </div>
        <span className={ratio > 1 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
          {ratio > 1
            ? `+${formatCurrency(projected - budget, userProfile.currencySymbol)} surplus spend`
            : `${formatCurrency(budget - projected, userProfile.currencySymbol)} under budget`}
        </span>
      </div>
    </div>
  );
};
