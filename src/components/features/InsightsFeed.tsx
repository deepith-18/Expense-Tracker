import React from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Tag,
  CreditCard,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary, generateSmartInsights } from '../../lib/insightsEngine';

export const InsightsFeed: React.FC = () => {
  const { transactions, categories, userProfile } = useExpenseStore();
  const summary = calculateMonthSummary(transactions, userProfile);
  const insights = generateSmartInsights(transactions, categories, summary, userProfile.currencySymbol);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-rose-950/20',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: AlertTriangle,
          iconColor: 'text-rose-400',
        };
      case 'medium':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-950/20',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: Zap,
          iconColor: 'text-amber-400',
        };
      case 'success':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/20',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
      default:
        return {
          border: 'border-indigo-500/30',
          bg: 'bg-indigo-950/20',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          icon: Sparkles,
          iconColor: 'text-indigo-400',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Smart Financial Signals</span>
        </h3>
        <span className="text-xs text-slate-500">{insights.length} active alerts</span>
      </div>

      {insights.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No active financial anomalies detected. Your budget is cruising safely!
        </div>
      ) : (
        insights.map((ins) => {
          const style = getSeverityStyle(ins.severity);
          const Icon = style.icon;

          return (
            <div
              key={ins.id}
              className={`p-4 rounded-2xl border ${style.border} ${style.bg} bg-slate-900/60 backdrop-blur-md flex items-start gap-3.5 transition-all hover:bg-slate-900/80`}
            >
              <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 ${style.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                    {ins.title}
                  </h4>
                  {ins.metric && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {ins.metric}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
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
