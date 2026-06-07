export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
      <div className="font-serif text-4xl text-ink-900">{value}</div>
      <div className="mt-2 text-sm text-ink-400">{label}</div>
    </div>
  );
}
