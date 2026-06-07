import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { submitContactForm, type ContactState } from '@/lib/actions/contact';

const initialState: ContactState = { ok: false, errors: {} };

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'em_1' }, error: null });
  process.env.RESEND_API_KEY = 'test_key';
  process.env.CONTACT_TO_EMAIL = 'to@example.com';
  process.env.CONTACT_FROM_EMAIL = 'from@example.com';
});

function makeForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('name', 'Alex Tester');
  fd.set('email', 'alex@example.com');
  fd.set('message', 'Hello — need help with IFRS conversion.');
  fd.set('company', '');
  fd.set('phone', '');
  fd.set('service', '');
  fd.set('honeypot', '');
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe('submitContactForm', () => {
  it('returns ok when valid', async () => {
    const result = await submitContactForm(initialState, makeForm());
    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
  });
  it('returns field errors when invalid', async () => {
    const result = await submitContactForm(initialState, makeForm({ email: 'not-an-email', message: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.message).toBeDefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });
  it('rejects honeypot submissions silently', async () => {
    const result = await submitContactForm(initialState, makeForm({ honeypot: 'spam-bot' }));
    expect(result.ok).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
