import { Transaction, SpendingPersonality } from '../types';

export function determineSpendingPersonality(
  transactions: Transaction[],
  monthlyIncome: number = 95000
): SpendingPersonality {
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length === 0) {
    return {
      type: 'Zen Saver',
      title: 'Zen Saver',
      emoji: '🧘‍♂️',
      badge: 'Master of Moderation',
      description: 'Your outflow is peaceful, disciplined, and strictly intentional.',
      statsHighlight: '100% savings rate',
      actionableTip: 'Keep your emergency fund compounding in a liquid mutual fund.',
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
      title: 'Midnight Snacker',
      emoji: '🌙🍕',
      badge: 'Nighttime Gourmet',
      description: 'Your appetite peaks when the moon is high. Late-night deliveries and cravings are your secret guilty pleasure.',
      statsHighlight: `${nightOrders.length} orders logged after 10 PM`,
      actionableTip: 'Stock up your pantry with quick healthy snacks to bypass surge delivery fees.',
    };
  }

  if (weekendRatio >= 0.45) {
    return {
      type: 'Weekend Warrior',
      title: 'Weekend Warrior',
      emoji: '🎉🍹',
      badge: 'Friday-to-Sunday Enthusiast',
      description: 'You live frugally Monday to Thursday, then celebrate the weekend like royalty.',
      statsHighlight: `${Math.round(weekendRatio * 100)}% of expenses hit on weekends`,
      actionableTip: 'Set a dedicated weekend cash pocket to keep Sunday night surprises in check.',
    };
  }

  if (subCount >= 3) {
    return {
      type: 'Subscription Collector',
      title: 'Subscription Collector',
      emoji: '📦🎬',
      badge: 'Streaming & SaaS Connoisseur',
      description: 'You love seamless automated experiences—entertainment, cloud storage, music, and memberships.',
      statsHighlight: `${subCount} active recurring services`,
      actionableTip: 'Audit subscriptions every quarter; pause streaming platforms you haven’t watched in 30 days.',
    };
  }

  if (cafeTrips >= 3) {
    return {
      type: 'Cafe Hopper',
      title: 'Cafe Hopper',
      emoji: '☕🥐',
      badge: 'Artisanal Brew Aficionado',
      description: 'Good conversations, work sprints, and artisanal pour-overs fuel your creative momentum.',
      statsHighlight: `${cafeTrips} cafe check-ins this month`,
      actionableTip: 'Pairing cafe sessions with productive work sprints makes the brew well worth the investment!',
    };
  }

  if (savingsRate >= 0.4) {
    return {
      type: 'Zen Saver',
      title: 'Zen Saver',
      emoji: '🧘‍♂️💎',
      badge: 'High-Discipline Accumulator',
      description: 'Your wealth growth is unstoppable. You consistently save 40%+ of your income without breaking a sweat.',
      statsHighlight: `${Math.round(savingsRate * 100)}% savings rate`,
      actionableTip: 'Ensure your surplus is automatically routed into compounding index funds or SIPs.',
    };
  }

  return {
    type: 'Frugal Architect',
    title: 'Frugal Architect',
    emoji: '📐🏛️',
    badge: 'Strategic Budgeteer',
    description: 'You treat your finances like a balanced blueprinted structure—steady, thoughtful, and pragmatic.',
    statsHighlight: 'Consistent day-by-day distribution',
    actionableTip: 'Consider allocating a small 5% guilt-free fun fund each month for serendipity.',
  };
}
