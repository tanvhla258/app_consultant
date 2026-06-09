import { Container } from '@/components/ui/Container';

type Stat = { value: string; label: string };

export function ServiceStats({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <div className="bg-ink-900 py-12">
      <Container>
        <div className="flex overflow-x-auto justify-center divide-x divide-ink-700">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-8 py-4 text-center">
              <span className="font-serif text-4xl text-brand-500">{s.value}</span>
              <span className="text-xs uppercase tracking-widest text-ink-200">{s.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
