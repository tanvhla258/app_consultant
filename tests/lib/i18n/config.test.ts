import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config';

describe('i18n config', () => {
  it('exposes en and vi as supported locales', () => {
    expect(locales).toEqual(['en', 'vi']);
  });
  it('defaults to en', () => {
    expect(defaultLocale).toBe('en');
  });
  it('isLocale narrows valid strings', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});
