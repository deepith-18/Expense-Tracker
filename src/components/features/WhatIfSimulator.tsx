import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, Clock, Coins } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency, calculateTimeCost } from '../../lib/currency';

export const WhatIfSimulator: React.FC = () => {
  const { transactions, userProfile } = useExpenseStore();

  // Sliders (% reductions)
  const [foodCut, setFoodCut] = useState(30); // 30% default
  const [shoppingCut, setShoppingCut] = useState(25);
  const [entertainmentCut, setEntertainmentCut] = useState(20);
  const [commuteCut, setCommuteCut] = useState(15);

  // Calculate base monthly spends for these categories
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthTxs = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
  );

  const getSpendForCat = (catId: string, fallback: number) => {
    const total = currentMonthTxs
      .filter((t) => t.categoryId === catId)
      .reduce((acc, t) => acc + t.amount, 0);
    return total > 0 ? total : fallback;
  };

  const baseFood = getSpendForCat('cat-food', 12000);
  const baseShopping = getSpendForCat('cat-shopping', 8000);
  const baseEntertainment = getSpendForCat('cat-entertainment', 4000);
  const baseCommute = getSpendForCat('cat-commute', 6000);

  // Monthly savings
  const foodSaved = Math.round((baseFood * foodCut) / 100);
  const shoppingSaved = Math.round((baseShopping * shoppingCut) / 100);
  const entertainmentSaved = Math.round((baseEntertainment * entertainmentCut) / 100);
  const commuteSaved = Math.round((baseCommute * commuteCut) / 100);

  const totalMonthlySaved = foodSaved + shoppingSaved + entertainmentSaved + commuteSaved;
  const yearlySaved = totalMonthlySaved * 12;

  // 5-Year compounding SIP calculation at 12% annual return (r = 0.01 per month, n = 60 months)
  // FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const r = 0.12 / 12;
  const n = 60;
  const futureValue5Years = Math.round(
    totalMonthlySaved * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
  );

  // Time recovered (hours of life work saved)
  const timeRecovered = calculateTimeCost(
    totalMonthlySaved,
    userProfile.monthlyIncome,
    userProfile.workHoursPerMonth
  );

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">What-If Savings Simulator</h3>
            <p className="text-xs text-slate-400">
              Drag the sliders below to see immediate 1-year and 5-year compounding wealth impact.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-xs uppercase font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Compound Math Engine
        </span>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Saved */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly Extra Savings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
            +{formatCurrency(totalMonthlySaved, userProfile.currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mt-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Saves {timeRecovered.formatted} / month</span>
          </div>
        </div>

        {/* 1 Year Saved */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            1-Year Bank Balance Bump
          </span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 block">
            +{formatCurrency(yearlySaved, userProfile.currencySymbol)}
          </span>
          <span className="text-xs text-slate-400 mt-2 block">
            Pure direct capital retained in your wallet
          </span>
        </div>

        {/* 5 Year Compounding at 12% */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            5-Year Invested Wealth (12% SIP)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            {formatCurrency(futureValue5Years, userProfile.currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>+{formatCurrency(futureValue5Years - totalMonthlySaved * 60, userProfile.currencySymbol)} free interest gain!</span>
          </div>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="pt-4 border-t border-slate-800/80 space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Adjust Your Target Cutbacks
        </h4>

        {/* Food & Delivery */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200">
              Cut Dining & Food Delivery (Base: {formatCurrency(baseFood, userProfile.currencySymbol)})
            </span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {foodCut}% ({formatCurrency(foodSaved, userProfile.currencySymbol)}/mo)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={foodCut}
            onChange={(e) => setFoodCut(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Shopping */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200">
              Cut Impulsive Shopping (Base: {formatCurrency(baseShopping, userProfile.currencySymbol)})
            </span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {shoppingCut}% ({formatCurrency(shoppingSaved, userProfile.currencySymbol)}/mo)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={shoppingCut}
            onChange={(e) => setShoppingCut(Number(e.target.value))}
            className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* OTT & Media */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200">
              Cut OTT Subscriptions & Media (Base: {formatCurrency(baseEntertainment, userProfile.currencySymbol)})
            </span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {entertainmentCut}% ({formatCurrency(entertainmentSaved, userProfile.currencySymbol)}/mo)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={entertainmentCut}
            onChange={(e) => setEntertainmentCut(Number(e.target.value))}
            className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Commute */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200">
              Cut Surge Cabs with Metro / Carpool (Base: {formatCurrency(baseCommute, userProfile.currencySymbol)})
            </span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {commuteCut}% ({formatCurrency(commuteSaved, userProfile.currencySymbol)}/mo)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={commuteCut}
            onChange={(e) => setCommuteCut(Number(e.target.value))}
            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
