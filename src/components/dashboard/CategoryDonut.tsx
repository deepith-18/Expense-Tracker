import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';
import { IconHelper } from '../common/IconHelper';

export const CategoryDonut: React.FC = () => {
  const { transactions, categories, userProfile } = useExpenseStore();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Group current month expenses by category
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  const categoryTotals: Record<string, number> = {};
  currentExpenses.forEach((t) => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const data = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Other',
        amount,
        color: cat?.color || '#94A3B8',
        icon: cat?.icon || 'Tag',
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Category Allocation</h3>
            <span className="text-xs text-slate-400">Expense breakdown by category</span>
          </div>
        </div>

        <span className="text-xs font-medium text-slate-400">
          {data.length} active categories
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
          No expenses recorded for this month yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#0F172A"
                      strokeWidth={2}
                      className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-emerald-400 font-bold mt-1">
                            {formatCurrency(item.amount, userProfile.currencySymbol)} ({item.percentage}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {activeIndex !== null ? data[activeIndex]?.name : 'Total Spent'}
              </span>
              <span className="text-lg font-bold text-white">
                {activeIndex !== null
                  ? formatCurrency(data[activeIndex]?.amount, userProfile.currencySymbol)
                  : formatCurrency(totalSpent, userProfile.currencySymbol)}
              </span>
            </div>
          </div>

          {/* Category List Breakdown */}
          <div className="sm:col-span-6 space-y-2 max-h-56 overflow-y-auto pr-1">
            {data.map((item, idx) => (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  activeIndex === idx ? 'bg-slate-800 shadow-sm' : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="p-1.5 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: `${item.color}25`, color: item.color }}
                  >
                    <IconHelper name={item.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {item.name}
                  </span>
                </div>

                <div className="text-right flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-white">
                    {formatCurrency(item.amount, userProfile.currencySymbol)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 w-9 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
