import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Download,
  Upload,
  Plus,
  ArrowUpDown,
  Tag as TagIcon,
  RotateCcw,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { IconHelper } from '../common/IconHelper';
import { formatCurrency, calculateTimeCost } from '../../lib/currency';

export const TransactionList: React.FC = () => {
  const {
    transactions,
    categories,
    accounts,
    userProfile,
    timeCostMode,
    deleteTransaction,
    setKeypadOpen,
    setCSVModalOpen,
  } = useExpenseStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter logic
  const filtered = transactions.filter((t) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchMerchant && !matchNote && !matchTags) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && t.type !== selectedType) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant, note, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Switcher */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Incomes Only</option>
          </select>

          {/* Sort Switcher */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* CSV Manager */}
          <button
            onClick={() => setCSVModalOpen(true)}
            title="Import or Export CSV"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all flex items-center justify-center shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2.5">
        {sorted.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8">
            <TagIcon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300">No transactions match your filters</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or tap the Quick Add (+) button to record a new expense.
            </p>
          </div>
        ) : (
          sorted.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const acc = accounts.find((a) => a.id === tx.accountId);
            const isIncome = tx.type === 'income';

            // Time Cost calculation
            const timeCost = calculateTimeCost(
              tx.amount,
              userProfile.monthlyIncome,
              userProfile.workHoursPerMonth
            );

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 transition-all group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: `${cat?.color || '#10B981'}25`, color: cat?.color }}
                  >
                    <IconHelper name={cat?.icon || 'Tag'} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {tx.merchant || cat?.name || 'Expense'}
                      </span>
                      {tx.isRecurring && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          Recurring
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span>{cat?.name || 'General'}</span>
                      <span className="text-slate-600">•</span>
                      <span>{acc?.name || 'Account'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {tx.date}
                      </span>
                    </div>

                    {tx.note && (
                      <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                        "{tx.note}"
                      </p>
                    )}

                    {tx.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {tx.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, userProfile.currencySymbol)}
                    </div>

                    {/* Time Cost Lens view */}
                    {timeCostMode && !isIncome && (
                      <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{timeCost.formatted}</span>
                      </div>
                    )}
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setKeypadOpen(true, tx)}
                      title="Edit transaction"
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Delete transaction (with Undo)"
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
