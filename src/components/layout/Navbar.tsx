import React from 'react';
import {
  Plus,
  Clock,
  Moon,
  Sun,
  Search,
  FileText,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

import { AuthButton } from '../auth/AuthButton';

export const Navbar: React.FC = () => {
  const {
    transactions,
    userProfile,
    timeCostMode,
    setTimeCostMode,
    toggleDarkMode,
    isDarkMode,
    setKeypadOpen,
    setWrappedOpen,
    setCommandPaletteOpen,
  } = useExpenseStore();

  const summary = calculateMonthSummary(transactions, userProfile);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                SpendSense
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Daily Safe Allowance: <span className="text-emerald-400 font-semibold">{formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}/day</span> <span className="text-slate-500">(Max {formatCurrency(userProfile.dailyBudgetLimit || 150, userProfile.currencySymbol)})</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Work Hours View Toggle */}
          <button
            onClick={() => setTimeCostMode((prev) => !prev)}
            title="Toggle Work Hours view (shows costs in hours of your work)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              timeCostMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${timeCostMode ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Work Hours View</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${timeCostMode ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {timeCostMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Monthly Summary Report Trigger */}
          <button
            onClick={() => setWrappedOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95"
            title="Open Monthly Spending Summary"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Monthly Summary</span>
          </button>

          {/* Command Palette Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
            title="Open Search & Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-400">Cmd+K</kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95"
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Google Auth & Firestore Cloud Sync */}
          <AuthButton />

          {/* Add Expense Button (Keypad Modal) */}
          <button
            onClick={() => setKeypadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
