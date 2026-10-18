import React from 'react';
import { Trophy, Lightbulb, Compass, ArrowUpRight } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { determineSpendingPersonality } from '../../lib/personality';
import { IconHelper } from '../common/IconHelper';

export const SpendingPersonalityCard: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();
  const personality = determineSpendingPersonality(transactions, userProfile.monthlyIncome);

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <IconHelper name={personality.icon || 'Compass'} className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Spending Pattern
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {personality.title}
              </h3>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
            {personality.badge}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {personality.description}
        </p>
      </div>

      {/* Behavioral Stats & Actionable Tip */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Key Pattern</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
            {personality.statsHighlight}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
            <span>Recommendation</span>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 block leading-normal">
            {personality.actionableTip}
          </span>
        </div>
      </div>
    </div>
  );
};

