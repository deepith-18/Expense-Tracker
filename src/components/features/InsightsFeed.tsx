import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Info,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary, generateSmartInsights } from '../../lib/insightsEngine';

export const InsightsFeed: React.FC = () => {
  const { transactions, categories, userProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);
  const insights = generateSmartInsights(
    transactions,
    categories,
    summary,
    userProfile.currencySymbol,
    userProfile.overallMonthlyBudget
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-rose-50 dark:bg-rose-950/20',
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
          icon: AlertTriangle,
          iconColor: 'text-rose-500 dark:text-rose-400',
        };
      case 'medium':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
          icon: AlertTriangle,
          iconColor: 'text-amber-500 dark:text-amber-400',
        };
      case 'success':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-50 dark:bg-emerald-950/20',
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500 dark:text-emerald-400',
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-800',
          bg: 'bg-white dark:bg-slate-900',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: Info,
          iconColor: 'text-blue-500 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Active Observations</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{insights.length} active notices</span>
      </div>

      {insights.length === 0 ? (
        <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          No active financial anomalies detected. Your budget is tracking within expected limits.
        </div>
      ) : (
        insights.map((ins) => {
          const style = getSeverityStyle(ins.severity);
          const Icon = style.icon;

          return (
            <div
              key={ins.id}
              className={`p-4 rounded-xl border ${style.border} ${style.bg} flex items-start gap-3.5 transition-all shadow-sm dark:shadow-none`}
            >
              <div className={`p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 ${style.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ins.title}
                  </h4>
                  {ins.metric && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${style.badge}`}>
                      {ins.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ins.message}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
