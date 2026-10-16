export type TransactionType = 'expense' | 'income' | 'transfer';

export interface SplitParticipant {
  friendId: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface Transaction {
  id: string;
  userId?: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  merchant?: string;
  note?: string;
  tags: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  splitWith?: SplitParticipant[];
  receiptUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Hex color
  monthlyBudget?: number;
  isCustom?: boolean;
  type: 'expense' | 'income';
}

export type AccountType = 'bank' | 'wallet' | 'cash' | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  isDefault?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  emailPhone?: string;
}

export type PersonaType = 
  | 'Weekend Warrior'
  | 'Midnight Snacker'
  | 'Frugal Architect'
  | 'Subscription Collector'
  | 'Cafe Hopper'
  | 'Zen Saver';

export interface SpendingPersonality {
  type: PersonaType;
  title: string;
  emoji: string;
  badge: string;
  description: string;
  statsHighlight: string;
  actionableTip: string;
}

export type InsightSeverity = 'high' | 'medium' | 'info' | 'success';

export interface SmartInsight {
  id: string;
  type: 'anomaly' | 'subscription' | 'budget_warning' | 'achievement' | 'tip';
  title: string;
  message: string;
  metric?: string;
  categoryId?: string;
  severity: InsightSeverity;
  date: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  currency: string; // 'INR' | 'USD' | 'EUR' | 'GBP'
  currencySymbol: string;
  monthlyIncome: number;
  workHoursPerMonth: number; // default 160 hrs
  overallMonthlyBudget: number;
  streakDays: number;
  noSpendDaysCount: number;
  lastActiveDate: string;
}

export interface FilterOptions {
  searchQuery: string;
  categoryIds: string[];
  accountIds: string[];
  tags: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: TransactionType | 'all';
}
