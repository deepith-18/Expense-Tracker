import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCompactCurrency, formatCurrency } from '../../lib/currency';

export const SpendTrendLine: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const curPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthName = now.toLocaleString('default', { month: 'short' });

  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(curPrefix)
  );

  // Cumulative daily spend array
  const dailyTotals: Record<number, number> = {};
  for (let d = 1; d <= totalDays; d++) {
    dailyTotals[d] = 0;
  }

  currentMonthExpenses.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day) {
      dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
    }
  });

  let runningTotal = 0;
  const chartData = [];

  for (let d = 1; d <= currentDay; d++) {
    runningTotal += dailyTotals[d] || 0;
    chartData.push({
      day: `${monthName} ${d}`,
      dayNum: d,
      spent: runningTotal,
      daily: dailyTotals[d] || 0,
    });
  }

  // Linear projection to month-end
  const avgDaily = currentDay > 0 ? runningTotal / currentDay : 0;
  let projectedTotal = runningTotal;

  for (let d = currentDay + 1; d <= totalDays; d++) {
    projectedTotal += avgDaily;
    chartData.push({
      day: `${monthName} ${d}`,
      dayNum: d,
      spent: null, // actual spent is null for future days
      projected: Math.round(projectedTotal),
    });
  }

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cumulative Spending Trend</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Day-by-day accumulated outflow</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="w-2.5 h-1 border-t-2 border-dashed border-slate-400" />
            <span>Projected</span>
          </div>
        </div>
      </div>

      {currentMonthExpenses.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm text-center px-4">
          <span>No expenses recorded for this month yet.</span>
          <span className="text-slate-400 dark:text-slate-500 text-xs mt-1">Daily trend lines will plot automatically as you add transactions.</span>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dayNum"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              interval={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(v) => formatCompactCurrency(v, userProfile.currencySymbol)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{dataPoint.day}</div>
                      {dataPoint.spent !== null ? (
                        <div className="mt-1">
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            {formatCurrency(dataPoint.spent, userProfile.currencySymbol)}
                          </div>
                          {dataPoint.daily > 0 && (
                            <div className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                              +{formatCurrency(dataPoint.daily, userProfile.currencySymbol)} on this day
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-cyan-600 dark:text-cyan-400 font-bold mt-1">
                          Projected: {formatCurrency(dataPoint.projected, userProfile.currencySymbol)}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="spent"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendGradient)"
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#projGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
