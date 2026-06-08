import { cn } from '@/lib/cn';
import { Link } from '@/lib/i18n/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-brand-900 hover:bg-brand-700 hover:text-ink-50 shadow-sm hover:shadow-md',
  secondary: 'bg-ink-900 text-ink-50 hover:bg-brand-900 shadow-sm hover:shadow-md',
  ghost: 'bg-transparent text-ink-900 hover:bg-brand-100',
};

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };
type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', className, children } = props;
  const cls = cn(base, variants[variant], className);
  if ('href' in props && props.href) {
    return <Link href={props.href} className={cls}>{children}</Link>;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { href: _, variant: __, className: ___, children: ____, ...buttonProps } = props as AsButton;
  return <button className={cls} {...buttonProps}>{children}</button>;
}
