import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareCode,
  X,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Tag,
} from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';
import { parseNaturalLanguageInput, ParsedItem } from '../../lib/nlpParser';
import { IconHelper } from '../common/IconHelper';
import { formatCurrency } from '../../lib/currency';

export const NaturalLanguageAddModal: React.FC = () => {
  const {
    isNlpModalOpen,
    setNlpModalOpen,
    categories,
    accounts,
    addMultipleTransactions,
    userProfile,
  } = useExpenseStore();

  const [input, setInput] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (input.trim()) {
      setParsedItems(parseNaturalLanguageInput(input));
    } else {
      setParsedItems([]);
    }
  }, [input]);

  if (!isNlpModalOpen) return null;

  // Voice Web Speech API
  const toggleVoice = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not available in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleCommit = () => {
    if (parsedItems.length === 0) return;

    const defaultAcc = accounts[0]?.id || 'acc-hdfc';

    const txsToAdd = parsedItems.map((item) => ({
      amount: item.amount,
      type: item.type,
      categoryId: item.categoryId,
      accountId: defaultAcc,
      merchant: item.merchant,
      date: item.date,
      tags: item.tags,
      note: `Parsed from: "${item.raw}"`,
    }));

    addMultipleTransactions(txsToAdd);
    setInput('');
    setNlpModalOpen(false);
  };

  const samplePrompts = [
    'chai 40 and auto 120 yesterday',
    'swiggy 540 dinner and blinkit 320 groceries',
    'shell petrol 1500 and metro 50 today',
    'salary 95000',
    'cult gym 2500 #health',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Quick Text Add</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Type or dictate multiple expenses in plain text</span>
              </div>
            </div>

            <button
              onClick={() => setNlpModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Input and Mic */}
            <div className="relative">
              <textarea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. chai 40 and auto 120 yesterday"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 pr-12 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-medium"
              />
              <button
                type="button"
                onClick={toggleVoice}
                title="Speak using Web Speech API"
                className={`absolute right-3.5 bottom-4 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700/60 transition-colors"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            {/* Live Parsed Preview Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Parsed Items ({parsedItems.length})
                </span>
                {parsedItems.length > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    Total: {formatCurrency(parsedItems.reduce((acc, i) => acc + i.amount, 0), userProfile.currencySymbol)}
                  </span>
                )}
              </div>

              {parsedItems.length === 0 ? (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-transparent">
                  Type an expression like "chai 40 and auto 120 yesterday" above to preview parsed items.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {parsedItems.map((item, idx) => {
                    const cat = categories.find((c) => c.id === item.categoryId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: `${cat?.color || '#10B981'}33`, color: cat?.color }}
                          >
                            <IconHelper name={cat?.icon || 'Tag'} className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{item.merchant}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                                {cat?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                {item.date}
                              </span>
                              {item.tags.length > 0 && (
                                <span className="text-indigo-600 dark:text-indigo-400">#{item.tags.join(' #')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.amount, userProfile.currencySymbol)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Commit Button */}
            <button
              onClick={handleCommit}
              disabled={parsedItems.length === 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm ${
                parsedItems.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save {parsedItems.length} Transaction{parsedItems.length > 1 ? 's' : ''}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
