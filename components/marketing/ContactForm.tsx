'use client';
import { useActionState } from 'react';
import { submitContactForm, type ContactState } from '@/lib/actions/contact';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Dict = {
  name: string; company: string; email: string; phone: string; service: string;
  message: string; submit: string; success: string;
  errors: { name: string; email: string; message: string };
};

const initial: ContactState = { ok: false, errors: {} };

export function ContactForm({
  dict,
  serviceOptions,
  prefilledService,
}: {
  dict: Dict;
  serviceOptions: { value: string; label: string }[];
  prefilledService?: string;
}) {
  const [state, formAction, pending] = useActionState(submitContactForm, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8 text-ink-600">
        {dict.success}
      </div>
    );
  }

  const errors = 'errors' in state ? state.errors : {};
  const inputCls = (err?: string) => cn(
    'w-full rounded-xl border bg-ink-50 px-4 py-3 text-sm text-ink-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500',
    err ? 'border-red-500' : 'border-ink-200',
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.name}</span>
          <input name="name" required className={inputCls(errors.name)} />
          {errors.name ? <span className="text-xs text-red-600">{dict.errors.name}</span> : null}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.company}</span>
          <input name="company" className={inputCls()} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.email}</span>
          <input name="email" type="email" required className={inputCls(errors.email)} />
          {errors.email ? <span className="text-xs text-red-600">{dict.errors.email}</span> : null}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.phone}</span>
          <input name="phone" className={inputCls()} />
        </label>
      </div>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-ink-400">{dict.service}</span>
        <select name="service" defaultValue={prefilledService ?? ''} className={inputCls()}>
          <option value="">—</option>
          {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-ink-400">{dict.message}</span>
        <textarea name="message" required rows={6} className={inputCls(errors.message)} />
        {errors.message ? <span className="text-xs text-red-600">{dict.errors.message}</span> : null}
      </label>
      {'errors' in state && state.errors.form ? (
        <div className="text-sm text-red-600">{state.errors.form}</div>
      ) : null}
      <Button type="submit" className="w-full md:w-auto" disabled={pending}>
        {pending ? '…' : dict.submit}
      </Button>
    </form>
  );
}
