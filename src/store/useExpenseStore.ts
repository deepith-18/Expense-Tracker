import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Transaction,
  Category,
  Account,
  Friend,
  UserProfile,
  FilterOptions,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  DEFAULT_USER_PROFILE,
} from '../lib/constants';
import { generateSeedTransactions, SEED_FRIENDS } from '../lib/seedData';

export type ActiveTab = 'dashboard' | 'transactions' | 'insights' | 'simulator' | 'sankey' | 'split';
export type TimeRange = 'week' | 'month' | 'year';

interface ToastState {
  id: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

interface ExpenseStore {
  // Core Data
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  friends: Friend[];
  userProfile: UserProfile;

  // UI Modes & Toggles
  timeCostMode: boolean;
  activeTab: ActiveTab;
  timeRange: TimeRange;
  isDarkMode: boolean;

  // Modals
  isKeypadOpen: boolean;
  isNlpModalOpen: boolean;
  isWrappedOpen: boolean;
  isReceiptScanOpen: boolean;
  isCSVModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  editingTransaction: Transaction | null;

  // Search & Filters
  filters: FilterOptions;

  // Undo System
  lastDeletedTransaction: Transaction | null;
  toast: ToastState | null;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addMultipleTransactions: (txs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;

  // Categories & Accounts
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategoryBudget: (id: string, budget: number) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccountBalance: (id: string, balance: number) => void;

  // Splits & Friends
  addFriend: (name: string, emailPhone?: string) => void;
  settleSplitItem: (transactionId: string, friendId: string) => void;

  // Profile
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Toggles & Nav
  setTimeCostMode: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTimeRange: (range: TimeRange) => void;
  toggleDarkMode: () => void;

  // Modal controls
  setKeypadOpen: (open: boolean, editTx?: Transaction | null) => void;
  setNlpModalOpen: (open: boolean) => void;
  setWrappedOpen: (open: boolean) => void;
  setReceiptScanOpen: (open: boolean) => void;
  setCSVModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Filters
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;

  // Toasts
  showToast: (message: string, actionText?: string, onAction?: () => void) => void;
  hideToast: () => void;

  // Data management
  resetToDemoData: () => void;
  importCSV: (csvText: string) => { added: number; errors: number };
  exportCSV: () => string;
}

const initialFilters: FilterOptions = {
  searchQuery: '',
  categoryIds: [],
  accountIds: [],
  tags: [],
  type: 'all',
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      transactions: generateSeedTransactions(),
      categories: DEFAULT_CATEGORIES,
      accounts: DEFAULT_ACCOUNTS,
      friends: SEED_FRIENDS,
      userProfile: DEFAULT_USER_PROFILE,

      timeCostMode: false,
      activeTab: 'dashboard',
      timeRange: 'month',
      isDarkMode: true,

      isKeypadOpen: false,
      isNlpModalOpen: false,
      isWrappedOpen: false,
      isReceiptScanOpen: false,
      isCSVModalOpen: false,
      isCommandPaletteOpen: false,
      editingTransaction: null,

      filters: initialFilters,
      lastDeletedTransaction: null,
      toast: null,

      addTransaction: (txData) => {
        const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const now = Date.now();
        const newTx: Transaction = {
          ...txData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          // Adjust account balance
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === newTx.accountId) {
              const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
              return { ...acc, balance: acc.balance + delta };
            }
            return acc;
          });

