import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const CalendarHeatmap: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number; count: number } | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentDay = now.getDate();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const curPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Tally spending per day
  const dailySpend: Record<number, { total: number; count: number }> = {};
  for (let d = 1; d <= totalDays; d++) {
    dailySpend[d] = { total: 0, count: 0 };
  }

  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(curPrefix)
  );

  currentMonthExpenses.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day) {
      dailySpend[day].total += t.amount;
      dailySpend[day].count += 1;
    }
  });

  // Calculate intensity tiers
  const amounts = Object.values(dailySpend).map((d) => d.total).filter((a) => a > 0);
  const maxSpend = amounts.length > 0 ? Math.max(...amounts) : 5000;

  const getHeatmapColor = (day: number) => {
    if (day > currentDay) {
      return 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800/50'; // Future days
    }

    const { total } = dailySpend[day];
    if (currentMonthExpenses.length === 0) {
      return 'bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800/80';
    }

    if (total === 0) {
      // Zero spend day
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 hover:border-emerald-500';
    }

    const ratio = total / maxSpend;
    if (ratio > 0.6) return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-500/50 hover:border-rose-500';
    if (ratio > 0.3) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 hover:border-amber-500';
    return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/60 hover:border-slate-400';
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Count zero spend days only if expenses have been logged
  let zeroSpendCount = 0;
  if (currentMonthExpenses.length > 0) {
    for (let d = 1; d <= currentDay; d++) {
      if (dailySpend[d].total === 0) zeroSpendCount++;
    }
  }

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Spending Activity</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Monthly calendar distribution</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>
            {currentMonthExpenses.length === 0
              ? 'Awaiting Activity'
              : `${zeroSpendCount} No-Spend Days`}
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-11 rounded-xl bg-transparent" />
        ))}

        {/* Days */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isToday = day === currentDay;
          const { total } = dailySpend[day];

          return (
            <div
              key={`day-${day}`}
              onMouseEnter={() => setHoveredDay({ day, amount: total, count: dailySpend[day].count })}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-semibold border transition-all cursor-pointer relative ${getHeatmapColor(
                day
              )} ${isToday ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 font-bold' : ''}`}
            >
              <span>{day}</span>
              {day <= currentDay && total === 0 && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">₹0</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover tooltip bar */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 min-h-[26px]">
        {hoveredDay ? (
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">Day {hoveredDay.day}: </span>
            {hoveredDay.amount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zero spend day</span>
            ) : (
              <span>
                <strong className="text-slate-900 dark:text-white">
                  {formatCurrency(hoveredDay.amount, userProfile.currencySymbol)}
                </strong>{' '}
                across {hoveredDay.count} transaction{hoveredDay.count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Hover over any date to inspect details
          </span>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>₹0</span>
          <span className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40" title="Zero spend" />
          <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" title="Low spend" />
          <span className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40" title="Medium spend" />
          <span className="w-3 h-3 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50" title="High spend" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};
