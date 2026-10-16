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

  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(curPrefix))
    .forEach((t) => {
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
      return 'bg-slate-800/20 text-slate-600 border-slate-800/40'; // Future
    }

    const { total } = dailySpend[day];
    if (total === 0) {
      // Zero spend day!
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400';
    }

    const ratio = total / maxSpend;
    if (ratio > 0.6) return 'bg-rose-500/80 text-white border-rose-400 shadow-sm shadow-rose-500/30';
    if (ratio > 0.3) return 'bg-amber-500/70 text-slate-950 border-amber-400';
    return 'bg-emerald-600/60 text-white border-emerald-500';
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Count zero spend days
  let zeroSpendCount = 0;
  for (let d = 1; d <= currentDay; d++) {
    if (dailySpend[d].total === 0) zeroSpendCount++;
  }

  return (
    <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800/80 shadow-xl backdrop-blur-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Daily Spending Heatmap</h3>
            <span className="text-xs text-slate-400">Activity & Zero-Spend streak tracker</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{zeroSpendCount} No-Spend Days</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 rounded-xl bg-transparent" />
        ))}

        {/* Days */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isToday = day === currentDay;
          const { total, count } = dailySpend[day];

          return (
            <div
              key={`day-${day}`}
              onMouseEnter={() => setHoveredDay({ day, amount: total, count })}
              onMouseLeave={() => setHoveredDay(null)}
              className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center text-xs font-semibold border transition-all cursor-pointer relative ${getHeatmapColor(
                day
              )} ${isToday ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 font-black' : ''}`}
            >
              <span>{day}</span>
              {day <= currentDay && total === 0 && (
                <span className="text-[8px] font-bold tracking-tight text-emerald-400">✨ ₹0</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover tooltip bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 min-h-[24px]">
        {hoveredDay ? (
          <div>
            <span className="font-bold text-slate-200">Oct {hoveredDay.day}: </span>
            {hoveredDay.amount === 0 ? (
              <span className="text-emerald-400 font-bold">Zero-spend day! 🎉</span>
            ) : (
              <span>
                <strong className="text-white">
                  {formatCurrency(hoveredDay.amount, userProfile.currencySymbol)}
                </strong>{' '}
                across {hoveredDay.count} transaction{hoveredDay.count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">
            Hover over any day tile to inspect exact spend breakdown
          </span>
        )}

        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-slate-500">₹0</span>
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
          <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded bg-rose-500" />
          <span className="text-slate-500">High</span>
        </div>
      </div>
    </div>
  );
};
