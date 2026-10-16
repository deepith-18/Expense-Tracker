import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useExpenseStore } from '../../store/useExpenseStore';

export const CSVManagerModal: React.FC = () => {
  const { isCSVModalOpen, setCSVModalOpen, exportCSV, importCSV } = useExpenseStore();
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCSVModalOpen) return null;

  const handleDownload = () => {
    const csvContent = exportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `spendsense_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = importCSV(text);
        if (result.added > 0) {
          setImportStatus({ success: true, message: `Successfully imported ${result.added} transactions!` });
          setTimeout(() => setCSVModalOpen(false), 1500);
        } else {
          setImportStatus({ success: false, message: 'Could not parse transactions from this CSV file.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!csvInput.trim()) return;
    const result = importCSV(csvInput);
    if (result.added > 0) {
      setImportStatus({ success: true, message: `Successfully imported ${result.added} transactions!` });
      setTimeout(() => setCSVModalOpen(false), 1500);
    } else {
      setImportStatus({ success: false, message: 'Format error. Header must be: Date,Amount,Type,Category,Merchant,Account,Note' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">CSV Data Portability</h3>
            </div>
            <button
              onClick={() => setCSVModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Export Section */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Export Ledger</h4>
                <p className="text-xs text-slate-400 mt-0.5">Download entire transaction ledger as CSV</p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Import Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Import from CSV</h4>
              <p className="text-xs text-slate-400">
                Upload a CSV file or paste spreadsheet rows (Date, Amount, Type, Category, Merchant, Account, Note).
              </p>

              <label className="block p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl text-center cursor-pointer transition-colors bg-slate-950/40">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-300 block">Click to upload CSV file</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <textarea
                rows={3}
                placeholder="Or paste CSV content here directly..."
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />

              <button
                onClick={handleManualImport}
                disabled={!csvInput.trim()}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  csvInput.trim()
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                }`}
              >
                Parse & Import Pasted Rows
              </button>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {importStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
