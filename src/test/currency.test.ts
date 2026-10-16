import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactCurrency, calculateTimeCost } from '../lib/currency';

describe('Currency and Indian Number Formatting', () => {
  it('formats Indian rupee amounts with correct lakh/crore commas', () => {
    expect(formatCurrency(500, '₹')).toBe('₹500');
    expect(formatCurrency(12345, '₹')).toBe('₹12,345');
    expect(formatCurrency(1234567, '₹')).toBe('₹12,34,567');
    expect(formatCurrency(10000000, '₹')).toBe('₹1,00,00,000');
  });

  it('formats compact currencies correctly', () => {
    expect(formatCompactCurrency(1500, '₹')).toBe('₹1.5K');
    expect(formatCompactCurrency(250000, '₹')).toBe('₹2.5L');
    expect(formatCompactCurrency(15000000, '₹')).toBe('₹1.5Cr');
  });

  it('calculates Time Cost accurately based on hourly earnings', () => {
    // 96000 / 160 hrs = 600/hr
    const timeCost = calculateTimeCost(1200, 96000, 160);
    expect(timeCost.hours).toBe(2);
    expect(timeCost.minutes).toBe(0);
    expect(timeCost.formatted).toBe('2h of work');

    // 300 / 600 = 0.5 hr = 30m
    const thirtyMinCost = calculateTimeCost(300, 96000, 160);
    expect(thirtyMinCost.hours).toBe(0);
    expect(thirtyMinCost.minutes).toBe(30);
    expect(thirtyMinCost.formatted).toBe('30m of work');
  });
});
