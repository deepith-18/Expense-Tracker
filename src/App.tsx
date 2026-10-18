import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  Calculator,
  GitFork,
  Users,
  Plus,
  MessageSquareCode,
  Camera,
  Download,
} from 'lucide-react';
import { useExpenseStore, ActiveTab } from './store/useExpenseStore';

// Layout & Common
import { Navbar } from './components/layout/Navbar';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { UndoToast } from './components/common/UndoToast';
import { CommandPalette } from './components/common/CommandPalette';

// Dashboard Hero
import { HeroMetricCard } from './components/dashboard/HeroMetricCard';
import { DailySafeSpend } from './components/dashboard/DailySafeSpend';
import { BurnRateGauge } from './components/dashboard/BurnRateGauge';
import { CategoryDonut } from './components/dashboard/CategoryDonut';
import { SpendTrendLine } from './components/dashboard/SpendTrendLine';
import { CalendarHeatmap } from './components/dashboard/CalendarHeatmap';

// Ledger & Quick Add Modals
import { TransactionList } from './components/transactions/TransactionList';
import { QuickAddKeypadModal } from './components/transactions/QuickAddKeypadModal';
import { NaturalLanguageAddModal } from './components/transactions/NaturalLanguageAddModal';
import { CSVManagerModal } from './components/transactions/CSVManagerModal';

// Creative Features
import { SpendingPersonalityCard } from './components/features/SpendingPersonalityCard';
import { InsightsFeed } from './components/features/InsightsFeed';
import { WhatIfSimulator } from './components/features/WhatIfSimulator';
import { SankeyDiagram } from './components/features/SankeyDiagram';
import { SplitBillsHub } from './components/features/SplitBillsHub';
import { ReceiptScannerModal } from './components/features/ReceiptScannerModal';
import { SpotifyWrappedModal } from './components/features/SpotifyWrappedModal';
import { FirebaseSetupModal } from './components/auth/FirebaseSetupModal';
import { subscribeToAuthState } from './lib/firebase';
import { subscribeToUserFirestore } from './lib/firestoreSync';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setKeypadOpen,
    setNlpModalOpen,
    setReceiptScanOpen,
    isAuthModalOpen,
    setAuthModalOpen,
    setCurrentUser,
    setSyncStatus,
    applyCloudTransactions,
    applyCloudSettings,
  } = useExpenseStore();

  // Listen to Firebase Auth & Cloud Firestore
  React.useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthState((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });

        // Subscribe to Firestore for real-time cloud data sync
        unsubscribeFirestore = subscribeToUserFirestore(user.uid, {
          onTransactionsChange: (cloudTxs) => {
            if (cloudTxs.length > 0) {
              applyCloudTransactions(cloudTxs);
            }
          },
          onSettingsChange: (settings) => {
            applyCloudSettings(settings);
          },
          onError: (err) => {
            setSyncStatus('error', err.message);
          },
        });
      } else {
        setCurrentUser(null);
        setSyncStatus('local');
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [setCurrentUser, setSyncStatus, applyCloudTransactions, applyCloudSettings]);

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'insights', label: 'Analytics & Trends', icon: Sparkles },
    { id: 'simulator', label: 'Savings Simulator', icon: Calculator },
    { id: 'sankey', label: 'Cash Flow Map', icon: GitFork },
    { id: 'split', label: 'Split Bills', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 space-y-6">
        {/* Desktop Navigation Tabs & Quick Action Bar */}
        <div className="hidden md:flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNlpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-all active:scale-95"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Text Add</span>
            </button>

            <button
              onClick={() => setReceiptScanOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan Receipt</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Spend Metric */}
            <HeroMetricCard />

            {/* Daily Safe Spend & Burn Rate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DailySafeSpend />
              <BurnRateGauge />
            </div>

            {/* Category Donut & Area Trend Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryDonut />
              <SpendTrendLine />
            </div>

            {/* Calendar Heatmap */}
            <CalendarHeatmap />

            {/* Persona & Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingPersonalityCard />
              <InsightsFeed />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <TransactionList />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingPersonalityCard />
              <InsightsFeed />
            </div>
            <CalendarHeatmap />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <WhatIfSimulator />
          </div>
        )}

        {activeTab === 'sankey' && (
          <div className="space-y-6">
            <SankeyDiagram />
          </div>
        )}

        {activeTab === 'split' && (
          <div className="space-y-6">
            <SplitBillsHub />
          </div>
        )}
      </main>

      {/* Mobile Bottom Dock Navigation */}
      <BottomNavigation />

      {/* Floating Modals and Dialogs */}
      <QuickAddKeypadModal />
      <NaturalLanguageAddModal />
      <ReceiptScannerModal />
      <SpotifyWrappedModal />
      <CSVManagerModal />
      <CommandPalette />
      <UndoToast />
      <FirebaseSetupModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default App;
