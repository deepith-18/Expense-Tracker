import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { determineSpendingPersonality } from '../../lib/personality';
import { formatCurrency } from '../../lib/currency';

interface SpendingSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpendingSnapshotModal: React.FC<SpendingSnapshotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, userProfile, isDarkMode } = useExpenseStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summary = calculateMonthSummary(transactions, userProfile);
  const personality = determineSpendingPersonality(transactions, userProfile.monthlyIncome);
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleCopySummary = () => {
    const text = `📊 SpendSense Financial Snapshot (${monthName})\n` +
      `👤 Profile: ${userProfile.displayName}\n` +
      `💸 Total Spent: ${formatCurrency(summary.spentThisMonth, userProfile.currencySymbol)}\n` +
      `🛡️ Safe Daily Spend: ${formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}/day\n` +
      `📈 Net Savings: ${formatCurrency(summary.incomeThisMonth - summary.spentThisMonth, userProfile.currencySymbol)}\n` +
      `🎯 Spending Archetype: ${personality.title} (${personality.badge})\n` +
      `⚡ Tracked with SpendSense`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Financial Snapshot Card
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Snapshot Visual Preview Card */}
          <div className="p-6">
            <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white border border-emerald-500/30 shadow-2xl space-y-5 relative overflow-hidden">
              {/* Glow backdrop */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                    ₹
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-tight block">
                      SpendSense
                    </span>
                    <span className="text-[10px] text-slate-400 block">{monthName}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {personality.badge}
                </span>
              </div>

              {/* Big metric */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Monthly Spent
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatCurrency(summary.spentThisMonth, userProfile.currencySymbol)}
                </span>
              </div>

              {/* Sub metrics grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Safe Daily Allowance
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {formatCurrency(summary.safeToSpendDaily, userProfile.currencySymbol)}/day
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                    Net Monthly Balance
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      summary.incomeThisMonth >= summary.spentThisMonth
                        ? 'text-teal-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(
                      summary.incomeThisMonth - summary.spentThisMonth,
                      userProfile.currencySymbol
                    )}
                  </span>
                </div>
              </div>

              {/* Personality Archetype footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold truncate">
                  Archetype: <strong className="text-amber-300">{personality.title}</strong>
                </span>
                <span className="text-[10px] text-slate-500">Verified Cash Flow</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2">
              <button
                onClick={handleCopySummary}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Summary Text'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
