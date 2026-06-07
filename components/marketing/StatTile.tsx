import type { LucideIcon } from 'lucide-react';

export function StatTile({ value, label, icon: Icon }: {
  value: string;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
      {Icon && <Icon size={20} className="mb-3 text-brand-700" />}
      <div className="font-serif text-4xl text-ink-900">{value}</div>
      <div className="mt-2 text-sm text-ink-400">{label}</div>
    </div>
  );
}
