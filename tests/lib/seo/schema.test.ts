import { describe, it, expect } from 'vitest';
import { organization, person, service } from '@/lib/seo/schema';

describe('schema builders', () => {
  it('organization has required fields', () => {
    const o = organization();
    expect(o['@type']).toBe('Organization');
    expect(o.name).toBe('APP Consulting');
    expect(o.address).toBeDefined();
  });
  it('person includes credentials and alumniOf', () => {
    const p = person({
      name: 'Christ Vo',
      jobTitle: 'Partner',
      email: 'cvo@app.com',
      telephone: '+84908142529',
      credentials: ['ACCA', 'VACPA'],
      alumniOf: ['KPMG Vietnam'],
    });
    expect(p.hasCredential).toEqual(['ACCA', 'VACPA']);
    expect(p.alumniOf).toEqual([{ '@type': 'Organization', name: 'KPMG Vietnam' }]);
  });
  it('service references provider and area', () => {
    const s = service({ name: 'Transfer Pricing', description: 'd', slug: 'transfer-pricing' });
    expect(s['@type']).toBe('Service');
    expect(s.areaServed).toBe('Vietnam');
    expect(s.provider['@type']).toBe('Organization');
  });
});
