import { describe, it, expect } from 'vitest';
import { getAllServices, getService } from '@/lib/content/services';

describe('services registry', () => {
  it('lists 7 services sorted by order', async () => {
    const list = await getAllServices('en');
    expect(list).toHaveLength(7);
    expect(list[0].frontmatter.slug).toBe('accounting');
    const orders = list.map(s => s.frontmatter.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
  it('returns vi title for known slug', async () => {
    const s = await getService('tax', 'vi');
    expect(s?.frontmatter.title).toBe('Thuế');
  });
  it('falls back to en when vi missing', async () => {
    const s = await getService('accounting', 'vi');
    expect(s?.frontmatter.slug).toBe('accounting');
  });
  it('exposes stats array on training service', async () => {
    const s = await getService('training', 'en');
    expect(Array.isArray(s?.frontmatter.stats)).toBe(true);
    expect(s?.frontmatter.stats?.length).toBeGreaterThan(0);
    expect(s?.frontmatter.stats?.[0]).toHaveProperty('value');
    expect(s?.frontmatter.stats?.[0]).toHaveProperty('label');
  });
});
