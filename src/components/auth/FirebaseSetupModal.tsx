import React, { useState } from 'react';
import {
  X,
  Database,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { isFirebaseConfigured } from '../../lib/firebase';
import { useExpenseStore } from '../../store/useExpenseStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const { showToast } = useExpenseStore();

  if (!isOpen) return null;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each authenticated user has private access to their own data & transactions
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const envTemplate = `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`;

  const copyToClipboard = (text: string, type: 'rules' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'rules') {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
    showToast('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Firebase Firestore & Google Auth Setup
                {isFirebaseConfigured ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Configured
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    Keys Needed in .env
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync all transactions and settings securely to Google Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Why Sign-in is required note */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Why Sign-In is needed for Firestore:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
              <li>
                <strong className="text-slate-900 dark:text-white">Security & Privacy:</strong> Ensures your financial transactions are strictly private. Nobody else can view or edit your database records.
              </li>
              <li>
                <strong className="text-white">Multi-Device Sync:</strong> When you sign in with Google on another phone, tablet, or laptop, all your transactions automatically sync in real-time.
              </li>
              <li>
                <strong className="text-white">Backup Protection:</strong> Clearing browser cache or local storage will never delete your data—it is safely preserved in Firestore.
              </li>
            </ul>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Quick 3-Minute Setup:</h3>

            {/* Step 1 */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    1
                  </span>
                  Create Project & Web App in Firebase Console
                </span>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-500 dark:text-slate-400 pl-7">
                Click &quot;Add Project&quot; &rarr; Add a Web App &rarr; Enable <strong>Authentication</strong> with <strong>Google Sign-In</strong> provider &rarr; Enable <strong>Cloud Firestore</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    2
                  </span>
                  Add your credentials to `.env` file
                </span>
                <button
                  onClick={() => copyToClipboard(envTemplate, 'env')}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {copiedEnv ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedEnv ? 'Copied' : 'Copy template'}
                </button>
              </div>
              <div className="pl-7">
                <pre className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {envTemplate}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                    3
                  </span>
                  Firestore Security Rules (Paste in Firebase Console &rarr; Firestore &rarr; Rules)
                </span>
                <button
                  onClick={() => copyToClipboard(firestoreRules, 'rules')}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {copiedRules ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedRules ? 'Copied' : 'Copy Rules'}
                </button>
              </div>
              <div className="pl-7">
                <pre className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {firestoreRules}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
