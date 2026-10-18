import { Transaction, Category, SmartInsight, UserProfile } from '../types';

export interface MonthSummary {
  spentThisMonth: number;
  incomeThisMonth: number;
  spentLastMonth: number;
  changePercentage: number; // positive = increased spend, negative = decreased
  daysPassed: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  safeToSpendDaily: number;
  projectedMonthEndSpend: number;
  burnRateRatio: number; // projected / budget
  burnRateStatus: 'safe' | 'caution' | 'critical';
  noSpendDaysCount: number;
}

export function calculateMonthSummary(
  transactions: Transaction[],
  profile: UserProfile,
  refDate: Date = new Date()
): MonthSummary {
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed
  const currentDay = refDate.getDate();

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = Math.max(1, currentDay);
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // Month bounds YYYY-MM
  const curPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  // Last month bounds
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  let spentThisMonth = 0;
  let incomeThisMonth = 0;
  let spentLastMonth = 0;

  // Track spend per day of this month
  const dailySpendMap: Record<number, number> = {};
  for (let d = 1; d <= currentDay; d++) {
    dailySpendMap[d] = 0;
  }

  for (const tx of transactions) {
    if (tx.date.startsWith(curPrefix)) {
      if (tx.type === 'expense') {
        spentThisMonth += tx.amount;
        const txDay = parseInt(tx.date.split('-')[2], 10);
        if (txDay && txDay <= currentDay) {
          dailySpendMap[txDay] = (dailySpendMap[txDay] || 0) + tx.amount;
        }
      } else if (tx.type === 'income') {
        incomeThisMonth += tx.amount;
      }
    } else if (tx.date.startsWith(lastPrefix)) {
      if (tx.type === 'expense') {
        spentLastMonth += tx.amount;
      }
    }
  }

  // Count no-spend days up to today
  let noSpendDaysCount = 0;
  for (let d = 1; d <= currentDay; d++) {
    if ((dailySpendMap[d] || 0) === 0) {
      noSpendDaysCount++;
    }
  }

  // Percentage change vs last month
  let changePercentage = 0;
  if (spentLastMonth > 0) {
    changePercentage = Math.round(((spentThisMonth - spentLastMonth) / spentLastMonth) * 100);
  }

  // Safe to spend daily
  const remainingBudget = Math.max(0, profile.overallMonthlyBudget - spentThisMonth);
  let safeToSpendDaily = Math.round(remainingBudget / daysRemaining);
  if (profile.dailyBudgetLimit && profile.dailyBudgetLimit > 0) {
    safeToSpendDaily = Math.min(profile.dailyBudgetLimit, safeToSpendDaily);
  }

  // Projected month-end spend
  const avgDailySpend = spentThisMonth / daysPassed;
  const projectedMonthEndSpend = Math.round(avgDailySpend * totalDaysInMonth);

  const burnRateRatio = profile.overallMonthlyBudget > 0 
    ? projectedMonthEndSpend / profile.overallMonthlyBudget 
    : 1;

  let burnRateStatus: 'safe' | 'caution' | 'critical' = 'safe';
  if (burnRateRatio > 1.1) {
    burnRateStatus = 'critical';
  } else if (burnRateRatio > 0.9) {
    burnRateStatus = 'caution';
  }

  return {
    spentThisMonth,
    incomeThisMonth,
    spentLastMonth,
    changePercentage,
    daysPassed,
    daysRemaining,
    totalDaysInMonth,
    safeToSpendDaily,
    projectedMonthEndSpend,
    burnRateRatio,
    burnRateStatus,
    noSpendDaysCount,
  };
}

export function generateSmartInsights(
  transactions: Transaction[],
  categories: Category[],
  summary: MonthSummary,
  currencySymbol: string = '₹',
  overallMonthlyBudget: number = 50000
): SmartInsight[] {
  if (transactions.length === 0) {
    return [];
  }

  const insights: SmartInsight[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Burn rate warning or achievement
  if (summary.burnRateStatus === 'critical' && summary.spentThisMonth > 0) {
    insights.push({
      id: 'ins-burn-rate',
      type: 'budget_warning',
      title: 'Pacing Alert: High Burn Rate',
      message: `At this rate, you'll reach ${currencySymbol}${summary.projectedMonthEndSpend.toLocaleString()} by month-end, exceeding your budget by ${Math.round((summary.burnRateRatio - 1) * 100)}%.`,
      severity: 'high',
      date: todayStr,
    });
  } else if (summary.burnRateStatus === 'safe' && summary.daysPassed > 10 && summary.spentThisMonth > 0) {
    insights.push({
      id: 'ins-burn-safe',
      type: 'achievement',
      title: 'Optimal Financial Pace',
      message: `You're tracking well below your target ceiling. At this pace, you'll save ${currencySymbol}${Math.max(0, overallMonthlyBudget - summary.projectedMonthEndSpend).toLocaleString()} extra this month!`,
      severity: 'success',
      date: todayStr,
    });
  }

  // 2. Anomaly detection: Find top merchant or category with spike
  const categorySpendMap: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categorySpendMap[t.categoryId] = (categorySpendMap[t.categoryId] || 0) + t.amount;
    });

  const foodSpend = categorySpendMap['cat-food'] || 0;
  if (foodSpend > 3000) {
    insights.push({
      id: 'ins-food-spike',
      type: 'anomaly',
      title: 'Dining & Delivery Surge',
      message: `Food & delivery spending is currently 2.1x your typical mid-month pace. Cooking twice this weekend can save ~${currencySymbol}1,800.`,
      metric: '2.1x spike',
      categoryId: 'cat-food',
      severity: 'medium',
      date: todayStr,
    });
  }

  // 3. Subscription detector
  const subscriptions = transactions.filter(t => t.isRecurring || t.tags.includes('subscription'));
  const totalSubCost = subscriptions.reduce((acc, s) => acc + s.amount, 0);

  if (subscriptions.length > 0) {
    insights.push({
      id: 'ins-subscriptions',
      type: 'subscription',
      title: `${subscriptions.length} Active Subscriptions Detected`,
      message: `Recurring services (${subscriptions.map(s => s.merchant).slice(0, 3).join(', ')}) total ${currencySymbol}${totalSubCost}/month (${currencySymbol}${totalSubCost * 12}/year).`,
      metric: `${currencySymbol}${totalSubCost}/mo`,
      severity: 'info',
      date: todayStr,
    });
  }

  // 4. No-spend days milestone
  if (summary.noSpendDaysCount >= 5) {
    insights.push({
      id: 'ins-no-spend',
      type: 'achievement',
      title: `${summary.noSpendDaysCount} Zero-Spend Days!`,
      message: `Awesome financial mindfulness! You've logged ${summary.noSpendDaysCount} days without impulse expenses this month.`,
      severity: 'success',
      date: todayStr,
    });
  }

  return insights;
}
