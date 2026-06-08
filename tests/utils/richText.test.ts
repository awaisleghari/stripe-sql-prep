import { describe, it, expect } from 'vitest';
import { wrapProse } from '@/utils/richText';

describe('wrapProse', () => {
  it('chips uppercase SQL keywords (incl. multi-word) but not lowercase prose words', () => {
    const out = wrapProse('This is pure SELECT — no WHERE, no GROUP BY.');
    expect(out).toContain('<code class="inline">SELECT</code>');
    expect(out).toContain('<code class="inline">WHERE</code>');
    expect(out).toContain('<code class="inline">GROUP BY</code>');
    expect(out).not.toContain('<code class="inline">is</code>');
  });

  it('chips snake_case identifiers', () => {
    const out = wrapProse('return charge_id and merchant_id');
    expect(out).toContain('<code class="inline">charge_id</code>');
    expect(out).toContain('<code class="inline">merchant_id</code>');
  });

  it('preserves existing code spans without double-wrapping', () => {
    const input = 'use <code class="inline">charge_id</code> here';
    expect(wrapProse(input)).toBe(input);
  });

  it('leaves bare numbers in prose untouched', () => {
    expect(wrapProse('the top 5 rows')).toBe('the top 5 rows');
  });
});