          return {
            transactions: [newTx, ...state.transactions],
            accounts: updatedAccounts,
            editingTransaction: null,
          };
        });

        get().showToast(`Added ${newTx.type === 'income' ? '+' : '-'}₹${newTx.amount} (${newTx.merchant || 'Expense'})`);
      },

      addMultipleTransactions: (txsData) => {
        const now = Date.now();
        const newTxs: Transaction[] = txsData.map((txData, i) => ({
          ...txData,
          id: `tx-${now}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          createdAt: now + i,
          updatedAt: now + i,
        }));

        set((state) => {
          let updatedAccounts = [...state.accounts];
          newTxs.forEach((newTx) => {
            updatedAccounts = updatedAccounts.map((acc) => {
              if (acc.id === newTx.accountId) {
                const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
                return { ...acc, balance: acc.balance + delta };
              }
              return acc;
            });
          });

          return {
            transactions: [...newTxs, ...state.transactions],
            accounts: updatedAccounts,
          };
        });

        get().showToast(`Added ${newTxs.length} transactions successfully!`);
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
          ),
          editingTransaction: null,
          isKeypadOpen: false,
        }));
        get().showToast('Transaction updated');
      },

      deleteTransaction: (id) => {
        const txToDelete = get().transactions.find((t) => t.id === id);
        if (!txToDelete) return;

        set((state) => {
          // Revert balance impact
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === txToDelete.accountId) {
              const delta = txToDelete.type === 'income' ? -txToDelete.amount : txToDelete.amount;
              return { ...acc, balance: acc.balance + delta };
            }
            return acc;
          });

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
            lastDeletedTransaction: txToDelete,
          };
        });

        get().showToast('Transaction deleted', 'Undo', () => {
          get().undoDelete();
        });
      },

      undoDelete: () => {
        const tx = get().lastDeletedTransaction;
        if (!tx) return;

        set((state) => {
          const updatedAccounts = state.accounts.map((acc) => {
            if (acc.id === tx.accountId) {
              const delta = tx.type === 'income' ? tx.amount : -tx.amount;
              return { ...acc, balance: acc.balance + delta };
            }
            return acc;
          });

          return {
            transactions: [tx, ...state.transactions],
            accounts: updatedAccounts,
            lastDeletedTransaction: null,
          };
        });

        get().showToast('Transaction restored');
      },

      addCategory: (categoryData) => {
        const id = `cat-${Date.now()}`;
        const newCat: Category = {
          ...categoryData,
          id,
          isCustom: true,
        };
        set((state) => ({ categories: [...state.categories, newCat] }));
        get().showToast(`Category "${newCat.name}" added`);
      },

      updateCategoryBudget: (id, budget) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, monthlyBudget: budget } : c
          ),
        }));
        get().showToast('Category budget updated');
      },

      addAccount: (accountData) => {
        const id = `acc-${Date.now()}`;
        const newAcc: Account = {
          ...accountData,
          id,
        };
        set((state) => ({ accounts: [...state.accounts, newAcc] }));
        get().showToast(`Account "${newAcc.name}" created`);
      },

      updateAccountBalance: (id, balance) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, balance } : a)),
        }));
      },

      addFriend: (name, emailPhone) => {
        const id = `f-${Date.now()}`;
        const newFriend: Friend = {
          id,
          name,
          emailPhone,
          avatar: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
        };
        set((state) => ({ friends: [...state.friends, newFriend] }));
        get().showToast(`Friend "${name}" added`);
      },

      settleSplitItem: (transactionId, friendId) => {
        set((state) => ({
          transactions: state.transactions.map((tx) => {
            if (tx.id === transactionId && tx.splitWith) {
              const updatedSplits = tx.splitWith.map((p) =>
                p.friendId === friendId ? { ...p, paid: true } : p
              );
              return { ...tx, splitWith: updatedSplits };
            }
            return tx;
          }),
        }));
        get().showToast('Settled up successfully!');
      },

      updateUserProfile: (updates) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        }));
        get().showToast('Profile updated');
      },

      setTimeCostMode: (enabled) => {
        set((state) => ({
          timeCostMode: typeof enabled === 'function' ? enabled(state.timeCostMode) : enabled,
        }));
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setTimeRange: (range) => set({ timeRange: range }),
      toggleDarkMode: () => {
        set((state) => {
          const next = !state.isDarkMode;
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: next };
        });
      },

      setKeypadOpen: (open, editTx = null) => {
        set({ isKeypadOpen: open, editingTransaction: editTx });
      },
      setNlpModalOpen: (open) => set({ isNlpModalOpen: open }),
      setWrappedOpen: (open) => set({ isWrappedOpen: open }),
      setReceiptScanOpen: (open) => set({ isReceiptScanOpen: open }),
      setCSVModalOpen: (open) => set({ isCSVModalOpen: open }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      setFilters: (newFilters) => {
        set((state) => ({ filters: { ...state.filters, ...newFilters } }));
      },
      resetFilters: () => set({ filters: initialFilters }),

      showToast: (message, actionText, onAction) => {
        const id = `toast-${Date.now()}`;
        set({ toast: { id, message, actionText, onAction } });
        setTimeout(() => {
          const cur = get().toast;
          if (cur && cur.id === id) {
            set({ toast: null });
          }
        }, 4000);
      },
      hideToast: () => set({ toast: null }),

      resetToDemoData: () => {
        set({
          transactions: generateSeedTransactions(),
          categories: DEFAULT_CATEGORIES,
          accounts: DEFAULT_ACCOUNTS,
          friends: SEED_FRIENDS,
          userProfile: DEFAULT_USER_PROFILE,
        });
        get().showToast('Reset to demo data!');
      },

      importCSV: (csvText: string) => {
        try {
          const lines = csvText.trim().split('\n');
          if (lines.length < 2) return { added: 0, errors: 1 };

          // Expect header: Date,Amount,Type,Category,Merchant,Account,Note
          const newTxs: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
            const date = parts[0] || new Date().toISOString().split('T')[0];
            const amount = Math.abs(parseFloat(parts[1]) || 0);
            const type = (parts[2]?.toLowerCase() === 'income' ? 'income' : 'expense') as 'expense' | 'income';
            const catName = parts[3] || 'Food & Dining';
            const merchant = parts[4] || 'Expense';
            const note = parts[6] || '';

            // Match category
            const foundCat = get().categories.find((c) => c.name.toLowerCase() === catName.toLowerCase()) || get().categories[0];
            const defaultAcc = get().accounts[0];

            if (amount > 0) {
              newTxs.push({
                amount,
                type,
                categoryId: foundCat.id,
                accountId: defaultAcc.id,
                date,
                merchant,
                note,
                tags: [],
              });
            }
          }

          if (newTxs.length > 0) {
            get().addMultipleTransactions(newTxs);
            return { added: newTxs.length, errors: 0 };
          }
          return { added: 0, errors: 1 };
        } catch (e) {
          return { added: 0, errors: 1 };
        }
      },

      exportCSV: () => {
        const { transactions, categories, accounts } = get();
        const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
        const accMap = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

        const headers = ['Date', 'Amount', 'Type', 'Category', 'Merchant', 'Account', 'Note', 'Tags'];
        const rows = transactions.map((t) => [
          t.date,
          t.amount,
          t.type,
          `"${catMap[t.categoryId] || t.categoryId}"`,
          `"${t.merchant || ''}"`,
          `"${accMap[t.accountId] || t.accountId}"`,
          `"${(t.note || '').replace(/"/g, '""')}"`,
          `"${t.tags.join(';')}"`,
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      },
    }),
    {
      name: 'spendsense-storage-v1',
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        accounts: state.accounts,
        friends: state.friends,
        userProfile: state.userProfile,
        timeCostMode: state.timeCostMode,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
