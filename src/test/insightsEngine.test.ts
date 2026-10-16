import { describe, it, expect } from 'vitest';
import { calculateMonthSummary } from '../lib/insightsEngine';
import { DEFAULT_USER_PROFILE } from '../lib/constants';
import { Transaction } from '../types';

describe('Insights and Budget Projections Engine', () => {
  it('computes Safe-To-Spend correctly', () => {
    // Reference date: Day 15 of 30-day month -> 16 days remaining
    const refDate = new Date(2026, 3, 15); // April 15 (30 days)

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        amount: 15000,
        type: 'expense',
        categoryId: 'cat-food',
        accountId: 'acc-hdfc',
        date: '2026-04-10',
        tags: [],
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    const profile = {
      ...DEFAULT_USER_PROFILE,
      overallMonthlyBudget: 47000,
    };

    const summary = calculateMonthSummary(transactions, profile, refDate);

    // Remaining budget = 47000 - 15000 = 32000
    // Days remaining = 30 - 15 + 1 = 16
    // Safe to spend = 32000 / 16 = 2000/day
    expect(summary.spentThisMonth).toBe(15000);
    expect(summary.safeToSpendDaily).toBe(2000);
  });

  it('projects month-end burn rate accurately', () => {
    // Reference date: Day 10 of a 30-day month
    const refDate = new Date(2026, 3, 10);

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        amount: 20000,
        type: 'expense',
        categoryId: 'cat-shopping',
        accountId: 'acc-hdfc',
        date: '2026-04-05',
        tags: [],
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    const profile = {
      ...DEFAULT_USER_PROFILE,
      overallMonthlyBudget: 50000,
    };

    const summary = calculateMonthSummary(transactions, profile, refDate);

    // Avg daily spend = 20000 / 10 days = 2000/day
    // Projected month end = 2000 * 30 days = 60000
    expect(summary.projectedMonthEndSpend).toBe(60000);
    expect(summary.burnRateStatus).toBe('critical'); // 60k > 1.1 * 50k
  });
});
