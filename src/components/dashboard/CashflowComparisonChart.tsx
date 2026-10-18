import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const CashflowComparisonChart: React.FC = () => {
  const { transactions, userProfile, isDarkMode } = useExpenseStore();
  const [viewMode, setViewMode] = useState<'6months' | 'recent'>('6months');

  // Generate monthly income, expense & net data
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result: { month: string; income: number; expense: number; net: number; savingsRate: number }[] = [];

    const numMonths = viewMode === '6months' ? 6 : 4;
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${monthNames[monthIndex]} '${String(year).slice(-2)}`;

      const txsInMonth = transactions.filter((t) => t.date && t.date.startsWith(monthPrefix));
      const expense = txsInMonth
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const incomeFromTxs = txsInMonth
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      // Default to user monthly income if no income transactions recorded for the month
      const income = incomeFromTxs > 0 ? incomeFromTxs : userProfile.monthlyIncome || 0;
      const net = Math.max(0, income - expense);
      const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

      result.push({
        month: label,
        income,
        expense,
        net,
        savingsRate,
      });
    }

    return result;
  }, [transactions, userProfile, viewMode]);

  const totalInflow = chartData.reduce((acc, curr) => acc + curr.income, 0);
  const totalOutflow = chartData.reduce((acc, curr) => acc + curr.expense, 0);
  const netSavings = Math.max(0, totalInflow - totalOutflow);
  const avgSavingsRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-all ${
      isDarkMode 
        ? 'bg-slate-900/80 border-slate-800 shadow-glass' 
        : 'bg-white border-slate-200 shadow-glass-light'
    }`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Cashflow Dynamics & Net Savings
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare monthly inflow against outflows and watch your real surplus grow
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('6months')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === '6months'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setViewMode('recent')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'recent'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 4 Months
          </button>
        </div>
      </div>

      {/* Mini Vitals Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className={`p-3 sm:p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Inflow</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1 truncate">
            {formatCurrency(totalInflow, userProfile.currencySymbol)}
          </p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Total Expenses</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-rose-400 mt-1 truncate">
            {formatCurrency(totalOutflow, userProfile.currencySymbol)}
          </p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-400" />
            <span>Net Saved</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-indigo-400 mt-1 truncate">
            {formatCurrency(netSavings, userProfile.currencySymbol)}
          </p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Savings Rate</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-amber-400 mt-1 truncate">
            {avgSavingsRate}%
          </p>
        </div>
      </div>

      {/* Composed Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
            <XAxis
              dataKey="month"
              stroke={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke={isDarkMode ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const inc = Number(payload.find((p) => p.dataKey === 'income')?.value || 0);
                  const exp = Number(payload.find((p) => p.dataKey === 'expense')?.value || 0);
                  const saved = Math.max(0, inc - exp);
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
                      <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">{label}</p>
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <span>Income:</span>
                        <span className="font-bold font-mono">{formatCurrency(inc, userProfile.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                        <span>Expenses:</span>
                        <span className="font-bold font-mono">{formatCurrency(exp, userProfile.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200 dark:border-slate-800 font-semibold">
                        <span>Net Saved:</span>
                        <span className="font-mono">{formatCurrency(saved, userProfile.currencySymbol)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Line
              type="monotone"
              dataKey="net"
              name="Net Saved"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          <span>Net Surplus Curve</span>
        </div>
      </div>
    </div>
  );
};
