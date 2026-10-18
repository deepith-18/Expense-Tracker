import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle2, ScanLine } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';

export const ReceiptScannerModal: React.FC = () => {
  const {
    isReceiptScanOpen,
    setReceiptScanOpen,
    addTransaction,
    categories,
    accounts,
    userProfile,
  } = useExpenseStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState('cat-food');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-hdfc');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isReceiptScanOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setIsScanning(true);

      // Clean default merchant from filename
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      setTimeout(() => {
        setIsScanning(false);
        setMerchant(cleanName || 'Receipt Expense');
        setDate(new Date().toISOString().split('T')[0]);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.abs(parseFloat(amount) || 0);
    if (parsedAmount <= 0) return;

    addTransaction({
      amount: parsedAmount,
      type: 'expense',
      categoryId,
      accountId,
      merchant: merchant.trim() || 'Receipt Expense',
      date,
      tags: ['receipt-scan'],
      note: 'Added from receipt bill photo',
    });

    setReceiptScanOpen(false);
    setImagePreview(null);
    setAmount('');
    setMerchant('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Receipt & Bill Scanner</h3>
                <span className="text-xs text-slate-400">Capture or upload your receipt photo to log expenses</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReceiptScanOpen(false);
                setImagePreview(null);
                setAmount('');
                setMerchant('');
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Upload or Drop Area */}
            {!imagePreview ? (
              <label className="block p-8 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl text-center cursor-pointer transition-all bg-slate-950/50 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-amber-400 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Upload Receipt or Bill Photo</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Drag & drop an image or click to select from your device
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-44 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Receipt Preview"
                    className="w-full h-full object-cover opacity-80"
                  />

                  {/* Scanning beam animation */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent flex items-center justify-center">
                      <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-500/40 shadow-xl">
                        <ScanLine className="w-4 h-4 animate-spin" />
                        <span>Processing receipt...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form to verify extracted data */}
                <form onSubmit={handleCommit} className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Merchant or Store Name
                      </label>
                      <input
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        placeholder="e.g. Nature Basket, Restaurant"
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Receipt Amount ({userProfile.currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter total bill amount"
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        {categories.filter((c) => c.type === 'expense').map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Account / Method
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setAmount('');
                        setMerchant('');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={!amount || parseFloat(amount) <= 0}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Add to Ledger</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
