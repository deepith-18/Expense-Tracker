import { Transaction, SpendingPersonality } from '../types';

export function determineSpendingPersonality(
  transactions: Transaction[],
  monthlyIncome: number = 95000
): SpendingPersonality {
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length === 0) {
    return {
      type: 'Zen Saver',
      title: 'Awaiting Transactions',
      icon: 'ShieldCheck',
      badge: 'Zero Outflow',
      description: 'No expenses recorded yet. As you log items and expenses, your spending patterns and archetype will appear here.',
      statsHighlight: '0 expenses logged',
      actionableTip: 'Add your first expense or income using the Add button to get started.',
    };
  }

  // Check midnight orders (after 22:00 or before 05:00)
  const nightOrders = expenses.filter(t => {
    if (!t.time) return false;
    const hour = parseInt(t.time.split(':')[0], 10);
    return hour >= 22 || hour <= 4;
  });

  // Check weekend spend ratio
  let weekendSpend = 0;
  let totalSpend = 0;
  expenses.forEach(t => {
    totalSpend += t.amount;
    const day = new Date(t.date).getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      weekendSpend += t.amount;
    }
  });

  const weekendRatio = totalSpend > 0 ? weekendSpend / totalSpend : 0;

  // Check subscriptions
  const subCount = expenses.filter(t => t.isRecurring || t.tags.includes('subscription')).length;

  // Check cafe/tea trips
  const cafeTrips = expenses.filter(t => {
    const text = `${t.merchant} ${t.note} ${t.tags.join(' ')}`.toLowerCase();
    return /chai|tea|coffee|starbucks|cafe|roaster/i.test(text);
  }).length;

  // Check savings rate
  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - totalSpend) / monthlyIncome : 0;

  if (nightOrders.length >= 2) {
    return {
      type: 'Midnight Snacker',
      title: 'Nighttime Spending Pattern',
      icon: 'Moon',
      badge: 'Late Night Orders',
      description: 'Multiple transactions logged between 10:00 PM and 5:00 AM, primarily food and delivery services.',
      statsHighlight: `${nightOrders.length} orders logged after 10 PM`,
      actionableTip: 'Plan groceries in advance to reduce reliance on late-night delivery and surge fees.',
    };
  }

  if (weekendRatio >= 0.45) {
    return {
      type: 'Weekend Warrior',
      title: 'Weekend Outflow Concentration',
      icon: 'CalendarDays',
      badge: 'Weekend Surge',
      description: 'Over 45% of total expenses are concentrated on Friday through Sunday.',
      statsHighlight: `${Math.round(weekendRatio * 100)}% of expenses occur on weekends`,
      actionableTip: 'Allocate a weekly weekend envelope to avoid exceeding your monthly allocation.',
    };
  }

  if (subCount >= 3) {
    return {
      type: 'Subscription Collector',
      title: 'Recurring Subscriptions',
      icon: 'CreditCard',
      badge: `${subCount} Active Services`,
      description: 'Multiple automated monthly payments for streaming, utility, and SaaS platforms detected.',
      statsHighlight: `${subCount} recurring services active`,
      actionableTip: 'Review recurring charges each quarter and cancel services unused in the past 30 days.',
    };
  }

  if (cafeTrips >= 3) {
    return {
      type: 'Cafe Hopper',
      title: 'Daily Beverage & Dining',
      icon: 'Coffee',
      badge: 'Frequent Cafe Visits',
      description: 'Frequent visits to cafes, coffee roasters, and quick snack counters throughout the week.',
      statsHighlight: `${cafeTrips} cafe visits recorded this month`,
      actionableTip: 'Setting a dedicated weekly cafe budget helps keep daily small expenses in balance.',
    };
  }

  if (savingsRate >= 0.4) {
    return {
      type: 'Zen Saver',
      title: 'High Savings Rate',
      icon: 'TrendingUp',
      badge: '40%+ Net Savings',
      description: 'Excellent financial discipline. You are saving more than 40% of your total monthly earnings.',
      statsHighlight: `${Math.round(savingsRate * 100)}% savings rate`,
      actionableTip: 'Automate surplus transfers into diversified index funds or liquid emergency reserves.',
    };
  }

  return {
    type: 'Frugal Architect',
    title: 'Balanced Allocation',
    icon: 'Compass',
    badge: 'Steady Trajectory',
    description: 'Spending is evenly distributed across essential categories and daily living expenses.',
    statsHighlight: 'Consistent day-by-day distribution',
    actionableTip: 'Maintain this pacing to finish within your monthly target ceiling.',
  };
}
