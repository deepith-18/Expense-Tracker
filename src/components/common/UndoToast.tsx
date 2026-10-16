import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';

export const UndoToast: React.FC = () => {
  const { toast, hideToast } = useExpenseStore();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md max-w-sm w-full mx-4"
        >
          <div className="flex-1 text-sm font-medium tracking-tight truncate">
            {toast.message}
          </div>

          {toast.actionText && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                hideToast();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {toast.actionText}
            </button>
          )}

          <button
            onClick={hideToast}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
