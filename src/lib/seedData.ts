import { Transaction, Friend } from '../types';

export const SEED_FRIENDS: Friend[] = [
  { id: 'f-1', name: 'Rahul Sharma', avatar: 'RS' },
  { id: 'f-2', name: 'Ananya Roy', avatar: 'AR' },
  { id: 'f-3', name: 'Karthik V', avatar: 'KV' },
  { id: 'f-4', name: 'Pooja Nair', avatar: 'PN' },
];

export function generateSeedTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Helper to format date YYYY-MM-DD
  const makeDate = (day: number, monthOffset: number = 0): string => {
    const d = new Date(year, month + monthOffset, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const currentDay = Math.max(1, now.getDate());

  const items: Partial<Transaction>[] = [
    // Income
    {
      amount: 95000,
      type: 'income',
      categoryId: 'cat-salary',
      accountId: 'acc-hdfc',
      date: makeDate(1),
      time: '09:00',
      merchant: 'TechCorp Salary',
      note: 'October Monthly Salary Credit',
      tags: ['salary', 'income'],
    },
    {
      amount: 15000,
      type: 'income',
      categoryId: 'cat-freelance',
      accountId: 'acc-upi',
      date: makeDate(10),
      time: '14:20',
      merchant: 'UI/UX Client Project',
      note: 'Design sprint milestone',
      tags: ['freelance', 'side-gig'],
    },

    // Expenses - Recurring Subscriptions
    {
      amount: 649,
      type: 'expense',
      categoryId: 'cat-entertainment',
      accountId: 'acc-credit',
      date: makeDate(4),
      time: '04:10',
      merchant: 'Netflix Premium',
      note: 'Monthly 4K plan',
      tags: ['subscription', 'ott'],
      isRecurring: true,
      recurringFrequency: 'monthly',
    },
    {
      amount: 299,
      type: 'expense',
      categoryId: 'cat-entertainment',
      accountId: 'acc-credit',
      date: makeDate(7),
      time: '08:00',
      merchant: 'Spotify Premium Family',
      note: 'Audio streaming',
      tags: ['subscription', 'music'],
      isRecurring: true,
      recurringFrequency: 'monthly',
    },
    {
      amount: 1499,
      type: 'expense',
      categoryId: 'cat-bills',
      accountId: 'acc-credit',
      date: makeDate(5),
      time: '11:00',
      merchant: 'Airtel Broadband Fiber',
      note: 'Gigabit fiber internet bill',
      tags: ['bills', 'broadband', 'subscription'],
      isRecurring: true,
      recurringFrequency: 'monthly',
    },
    {
      amount: 2500,
      type: 'expense',
      categoryId: 'cat-health',
      accountId: 'acc-hdfc',
      date: makeDate(3),
      time: '07:30',
      merchant: 'Cult.Fit Gym Membership',
      note: 'Monthly fitness pack',
      tags: ['health', 'subscription'],
      isRecurring: true,
      recurringFrequency: 'monthly',
    },

    // Food & Dining (Includes night snack and weekend party)
    {
      amount: 450,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 14)),
      time: '23:45',
      merchant: 'Swiggy - Midnight Biryani',
      note: 'Late night craving with extra raita',
      tags: ['food', 'night-order'],
    },
    {
      amount: 320,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 12)),
      time: '13:15',
      merchant: 'Chai Point & Samosa',
      note: 'Team afternoon tea',
      tags: ['food', 'snacks'],
    },
    {
      amount: 1850,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-credit',
      date: makeDate(Math.min(currentDay, 10)),
      time: '20:30',
      merchant: 'Toit Brewpub Dinner',
      note: 'Craft beer & sourdough pizza with friends',
      tags: ['weekend', 'dining', 'food'],
      splitWith: [
        { friendId: 'f-1', name: 'Rahul Sharma', amount: 600, paid: true },
        { friendId: 'f-2', name: 'Ananya Roy', amount: 600, paid: false },
      ],
    },
    {
      amount: 540,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 8)),
      time: '19:40',
      merchant: 'Zomato - Burger King',
      note: 'Whopper combo',
      tags: ['food', 'delivery'],
    },
    {
      amount: 280,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-cash',
      date: makeDate(Math.min(currentDay, 5)),
      time: '08:45',
      merchant: 'Udupi Upahar',
      note: 'Masala Dosa & Filter Coffee',
      tags: ['food', 'breakfast'],
    },

    // Groceries
    {
      amount: 1250,
      type: 'expense',
      categoryId: 'cat-groceries',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 13)),
      time: '10:15',
      merchant: 'Blinkit Instant Mart',
      note: 'Fresh veggies, almond milk, sourdough',
      tags: ['groceries', 'quick-commerce'],
    },
    {
      amount: 2400,
      type: 'expense',
      categoryId: 'cat-groceries',
      accountId: 'acc-credit',
      date: makeDate(Math.min(currentDay, 6)),
      time: '17:30',
      merchant: 'Nature Basket Supermarket',
      note: 'Monthly pantry restock & spices',
      tags: ['groceries'],
    },

    // Commute & Travel
    {
      amount: 320,
      type: 'expense',
      categoryId: 'cat-commute',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 15)),
      time: '09:10',
      merchant: 'Uber Auto',
      note: 'Office ride Indiranagar',
      tags: ['travel', 'office'],
    },
    {
      amount: 1500,
      type: 'expense',
      categoryId: 'cat-commute',
      accountId: 'acc-credit',
      date: makeDate(Math.min(currentDay, 9)),
      time: '18:00',
      merchant: 'Shell Petrol Pump',
      note: 'V-Power petrol tank fill',
      tags: ['fuel', 'vehicle'],
    },
    {
      amount: 240,
      type: 'expense',
      categoryId: 'cat-commute',
      accountId: 'acc-cash',
      date: makeDate(Math.min(currentDay, 4)),
      time: '19:30',
      merchant: 'Metro Smart Card Recharge',
      note: 'Namma Metro 50 trips balance',
      tags: ['commute'],
    },

    // Shopping
    {
      amount: 2899,
      type: 'expense',
      categoryId: 'cat-shopping',
      accountId: 'acc-credit',
      date: makeDate(Math.min(currentDay, 11)),
      time: '16:00',
      merchant: 'Myntra Fashion',
      note: 'Cotton linen shirts',
      tags: ['shopping', 'clothing'],
    },
    {
      amount: 999,
      type: 'expense',
      categoryId: 'cat-shopping',
      accountId: 'acc-upi',
      date: makeDate(Math.min(currentDay, 2)),
      time: '12:00',
      merchant: 'Amazon Basics',
      note: 'Desk cable organizer & USB-C hub',
      tags: ['workstation', 'tech'],
    },

    // Investments
    {
      amount: 15000,
      type: 'expense',
      categoryId: 'cat-investment',
      accountId: 'acc-hdfc',
      date: makeDate(2),
      time: '10:00',
      merchant: 'Zerodha Coin SIP',
      note: 'Nifty 50 Index Fund Monthly SIP',
      tags: ['investment', 'wealth'],
    },
  ];

  // Also populate last month transactions for realistic month-over-month comparison!
  const lastMonthDays = [2, 5, 8, 12, 16, 20, 24, 28];
  const lastMonthExpenses: Partial<Transaction>[] = [
    {
      amount: 95000,
      type: 'income',
      categoryId: 'cat-salary',
      accountId: 'acc-hdfc',
      date: makeDate(1, -1),
      merchant: 'TechCorp Salary',
      tags: ['salary'],
    },
    {
      amount: 3200,
      type: 'expense',
      categoryId: 'cat-food',
      accountId: 'acc-credit',
      date: makeDate(lastMonthDays[0], -1),
      merchant: 'Social Cafe Dinner',
      tags: ['dining'],
    },
    {
      amount: 4800,
      type: 'expense',
      categoryId: 'cat-groceries',
      accountId: 'acc-credit',
      date: makeDate(lastMonthDays[1], -1),
      merchant: 'Zepto Mart',
      tags: ['groceries'],
    },
    {
      amount: 2200,
      type: 'expense',
      categoryId: 'cat-shopping',
      accountId: 'acc-credit',
      date: makeDate(lastMonthDays[2], -1),
      merchant: 'Zara Store',
      tags: ['shopping'],
    },
    {
      amount: 1499,
      type: 'expense',
      categoryId: 'cat-bills',
      accountId: 'acc-credit',
      date: makeDate(lastMonthDays[3], -1),
      merchant: 'Airtel Broadband',
      tags: ['bills'],
    },
    {
      amount: 1800,
      type: 'expense',
      categoryId: 'cat-commute',
      accountId: 'acc-upi',
      date: makeDate(lastMonthDays[4], -1),
      merchant: 'Uber Cabs',
      tags: ['travel'],
    },
    {
      amount: 15000,
      type: 'expense',
      categoryId: 'cat-investment',
      accountId: 'acc-hdfc',
      date: makeDate(lastMonthDays[5], -1),
      merchant: 'Zerodha SIP',
      tags: ['investment'],
    },
  ];

  const allRaw = [...items, ...lastMonthExpenses];

  return allRaw.map((tx, idx) => ({
    id: `seed-tx-${idx + 1}`,
    amount: tx.amount || 0,
    type: tx.type || 'expense',
    categoryId: tx.categoryId || 'cat-food',
    accountId: tx.accountId || 'acc-upi',
    date: tx.date || makeDate(currentDay),
    time: tx.time || '12:00',
    merchant: tx.merchant || 'General Merchant',
    note: tx.note || '',
    tags: tx.tags || [],
    isRecurring: tx.isRecurring || false,
    recurringFrequency: tx.recurringFrequency,
    splitWith: tx.splitWith || [],
    receiptUrl: tx.receiptUrl,
    createdAt: Date.now() - (allRaw.length - idx) * 86400000,
    updatedAt: Date.now() - (allRaw.length - idx) * 86400000,
  }));
}
