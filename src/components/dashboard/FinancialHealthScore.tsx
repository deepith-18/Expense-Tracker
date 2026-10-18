import React from 'react';
import {
  ShieldCheck,
  Zap,
  Target,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

export const FinancialHealthScore: React.FC = () => {
  const { transactions, userProfile, categories, isDarkMode } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);

  // Compute a comprehensive score from 0 to 100
  const monthlyIncome = userProfile.monthlyIncome || 60000;
  const currentSpend = summary.spentThisMonth;
  const spendRatio = monthlyIncome > 0 ? currentSpend / monthlyIncome : 0.8;
  const savingsRate = Math.max(0, Math.min(100, Math.round(((monthlyIncome - currentSpend) / monthlyIncome) * 100)));

  const burnRatePct = summary.burnRateRatio * 100;

  // Score formulation
  let rawScore = 50;
  if (spendRatio < 0.5) rawScore += 35;
  else if (spendRatio < 0.75) rawScore += 20;
  else if (spendRatio < 0.9) rawScore += 5;
  else rawScore -= 20;

  if (burnRatePct <= 100) rawScore += 15;
  else rawScore -= 15;

  const score = Math.max(15, Math.min(99, rawScore));

  const tier =
    score >= 85
      ? { label: 'Zen Master', color: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10 border-emerald-500/20', desc: 'Outstanding cash control and savings discipline!' }
      : score >= 70
      ? { label: 'Healthy & Balanced', color: 'text-indigo-400', stroke: '#6366f1', bg: 'bg-indigo-500/10 border-indigo-500/20', desc: 'Good financial pace. Safe daily limits are respected.' }
      : score >= 50
      ? { label: 'Attention Advised', color: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20', desc: 'High spend velocity. Keep daily discretionary costs low.' }
      : { label: 'High Burn Rate', color: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-500/10 border-rose-500/20', desc: 'Exceeding target budget. Slow down non-essential expenses.' };

  // Circle stroke calculation (circumference = 2 * PI * r = 2 * 3.14159 * 42 ~= 264)
  const circumference = 264;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-all ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-800 shadow-glass' 
        : 'bg-white border-slate-200 shadow-glass-light'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Financial Health Index
            </h3>
            <p className="text-xs text-slate-400">Real-time financial vitality & sustainability score</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tier.bg} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Main Dial and Vitals Row */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Speedometer Gauge Dial */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke={isDarkMode ? '#1e293b' : '#f1f5f9'}
              strokeWidth="8"
            />
            {/* Animated Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke={tier.stroke}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-3xl font-black tracking-tight ${tier.color}`}>
              {score}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              / 100 Score
            </span>
          </div>
        </div>

        {/* Breakdown Vitals */}
        <div className="flex-1 w-full space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {tier.desc}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <Target className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span>Savings Yield</span>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {savingsRate}%
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>Budget Burn</span>
              </div>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {Math.round(burnRatePct)}%
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <ShieldCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>Daily Safe Limit</span>
              </div>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <TrendingUp className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                <span>Streak</span>
              </div>
              <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {userProfile.streakDays || 5} Days Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Category Budgets Snapshot */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span>Key Category Budget Tracks</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Monthly Targets</span>
        </div>
        <div className="space-y-2">
          {categories.slice(0, 3).map((cat) => {
            const spent = transactions
              .filter((t) => t.categoryId === cat.id && t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);
            const budget = cat.monthlyBudget || 5000;
            const pct = Math.min(100, Math.round((spent / budget) * 100));
            return (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {formatCurrency(spent, userProfile.currencySymbol)} / {formatCurrency(budget, userProfile.currencySymbol)} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
