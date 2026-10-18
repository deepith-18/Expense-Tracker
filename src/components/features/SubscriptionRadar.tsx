import React, { useState } from 'react';
import {
  Radio,
  Calendar,
  AlertCircle,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';
import { IconHelper } from '../common/IconHelper';

interface DetectedSubscription {
  name: string;
  amount: number;
  frequency: string;
  lastBilled: string;
  category: string;
  isFlaggedRecurring: boolean;
}

export const SubscriptionRadar: React.FC = () => {
  const { transactions, categories, userProfile } = useExpenseStore();

  // Known recurring keywords / merchants
  const subscriptionKeywords = [
    'netflix',
    'spotify',
    'prime',
    'hotstar',
    'youtube',
    'apple',
    'google',
    'gym',
    'broadband',
    'wifi',
    'airtel',
    'jio',
    'rent',
    'electricity',
    'maintenance',
    'cloud',
    'chatgpt',
    'github',
    'sub',
    'subscription',
  ];

  // Map to identify unique recurring patterns
  const detectedMap = new Map<string, DetectedSubscription>();

  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;

    const merchantLower = (tx.merchant || '').toLowerCase();
    const isMatchedKeyword = subscriptionKeywords.some((kw) => merchantLower.includes(kw));
    const isExplicitRecurring = !!tx.isRecurring;

    if (isMatchedKeyword || isExplicitRecurring) {
      const key = tx.merchant ? tx.merchant.trim().toLowerCase() : 'service';
      const existing = detectedMap.get(key);
      const cat = categories.find((c) => c.id === tx.categoryId);

      if (!existing || new Date(tx.date) > new Date(existing.lastBilled)) {
        detectedMap.set(key, {
          name: tx.merchant || 'Subscription',
          amount: tx.amount,
          frequency: 'Monthly',
          lastBilled: tx.date,
          category: cat?.name || 'Recurring',
          isFlaggedRecurring: isExplicitRecurring,
        });
      }
    }
  });

  const subscriptions = Array.from(detectedMap.values());
  const monthlyTotal = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recurring Subscriptions & Bills Radar
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Auto-detected recurring services and annual commitment
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Annual Outflow
            </span>
            <span className="text-sm font-black text-purple-600 dark:text-purple-400">
              {formatCurrency(annualTotal, userProfile.currencySymbol)}/yr
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Monthly Subscription Drain
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
            {formatCurrency(monthlyTotal, userProfile.currencySymbol)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Active Subscriptions
          </span>
          <span className="text-lg font-black text-indigo-500 dark:text-indigo-400 mt-0.5 block">
            {subscriptions.length} detected
          </span>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {subscriptions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <p>No recurring subscriptions or bill keywords detected yet.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Add transactions for Netflix, WiFi, Rent, or mark an expense as "Recurring".
            </p>
          </div>
        ) : (
          subscriptions.map((sub, idx) => (
            <div
              key={`${sub.name}-${idx}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 font-bold text-xs">
                  {sub.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{sub.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300">
                      {sub.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{sub.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Last: {sub.lastBilled}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatCurrency(sub.amount, userProfile.currencySymbol)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  /month
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
