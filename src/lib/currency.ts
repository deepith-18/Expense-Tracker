/**
 * Formats a numeric amount using the Indian numbering system (Lakhs and Crores)
 * e.g., 1234567 -> ₹12,34,567.00
 */
export function formatCurrency(
  amount: number,
  currencySymbol: string = '₹',
  includeDecimals: boolean = false
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  if (currencySymbol === '₹') {
    // Format according to Indian Numbering System
    const parts = absAmount.toFixed(includeDecimals ? 2 : 0).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherNumbers = integerPart.substring(0, integerPart.length - 3);
      const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      integerPart = `${withCommas},${lastThree}`;
    }

    return `${isNegative ? '-' : ''}${currencySymbol}${integerPart}${decimalPart}`;
  } else {
    // International standard formatting
    const formatted = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: includeDecimals ? 2 : 0,
    });
    return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
  }
}

/**
 * Compact Indian currency representation (K, L, Cr)
 * e.g., 1500 -> ₹1.5K, 250000 -> ₹2.5L, 15000000 -> ₹1.5Cr
 */
export function formatCompactCurrency(
  amount: number,
  currencySymbol: string = '₹'
): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (currencySymbol === '₹') {
    if (abs >= 10000000) {
      return `${sign}${currencySymbol}${(abs / 10000000).toFixed(1)}Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${currencySymbol}${(abs / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      return `${sign}${currencySymbol}${(abs / 1000).toFixed(1)}K`;
    }
    return `${sign}${currencySymbol}${abs.toFixed(0)}`;
  } else {
    if (abs >= 1000000000) {
      return `${sign}${currencySymbol}${(abs / 1000000000).toFixed(1)}B`;
    }
    if (abs >= 1000000) {
      return `${sign}${currencySymbol}${(abs / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${currencySymbol}${(abs / 1000).toFixed(1)}K`;
    }
    return `${sign}${currencySymbol}${abs.toFixed(0)}`;
  }
}

/**
 * Calculates how many hours/minutes of work an expense represents
 * based on monthly income and hours worked per month (e.g. 160 hrs).
 */
export function calculateTimeCost(
  amount: number,
  monthlyIncome: number,
  workHoursPerMonth: number = 160
): { hours: number; minutes: number; formatted: string } {
  if (!monthlyIncome || monthlyIncome <= 0 || !amount || amount <= 0) {
    return { hours: 0, minutes: 0, formatted: '0m' };
  }

  const hourlyRate = monthlyIncome / workHoursPerMonth;
  const totalHours = amount / hourlyRate;
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0 && minutes === 0) {
    return { hours: 0, minutes: 1, formatted: '< 1m' };
  }

  if (hours === 0) {
    return { hours: 0, minutes, formatted: `${minutes}m of work` };
  }

  if (minutes === 0) {
    return { hours, minutes: 0, formatted: `${hours}h of work` };
  }

  return { hours, minutes, formatted: `${hours}h ${minutes}m of work` };
}
