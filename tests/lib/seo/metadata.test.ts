import { describe, it, expect } from 'vitest';
import { buildMetadata } from '@/lib/seo/metadata';

describe('buildMetadata', () => {
  it('builds canonical and hreflang alternates', () => {
    const m = buildMetadata({
      locale: 'en',
      path: '/services',
      title: 'Services',
      description: 'desc',
    });
    expect(m.alternates?.canonical).toBe('https://app.com/en/services');
    expect(m.alternates?.languages).toEqual({
      en: 'https://app.com/en/services',
      vi: 'https://app.com/vi/services',
    });
    expect(m.title).toBe('Services');
  });
  it('handles root path per locale', () => {
    const m = buildMetadata({ locale: 'vi', path: '/', title: 'Trang chủ', description: 'd' });
    expect(m.alternates?.canonical).toBe('https://app.com/vi');
  });
});
