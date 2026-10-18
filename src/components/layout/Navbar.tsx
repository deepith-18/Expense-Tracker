import React from 'react';
import {
  Plus,
  Clock,
  Moon,
  Sun,
  Search,
  FileText,
  Share2,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

import { AuthButton } from '../auth/AuthButton';

interface NavbarProps {
  onOpenSnapshot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSnapshot }) => {
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
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 ${
      isDarkMode
        ? 'border-slate-800 bg-slate-950/95 text-white'
        : 'border-slate-200 bg-white/95 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base sm:text-lg shadow-sm">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`font-bold text-base sm:text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                SpendSense
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
              Daily Safe Allowance: <span className="text-emerald-600 dark:text-emerald-500 font-semibold">{formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}/day</span> <span className="text-slate-400 dark:text-slate-500">(Max {formatCurrency(userProfile.dailyBudgetLimit || 150, userProfile.currencySymbol)})</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Work Hours View Toggle (Desktop & Tablet) */}
          <button
            onClick={() => setTimeCostMode((prev) => !prev)}
            title="Toggle Work Hours view (shows costs in hours of your work)"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              timeCostMode
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm'
                : isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${timeCostMode ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
            <span>Work Hours</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${timeCostMode ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
              {timeCostMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Monthly Summary Report Trigger (Desktop) */}
          <button
            onClick={() => setWrappedOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Open Monthly Spending Summary"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Summary</span>
          </button>

          {/* Spending Snapshot Modal Trigger */}
          {onOpenSnapshot && (
            <button
              onClick={onOpenSnapshot}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="Share / Save Financial Health Snapshot"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Snapshot</span>
            </button>
          )}

          {/* Command Palette Button (Desktop) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Open Search & Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-400">Cmd+K</kbd>
          </button>

          {/* Theme Toggle (Working smoothly in dark & light modes) */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isDarkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Google Auth & Firestore Cloud Sync */}
          <AuthButton />

          {/* Add Expense Button (Keypad Modal) */}
          <button
            onClick={() => setKeypadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
