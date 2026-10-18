import React, { useState } from 'react';
import { Users, UserPlus, CheckCircle, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency } from '../../lib/currency';

export const SplitBillsHub: React.FC = () => {
  const { friends, transactions, settleSplitItem, addFriend, userProfile } = useExpenseStore();
  const [newFriendName, setNewFriendName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Scan all transactions with splitWith
  const unsettledItems: {
    txId: string;
    merchant: string;
    date: string;
    friendId: string;
    friendName: string;
    amount: number;
  }[] = [];

  transactions.forEach((tx) => {
    if (tx.splitWith && tx.splitWith.length > 0) {
      tx.splitWith.forEach((split) => {
        if (!split.paid) {
          unsettledItems.push({
            txId: tx.id,
            merchant: tx.merchant || 'Dinner',
            date: tx.date,
            friendId: split.friendId,
            friendName: split.name,
            amount: split.amount,
          });
        }
      });
    }
  });

  const totalOwedToYou = unsettledItems.reduce((acc, i) => acc + i.amount, 0);

  const handleSettle = (txId: string, friendId: string) => {
    settleSplitItem(txId, friendId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    addFriend(newFriendName.trim());
    setNewFriendName('');
    setIsAdding(false);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Split Bills & IOUs Hub</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track who owes you, shared group tabs, and settle debts in 1 click.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total To Collect
            </span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalOwedToYou, userProfile.currencySymbol)}
            </span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
          >
            <UserPlus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* Add Friend Form */}
      {isAdding && (
        <form onSubmit={handleAddFriend} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <input
            type="text"
            placeholder="Friend's full name (e.g. Vikram Seth)"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Save Friend
          </button>
        </form>
      )}

      {/* Friends Roster Pills */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          Your Split Circle ({friends.length})
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {friends.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shrink-0"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">
                {f.avatar || f.name.substring(0, 2)}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{f.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unsettled Items List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Outstanding Split Balances
        </h4>

        {unsettledItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            All split expenses are fully settled up. No outstanding balances.
          </div>
        ) : (
          unsettledItems.map((item, idx) => (
            <div
              key={`${item.txId}-${item.friendId}-${idx}`}
              className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{item.friendName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">owes you for</span>
                    <span className="text-slate-700 dark:text-slate-200">{item.merchant}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">{item.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(item.amount, userProfile.currencySymbol)}
                </span>
                <button
                  onClick={() => handleSettle(item.txId, item.friendId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Settle Up</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
