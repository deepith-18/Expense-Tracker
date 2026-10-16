import React from 'react';
import { Sparkles, Trophy, Lightbulb, ArrowRight } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { determineSpendingPersonality } from '../../lib/personality';

export const SpendingPersonalityCard: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();
  const personality = determineSpendingPersonality(transactions, userProfile.monthlyIncome);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/40 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Weekly Persona
          </span>
          <span className="text-xs text-slate-400">Based on your activity</span>
        </div>

        <span className="text-2xl" role="img" aria-label="personality-emoji">
          {personality.emoji}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {personality.title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {personality.badge}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {personality.description}
        </p>
      </div>

      {/* Behavioral Stats & Actionable Tip */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Pattern Metric</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-white mt-1 block">
            {personality.statsHighlight}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimization Tip</span>
          </div>
          <span className="text-xs text-slate-300 mt-1 block line-clamp-2">
            {personality.actionableTip}
          </span>
        </div>
      </div>
    </div>
  );
};
