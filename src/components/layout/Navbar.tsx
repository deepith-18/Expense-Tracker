import React from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  Moon,
  Sun,
  Search,
  Zap,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { formatCurrency } from '../../lib/currency';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SpendSense
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Daily Safe: <span className="text-emerald-400 font-semibold">{formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}/day</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time Cost Lens Toggle */}
          <button
            onClick={() => setTimeCostMode((prev) => !prev)}
            title="Toggle 'Time Cost' lens (expenses shown as hours of your work)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              timeCostMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-glow-amber'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${timeCostMode ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Time Cost Lens</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${timeCostMode ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              {timeCostMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Spotify Wrapped Trigger */}
          <button
            onClick={() => setWrappedOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:text-purple-200 border border-purple-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Open Monthly Spending Wrapped"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">Wrapped</span>
          </button>

          {/* Command Palette Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all"
            title="Open Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="text-[10px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700 font-mono">⌘K</kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all active:scale-95"
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Add Expense Button (Keypad Modal) */}
          <button
            onClick={() => setKeypadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Quick Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
