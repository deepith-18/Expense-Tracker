import React, { useMemo } from 'react';
import {
  CalendarDays,
  Flame,
  Coffee,
  PartyPopper,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const DayOfWeekSpendingChart: React.FC = () => {
  const { transactions, userProfile, isDarkMode } = useExpenseStore();

  const daysData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date) {
        const d = new Date(tx.date);
        const dayIdx = d.getDay();
        if (!isNaN(dayIdx)) {
          totals[dayIdx] += tx.amount;
          counts[dayIdx] += 1;
        }
      }
    });

    const maxTotal = Math.max(...totals, 1);
    const peakIdx = totals.indexOf(Math.max(...totals));

    const totalExpense = totals.reduce((a, b) => a + b, 0);
    const weekendTotal = totals[0] + totals[6];
    const weekdayTotal = totals.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekendPct = totalExpense > 0 ? Math.round((weekendTotal / totalExpense) * 100) : 35;

    return {
      days: dayNames.map((name, i) => ({
        name,
        total: totals[i],
        count: counts[i],
        pctOfMax: Math.round((totals[i] / maxTotal) * 100),
        isPeak: i === peakIdx && totals[i] > 0,
      })),
      peakDay: dayNames[peakIdx],
      peakAmount: totals[peakIdx],
      weekendPct,
    };
  }, [transactions]);

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-all ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-800 shadow-glass' 
        : 'bg-white border-slate-200 shadow-glass-light'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Weekly Spending Rhythm
            </h3>
            <p className="text-xs text-slate-400">Discover which days you spend the most</p>
          </div>
        </div>

        {daysData.peakAmount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Peak: {daysData.peakDay}</span>
          </div>
        )}
      </div>

      {/* Bar Chart Display */}
      <div className="space-y-2.5 pt-2">
        {daysData.days.map((item) => (
          <div key={item.name} className="flex items-center gap-3 text-xs">
            {/* Day Label */}
            <span className={`w-8 font-bold ${item.isPeak ? 'text-amber-400' : 'text-slate-400'}`}>
              {item.name}
            </span>

            {/* Progress Bar Container */}
            <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-950/40 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800/80 overflow-hidden relative">
              <div
                className={`h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2 ${
                  item.isPeak
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-gradient-to-r from-indigo-500/80 to-indigo-400/80'
                }`}
                style={{ width: `${Math.max(item.pctOfMax, item.total > 0 ? 8 : 2)}%` }}
              />
            </div>

            {/* Amount */}
            <span className={`w-20 text-right font-mono font-semibold ${item.isPeak ? 'text-amber-600 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatCurrency(item.total, userProfile.currencySymbol)}
            </span>
          </div>
        ))}
      </div>

      {/* Habit Insights Footer */}
      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-3 text-xs">
        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <PartyPopper className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Weekend Share</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{daysData.weekendPct}% of Outflows</p>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Coffee className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Weekday Average</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{100 - daysData.weekendPct}% of Outflows</p>
          </div>
        </div>
      </div>
    </div>
  );
};
