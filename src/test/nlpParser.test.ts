import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageInput } from '../lib/nlpParser';

describe('Natural Language Expense Parser', () => {
  it('parses single expense and amount', () => {
    const items = parseNaturalLanguageInput('chai 40');
    expect(items.length).toBe(1);
    expect(items[0].merchant).toBe('Chai');
    expect(items[0].amount).toBe(40);
    expect(items[0].categoryId).toBe('cat-food');
  });

  it('parses multi-expense phrase "chai 40 and auto 120 yesterday"', () => {
    const items = parseNaturalLanguageInput('chai 40 and auto 120 yesterday');
    expect(items.length).toBe(2);

    expect(items[0].merchant).toBe('Chai');
    expect(items[0].amount).toBe(40);
    expect(items[0].categoryId).toBe('cat-food');

    expect(items[1].merchant).toBe('Auto');
    expect(items[1].amount).toBe(120);
    expect(items[1].categoryId).toBe('cat-commute');

    // Both should reflect yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const expectedDate = yesterday.toISOString().split('T')[0];
    expect(items[0].date).toBe(expectedDate);
    expect(items[1].date).toBe(expectedDate);
  });

  it('detects tags from phrase like "swiggy 450 #dinner"', () => {
    const items = parseNaturalLanguageInput('swiggy 450 #dinner');
    expect(items.length).toBe(1);
    expect(items[0].amount).toBe(450);
    expect(items[0].tags).toContain('dinner');
    expect(items[0].categoryId).toBe('cat-food');
  });

  it('detects income type for salary phrase', () => {
    const items = parseNaturalLanguageInput('salary 95000');
    expect(items.length).toBe(1);
    expect(items[0].amount).toBe(95000);
    expect(items[0].type).toBe('income');
    expect(items[0].categoryId).toBe('cat-salary');
  });
});
