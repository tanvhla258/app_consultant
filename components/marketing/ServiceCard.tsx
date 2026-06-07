import type { LucideIcon } from 'lucide-react';
import { Link } from '@/lib/i18n/link';
import { cn } from '@/lib/cn';

export function ServiceCard({
  number, title, summary, href, icon: Icon,
}: {
  number: number;
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className={cn(
      'group flex flex-col justify-between rounded-2xl border border-ink-200 bg-ink-50 p-8 transition-all duration-200',
      'hover:border-ink-900 hover:shadow-md',
    )}>
      <div>
        <Icon size={24} className="text-brand-700" />
        <div className="mt-3 text-xs font-mono text-ink-400">{String(number).padStart(2, '0')}</div>
        <h3 className="mt-4 font-serif text-2xl text-ink-900">{title}</h3>
        <p className="mt-3 text-sm text-ink-600">{summary}</p>
      </div>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-900">
        <span className="border-b border-ink-900 transition-all group-hover:pr-2">→</span>
      </span>
    </Link>
  );
}
