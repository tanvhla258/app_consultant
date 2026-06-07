import { describe, it, expect } from 'vitest';
import { getDictionary } from '@/lib/i18n/get-dictionary';

describe('getDictionary', () => {
  it('returns en dictionary with nav keys', async () => {
    const dict = await getDictionary('en');
    expect(dict.nav.services).toBe('Services');
  });
  it('returns vi dictionary with nav keys', async () => {
    const dict = await getDictionary('vi');
    expect(dict.nav.services).toBe('Dịch vụ');
  });
});
