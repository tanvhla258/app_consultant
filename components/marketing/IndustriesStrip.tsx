export function IndustriesStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(item => (
        <span key={item} className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600">
          {item}
        </span>
      ))}
    </div>
  );
}
