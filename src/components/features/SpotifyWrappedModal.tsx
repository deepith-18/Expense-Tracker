import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Trophy,
  Flame,
  Award,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExpenseStore } from '../../store/useExpenseStore';
import { calculateMonthSummary } from '../../lib/insightsEngine';
import { determineSpendingPersonality } from '../../lib/personality';
import { formatCurrency } from '../../lib/currency';

export const SpotifyWrappedModal: React.FC = () => {
  const { isWrappedOpen, setWrappedOpen, transactions, userProfile } = useExpenseStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const summary = calculateMonthSummary(transactions, userProfile);
  const personality = determineSpendingPersonality(transactions, userProfile.monthlyIncome);

  // Highest expense (splurge)
  const expenses = transactions.filter((t) => t.type === 'expense');
  const biggestSplurge = [...expenses].sort((a, b) => b.amount - a.amount)[0] || {
    amount: 15000,
    merchant: 'Zerodha Index Fund',
    date: 'Oct 2',
  };

  useEffect(() => {
    if (isWrappedOpen) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isWrappedOpen]);

  if (!isWrappedOpen) return null;

  const totalSlides = 4;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      confetti({ particleCount: 100, spread: 100 });
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="w-full max-w-sm sm:max-w-md h-[580px] bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30 flex flex-col justify-between relative p-6 text-white"
        >
          {/* Top Story Progress Bars */}
          <div className="flex gap-1.5 z-10">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    i < currentSlide ? 'w-full' : i === currentSlide ? 'w-full animate-pulse' : 'w-0'
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
            className="absolute top-5 right-5 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Slide Content */}
          <div className="my-auto text-center px-2 py-4">
            {currentSlide === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <span className="text-[11px] uppercase tracking-widest font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  SpendSense Wrapped 2026
                </span>
                <h2 className="text-3xl font-black tracking-tight mt-2">
                  Your Total Outflow
                </h2>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-2">
                  {formatCurrency(summary.spentThisMonth, userProfile.currencySymbol)}
                </div>
                <p className="text-sm text-slate-300 max-w-xs mx-auto">
                  {summary.changePercentage <= 0
                    ? `You spent ${Math.abs(summary.changePercentage)}% less than last month! Super disciplined.`
                    : `Tracked across ${transactions.length} total entries with automated categorization.`}
                </p>
              </motion.div>
            )}

            {currentSlide === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 text-2xl shadow-xl">
                  👑
                </div>
                <span className="text-[11px] uppercase tracking-widest font-black text-rose-300 block">
                  Top Splurge of the Month
                </span>
                <h2 className="text-2xl font-black text-white">
                  {biggestSplurge.merchant || 'Special Outflow'}
                </h2>
                <div className="text-4xl font-black text-rose-400">
                  {formatCurrency(biggestSplurge.amount, userProfile.currencySymbol)}
                </div>
                <p className="text-xs text-slate-300">
                  Logged on {biggestSplurge.date}. Every great portfolio allows an occasional guilt-free splurge!
                </p>
              </motion.div>
            )}

            {currentSlide === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 text-2xl shadow-xl">
                  🧘
                </div>
                <span className="text-[11px] uppercase tracking-widest font-black text-emerald-300 block">
                  Frugal Discipline Records
                </span>
                <div className="text-5xl font-black text-emerald-400">
                  {summary.noSpendDaysCount} Days
                </div>
                <h2 className="text-xl font-bold text-white">
                  Zero-Spend Masterclass
                </h2>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  You went completely spend-free on {summary.noSpendDaysCount} separate days this month!
                </p>
              </motion.div>
            )}

            {currentSlide === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <span className="text-5xl block animate-bounce" role="img" aria-label="persona">
                  {personality.emoji}
                </span>
                <span className="text-[11px] uppercase tracking-widest font-black text-purple-300 block">
                  Your Financial Archetype
                </span>
                <h2 className="text-3xl font-black text-white">
                  {personality.title}
                </h2>
                <div className="inline-block px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-bold">
                  {personality.badge}
                </div>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  {personality.description}
                </p>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between z-10 pt-4 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`p-2 rounded-xl transition-all ${
                currentSlide === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-950 font-black text-xs flex items-center gap-2 hover:bg-slate-200 transition-all shadow-lg active:scale-95"
            >
              <span>{currentSlide === totalSlides - 1 ? 'Finish & Celebrate' : 'Next Story'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
