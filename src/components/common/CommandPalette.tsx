import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MessageSquareCode,
  Mic,
  Camera,
  Sparkles,
  Calculator,
  GitFork,
  Users,
  Clock,
  Download,
  Moon,
  Sun,
  RotateCcw,
  X,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setKeypadOpen,
    setNlpModalOpen,
    setReceiptScanOpen,
    setWrappedOpen,
    setCSVModalOpen,
    setActiveTab,
    setTimeCostMode,
    toggleDarkMode,
    isDarkMode,
    clearAllTransactions,
  } = useExpenseStore();

  const [query, setQuery] = useState('');

  // Global keydown listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'add-expense',
      title: 'Add Transaction',
      subtitle: 'Quick numeric keypad entry',
      icon: Plus,
      color: 'text-emerald-400 bg-emerald-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setKeypadOpen(true);
      },
    },
    {
      id: 'nlp-add',
      title: 'Quick Text Add',
      subtitle: 'Enter expenses in plain text (e.g., "coffee 120 and auto 80")',
      icon: MessageSquareCode,
      color: 'text-indigo-400 bg-indigo-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setNlpModalOpen(true);
      },
    },
    {
      id: 'voice-add',
      title: 'Voice Add Transaction',
      subtitle: 'Speak your expense using Web Speech API',
      icon: Mic,
      color: 'text-rose-400 bg-rose-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setNlpModalOpen(true);
      },
    },
    {
      id: 'scan-receipt',
      title: 'Scan Receipt Photo',
      subtitle: 'Extract amount and merchant from receipt image',
      icon: Camera,
      color: 'text-amber-400 bg-amber-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setReceiptScanOpen(true);
      },
    },
    {
      id: 'spotify-wrapped',
      title: 'Monthly Spending Summary',
      subtitle: 'Review monthly metrics, top expense, and savings pace',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setWrappedOpen(true);
      },
    },
    {
      id: 'what-if',
      title: 'Savings Projection Simulator',
      subtitle: 'Simulate the impact of category spending cutbacks',
      icon: Calculator,
      color: 'text-cyan-400 bg-cyan-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setActiveTab('simulator');
      },
    },
    {
      id: 'sankey',
      title: 'Cash Flow Mapping',
      subtitle: 'View paths from income sources through accounts to merchants',
      icon: GitFork,
      color: 'text-teal-400 bg-teal-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setActiveTab('sankey');
      },
    },
    {
      id: 'split-bills',
      title: 'Split Bills & IOUs',
      subtitle: 'Track shared balances and settle up',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setActiveTab('split');
      },
    },
    {
      id: 'time-cost',
      title: 'Toggle Work Hours View',
      subtitle: 'View expenses translated into equivalent working hours',
      icon: Clock,
      color: 'text-orange-400 bg-orange-500/10',
      run: () => {
        setTimeCostMode((prev) => !prev);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'csv-tools',
      title: 'CSV Import & Export',
      subtitle: 'Backup or restore spreadsheet ledgers',
      icon: Download,
      color: 'text-slate-400 bg-slate-500/10',
      run: () => {
        setCommandPaletteOpen(false);
        setCSVModalOpen(true);
      },
    },
    {
      id: 'toggle-theme',
      title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle theme preference',
      icon: isDarkMode ? Sun : Moon,
      color: 'text-yellow-400 bg-yellow-500/10',
      run: () => {
        toggleDarkMode();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'clear-data',
      title: 'Clear All Data & Start Fresh',
      subtitle: 'Reset ledger to empty and balances to 0',
      icon: RotateCcw,
      color: 'text-rose-400 bg-rose-500/10',
      run: () => {
        if (window.confirm('Are you absolutely sure you want to clear your data? This cannot be undone.')) {
          clearAllTransactions();
        }
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800/80 gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or jump to feature... (Cmd+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm md:text-base font-medium"
            />
            <button
              onClick={() => setCommandPaletteOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No matching actions found for "{query}"
              </div>
            ) : (
              filtered.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.run}
                    className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
                  >
                    <div className={`p-2.5 rounded-xl ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {action.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {action.subtitle}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Select
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>SpendSense Command Hub</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
