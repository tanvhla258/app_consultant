import { Building2 } from 'lucide-react';

export function IndustriesStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(item => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600"
        >
          <Building2 size={12} className="text-ink-400" />
          {item}
        </span>
      ))}
    </div>
  );
}
