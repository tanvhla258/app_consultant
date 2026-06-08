'use client';
import { useSwitchLocale } from '@/lib/i18n/use-switch-locale';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n/config';

export function LocaleSwitcher({ current }: { current: Locale }) {
  const switchTo = useSwitchLocale();
  const linkCls = (active: boolean) =>
    cn(
      'cursor-pointer px-2 py-1 text-xs font-medium uppercase tracking-wider transition-colors',
      active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600',
    );
  return (
    <div className="flex items-center gap-1" aria-label="Language">
      <button className={linkCls(current === 'en')} onClick={() => switchTo('en')}>🇺🇸 EN</button>
      <span className="text-ink-200">/</span>
      <button className={linkCls(current === 'vi')} onClick={() => switchTo('vi')}>🇻🇳 VI</button>
    </div>
  );
}
