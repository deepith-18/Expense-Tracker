import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Delete,
  Calendar,
  Wallet,
  Tag,
  Check,
  Mic,
  MessageSquareCode,
  Sparkles,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { IconHelper } from '../common/IconHelper';
import { formatCurrency } from '../../lib/currency';

export const QuickAddKeypadModal: React.FC = () => {
  const {
    isKeypadOpen,
    setKeypadOpen,
    editingTransaction,
    categories,
    accounts,
    addTransaction,
    updateTransaction,
    userProfile,
    setNlpModalOpen,
  } = useExpenseStore();

  const [amountStr, setAmountStr] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [tagsInput, setTagsInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Initialize form when opening or editing
  useEffect(() => {
    if (editingTransaction) {
      setAmountStr(String(editingTransaction.amount));
      setSelectedCategoryId(editingTransaction.categoryId);
      setSelectedAccountId(editingTransaction.accountId);
      setMerchant(editingTransaction.merchant || '');
      setDate(editingTransaction.date);
      setType(editingTransaction.type === 'income' ? 'income' : 'expense');
      setTagsInput(editingTransaction.tags.join(', '));
    } else {
      setAmountStr('0');
      setSelectedCategoryId(categories[0]?.id || 'cat-food');
      setSelectedAccountId(accounts[0]?.id || 'acc-hdfc');
      setMerchant('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      setTagsInput('');
    }
  }, [isKeypadOpen, editingTransaction, categories, accounts]);

  if (!isKeypadOpen) return null;

  // Keypad button click
  const handleKeyClick = (key: string) => {
    if (key === 'BACK') {
      if (amountStr.length <= 1) {
        setAmountStr('0');
      } else {
        setAmountStr(amountStr.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr + '.');
      }
      return;
    }

    if (key === '00') {
      if (amountStr !== '0') {
        setAmountStr(amountStr + '00');
      }
      return;
    }

    if (amountStr === '0') {
      setAmountStr(key);
    } else {
      if (amountStr.length < 9) {
        setAmountStr(amountStr + key);
      }
    }
  };

  // Keyboard support for typing amounts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) {
      handleKeyClick(e.key);
    } else if (e.key === 'Backspace') {
      handleKeyClick('BACK');
    } else if (e.key === '.') {
      handleKeyClick('.');
    } else if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setKeypadOpen(false);
    }
  };

  // Voice Web Speech API
  const handleVoiceListen = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please type or use Chrome/Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Parse speech e.g. "coffee 150"
        const numMatch = transcript.match(/\d+(\.\d+)?/);
        if (numMatch) {
          setAmountStr(numMatch[0]);
        }
        const cleaned = transcript.replace(/\d+(\.\d+)?/g, '').trim();
        if (cleaned) {
          setMerchant(cleaned);
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amountStr);
    if (!numericAmount || numericAmount <= 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const targetCategory = categories.find((c) => c.id === selectedCategoryId);

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        amount: numericAmount,
        type,
        categoryId: selectedCategoryId,
        accountId: selectedAccountId,
        merchant: merchant.trim() || targetCategory?.name || 'Expense',
        date,
        tags,
      });
    } else {
      addTransaction({
        amount: numericAmount,
        type,
        categoryId: selectedCategoryId,
        accountId: selectedAccountId,
        merchant: merchant.trim() || targetCategory?.name || 'Expense',
        date,
        tags,
      });
    }

    setKeypadOpen(false);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base text-white">
                {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
              </span>
              <button
                onClick={() => {
                  setKeypadOpen(false);
                  setNlpModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all"
                title="Switch to natural text input"
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Type as Text</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Type Switcher */}
              <div className="flex p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    type === 'income'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Income
                </button>
              </div>

              <button
                onClick={() => setKeypadOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-4 space-y-4">
            {/* Big Amount Screen */}
            <div className="text-center py-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-400 mr-1.5">
                {userProfile.currencySymbol}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
                {amountStr}
              </span>

              {/* Voice button directly inside amount box */}
              <button
                type="button"
                onClick={handleVoiceListen}
                title="Dictate with voice"
                className={`absolute right-3.5 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Smart Predictive Category Horizontal Strip */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select Category
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                {categories
                  .filter((c) => (type === 'income' ? c.type === 'income' : c.type === 'expense'))
                  .map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-105'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <IconHelper name={cat.icon} className="w-3.5 h-3.5" />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Merchant and Account row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Merchant / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Uber, Chai"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Account / Wallet
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Tags row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="food, weekend, office"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Oversized 3-Sec Numeric Keypad */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '00'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeyClick(k)}
                    className="h-12 bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-500 active:text-slate-950 text-white font-extrabold text-lg rounded-2xl transition-all shadow-sm active:scale-95"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleKeyClick('BACK')}
                  className="h-12 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-bold text-sm rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Delete className="w-5 h-5 text-rose-400" />
                  <span>Backspace</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={parseFloat(amountStr) <= 0}
                  className={`h-12 rounded-2xl font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm ${
                    parseFloat(amountStr) > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingTransaction ? 'Save Changes' : 'Save Transaction'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
