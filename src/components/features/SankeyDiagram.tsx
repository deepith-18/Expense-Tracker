import React from 'react';
import { GitFork, ArrowRight, Wallet, ShoppingBag, Store, Building2 } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const SankeyDiagram: React.FC = () => {
  const { transactions, categories, accounts, userProfile } = useExpenseStore();

  const curPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(curPrefix));

  // Compute column totals from real transactions
  const totalIncome = currentMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Real Incomes grouped by merchant/note
  const incomeTotals: Record<string, number> = {};
  currentMonthTxs
    .filter((t) => t.type === 'income')
    .forEach((t) => {
      const label = t.merchant?.trim() || t.note?.trim() || 'Direct Inflow';
      incomeTotals[label] = (incomeTotals[label] || 0) + t.amount;
    });

  const incomeList = Object.entries(incomeTotals).map(([label, amount], idx) => ({
    id: `inc-${idx}`,
    label,
    amount,
    color: '#10B981',
  }));

  // Real Account Flows (only accounts with actual expense activity)
  const accountFlows = accounts
    .map((acc) => {
      const spent = currentMonthTxs
        .filter((t) => t.type === 'expense' && t.accountId === acc.id)
        .reduce((a, b) => a + b.amount, 0);
      return {
        id: acc.id,
        label: acc.name,
        amount: spent,
        color: acc.color || '#3B82F6',
      };
    })
    .filter((acc) => acc.amount > 0);

  // Real Top Categories
  const categoryFlows = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = currentMonthTxs
        .filter((t) => t.categoryId === c.id)
        .reduce((a, b) => a + b.amount, 0);
      return {
        id: c.id,
        label: c.name,
        amount: spent,
        color: c.color,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Real Top Merchants
  const merchantTotals: Record<string, number> = {};
  currentMonthTxs
    .filter((t) => t.type === 'expense' && t.merchant)
    .forEach((t) => {
      const m = t.merchant!.trim();
      merchantTotals[m] = (merchantTotals[m] || 0) + t.amount;
    });

  const topMerchants = Object.entries(merchantTotals)
    .map(([merchant, amount]) => ({
      id: `m-${merchant}`,
      label: merchant,
      amount,
      color: '#EC4899',
    }))
    .filter((m) => m.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow Mapping</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real visual path of capital from income sources through accounts into spending categories and merchants.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total Monthly Inflow</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome, userProfile.currencySymbol)}
          </span>
        </div>
      </div>

      {currentMonthTxs.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
            <GitFork className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">No Cash Flow Transactions Recorded Yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            As you log income deposits and expenses, this map will automatically route each transaction from your income sources into your bank accounts, wallets, categories, and top merchants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {/* Column 1: Inflow Sources */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Inflows
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {totalIncome > 0 ? formatCurrency(totalIncome, userProfile.currencySymbol) : '0'}
              </span>
            </div>

            <div className="space-y-2">
              {incomeList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No income logged yet this month
                </div>
              ) : (
                incomeList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 shadow-sm dark:shadow-none transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.label}</div>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +{formatCurrency(item.amount, userProfile.currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Wallets / Accounts */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Accounts
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            </div>

            <div className="space-y-2">
              {accountFlows.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No account outflows yet
                </div>
              ) : (
                accountFlows.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 shadow-sm dark:shadow-none transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.label}</div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {formatCurrency(item.amount, userProfile.currencySymbol)} routed
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Expense Categories */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Categories
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            </div>

            <div className="space-y-2">
              {categoryFlows.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No category expenses yet
                </div>
              ) : (
                categoryFlows.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 shadow-sm dark:shadow-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.label}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                      {formatCurrency(item.amount, userProfile.currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Top Terminal Merchants */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" /> Merchants
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">End</span>
            </div>

            <div className="space-y-2">
              {topMerchants.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                  No merchant expenses yet
                </div>
              ) : (
                topMerchants.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-pink-500/50 shadow-sm dark:shadow-none transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.label}</div>
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {formatCurrency(item.amount, userProfile.currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
