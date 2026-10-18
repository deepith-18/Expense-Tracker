import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { determineSpendingPersonality } from '../../lib/personality';
import { formatCurrency } from '../../lib/currency';
import { IconHelper } from '../common/IconHelper';

export const SpotifyWrappedModal: React.FC = () => {
  const { isWrappedOpen, setWrappedOpen, setKeypadOpen, transactions, userProfile } = useExpenseStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const expenses = transactions.filter((t) => t.type === 'expense');

  if (!isWrappedOpen) return null;

  if (expenses.length === 0) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-white text-center space-y-4"
          >
            <div className="flex justify-end">
              <button
                onClick={() => setWrappedOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Monthly Spending Summary</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              No transactions recorded for this month yet. Once you start logging expenses, this report will dynamically highlight your top outflows, no-spend streaks, and spending archetypes.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setWrappedOpen(false);
                  setKeypadOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-emerald-400 transition-all"
              >
                Record First Expense
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const summary = calculateMonthSummary(transactions, userProfile);
  const personality = determineSpendingPersonality(transactions, userProfile.monthlyIncome);
  const biggestSplurge = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  const totalSlides = 4;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setWrappedOpen(false);
      setCurrentSlide(0);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between relative p-6 text-white min-h-[500px]"
        >
          {/* Top Progress Bars */}
          <div className="flex gap-1.5 z-10">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-emerald-500 transition-all duration-300 ${
                    i <= currentSlide ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setWrappedOpen(false);
              setCurrentSlide(0);
            }}
            className="absolute top-5 right-5 z-20 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="my-auto text-center px-4 py-6">
            {currentSlide === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Receipt className="w-7 h-7" />
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Monthly Review • October 2026
                </span>
                <h2 className="text-2xl font-bold text-white">
                  Total Monthly Outflow
                </h2>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 py-1">
                  {formatCurrency(summary.spentThisMonth, userProfile.currencySymbol)}
                </div>
                <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                  {summary.changePercentage <= 0
                    ? `Expenses are down ${Math.abs(summary.changePercentage)}% compared to last month.`
                    : `Recorded across ${transactions.length} total ledger transactions.`}
                </p>
              </motion.div>
            )}

            {currentSlide === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Outflow Highlight
                </span>
                <h2 className="text-2xl font-bold text-white">
                  {biggestSplurge.merchant || 'Major Transaction'}
                </h2>
                <div className="text-4xl font-black text-white">
                  {formatCurrency(biggestSplurge.amount, userProfile.currencySymbol)}
                </div>
                <p className="text-sm text-slate-300 max-w-xs mx-auto">
                  Single largest recorded transaction for this month, logged on {biggestSplurge.date}.
                </p>
              </motion.div>
            )}

            {currentSlide === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Budget Discipline
                </span>
                <div className="text-4xl sm:text-5xl font-black text-teal-400">
                  {summary.noSpendDaysCount} Days
                </div>
                <h2 className="text-xl font-bold text-white">
                  Zero Discretionary Spend Days
                </h2>
                <p className="text-sm text-slate-300 max-w-xs mx-auto">
                  You logged {summary.noSpendDaysCount} full days with zero discretionary spending this month.
                </p>
              </motion.div>
            )}

            {currentSlide === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <IconHelper name={personality.icon || 'Compass'} className="w-7 h-7" />
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                  Spending Profile
                </span>
                <h2 className="text-2xl font-bold text-white">
                  {personality.title}
                </h2>
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">
                  {personality.badge}
                </div>
                <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                  {personality.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between z-10 pt-4 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`p-2 rounded-xl transition-all ${
                currentSlide === 0 ? 'opacity-20 cursor-not-allowed text-slate-600' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>{currentSlide === totalSlides - 1 ? 'Close Summary' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
