export interface ParsedItem {
  raw: string;
  amount: number;
  type: 'expense' | 'income';
  merchant: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'cat-food': [
    'chai', 'tea', 'coffee', 'starbucks', 'biryani', 'swiggy', 'zomato', 'burger',
    'pizza', 'dominos', 'lunch', 'dinner', 'breakfast', 'snack', 'restaurant',
    'cafe', 'dosa', 'roti', 'subway', 'mcdonalds', 'kfc', 'bar', 'beer', 'drink'
  ],
  'cat-commute': [
    'auto', 'uber', 'ola', 'cab', 'taxi', 'rapido', 'petrol', 'fuel', 'diesel',
    'metro', 'bus', 'train', 'flight', 'ticket', 'toll', 'parking'
  ],
  'cat-groceries': [
    'blinkit', 'zepto', 'instamart', 'milk', 'vegetables', 'fruits', 'grocery',
    'groceries', 'supermarket', 'bread', 'eggs', 'mandi', 'dmart', 'bigbasket'
  ],
  'cat-entertainment': [
    'netflix', 'spotify', 'prime', 'amazon prime', 'movie', 'cinema', 'hotstar',
    'theatre', 'bookmyshow', 'game', 'gaming', 'steam', 'concert'
  ],
  'cat-shopping': [
    'amazon', 'flipkart', 'myntra', 'zara', 'clothes', 'shoes', 'shirt', 'dress',
    'shopping', 'gadget', 'headphones', 'watch', 'h&m', 'electronics'
  ],
  'cat-bills': [
    'wifi', 'broadband', 'airtel', 'jio', 'electricity', 'water', 'rent', 'recharge',
    'bescom', 'gas', 'cylinder', 'maintenance', 'bill'
  ],
  'cat-health': [
    'gym', 'cult', 'cultfit', 'medicine', 'doctor', 'pharmacy', 'apollo',
    'hospital', 'dental', 'protein', 'vitamins', '1mg'
  ],
  'cat-investment': [
    'sip', 'zerodha', 'groww', 'nifty', 'mutual fund', 'stocks', 'gold', 'crypto',
    'etf', 'ppf', 'fixed deposit', 'fd'
  ],
  'cat-salary': [
    'salary', 'bonus', 'paycheck', 'stipend', 'dividend', 'interest'
  ],
  'cat-freelance': [
    'freelance', 'consulting', 'gig', 'upwork', 'fiverr', 'client payment'
  ]
};

/**
 * Resolves date phrases like 'yesterday', 'today', '2 days ago', etc.
 */
function resolveDatePhrase(phrase: string, defaultDate: Date = new Date()): string {
  const d = new Date(defaultDate);
  const lower = phrase.toLowerCase().trim();

  if (lower.includes('day before yesterday')) {
    d.setDate(d.getDate() - 2);
  } else if (lower.includes('yesterday')) {
    d.setDate(d.getDate() - 1);
  } else if (lower.includes('tomorrow')) {
    d.setDate(d.getDate() + 1);
  } else {
    const daysAgoMatch = lower.match(/(\d+)\s*days?\s*ago/);
    if (daysAgoMatch) {
      d.setDate(d.getDate() - parseInt(daysAgoMatch[1], 10));
    }
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Guesses category and transaction type from words in text
 */
export function guessCategory(text: string): { categoryId: string; type: 'expense' | 'income' } {
  const lower = text.toLowerCase();

  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        const isIncome = catId === 'cat-salary' || catId === 'cat-freelance';
        return { categoryId: catId, type: isIncome ? 'income' : 'expense' };
      }
    }
  }

  return { categoryId: 'cat-food', type: 'expense' };
}

/**
 * Natural language parser that handles phrases like:
 * "chai 40 and auto 120 yesterday" -> 2 items: Chai ₹40, Auto ₹120 (dated yesterday)
 * "swiggy 450 #dinner" -> 1 item: Swiggy ₹450
 * "salary 95000" -> 1 income item: Salary ₹95,000
 */
export function parseNaturalLanguageInput(input: string): ParsedItem[] {
  if (!input || !input.trim()) return [];

  // Check if there is an overarching date at the end or beginning (e.g., "yesterday" or "today")
  let globalDate = resolveDatePhrase(input);

  // Split multiple clauses joined by "and", "then", ",", "&", or "+"
  // But be careful not to split words like "band" or "brand"
  const clauses = input.split(/\s+(?:and|then|&|\+)\s+|,\s*/i);

  const results: ParsedItem[] = [];

  for (const rawClause of clauses) {
    const clause = rawClause.trim();
    if (!clause) continue;

    // Extract tags (#tag)
    const tags: string[] = [];
    const tagMatches = clause.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(t => tags.push(t.replace('#', '').toLowerCase()));
    }

    // Clean out tags for parsing
    let cleaned = clause.replace(/#\w+/g, '').trim();

    // Look for date inside this specific clause
    let itemDate = globalDate;
    if (/yesterday|tomorrow|day before yesterday|\d+\s*days?\s*ago/i.test(cleaned)) {
      itemDate = resolveDatePhrase(cleaned);
      cleaned = cleaned.replace(/yesterday|tomorrow|day before yesterday|\d+\s*days?\s*ago/gi, '').trim();
    }

    // Look for amounts: e.g. 40, ₹120, rs 500, 50k, 2.5k
    let amount = 0;
    const amountMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|l|cr)?\b/i);

    if (amountMatch) {
      let num = parseFloat(amountMatch[1]);
      const suffix = (amountMatch[2] || '').toLowerCase();
      if (suffix === 'k') num *= 1000;
      else if (suffix === 'l') num *= 100000;
      else if (suffix === 'cr') num *= 10000000;
      amount = num;

      // Merchant/label is what's left after removing the amount
      cleaned = cleaned.replace(amountMatch[0], '').trim();
    }

    // If no amount was detected, check if any token is a number
    if (amount === 0) {
      const tokens = cleaned.split(/\s+/);
      for (const t of tokens) {
        const val = parseFloat(t);
        if (!isNaN(val) && val > 0) {
          amount = val;
          cleaned = cleaned.replace(t, '').trim();
          break;
        }
      }
    }

    // Determine merchant name from remaining text, capitalize nicely
    let merchant = cleaned
      .replace(/^(for|on|at|paid|spent|got)\s+/i, '')
      .replace(/\s+(for|at|on)$/i, '')
      .trim();

    if (!merchant) {
      merchant = 'Quick Expense';
    } else {
      merchant = merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    const { categoryId, type } = guessCategory(clause);

    if (amount > 0) {
      results.push({
        raw: clause,
        amount,
        type,
        merchant,
        categoryId,
        date: itemDate,
        tags,
        confidence: 0.9,
      });
    }
  }

  return results;
}
