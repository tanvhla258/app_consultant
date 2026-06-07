import type { PartnerFrontmatter } from '@/lib/content/types';
import { Link } from '@/lib/i18n/link';

export function PartnerCard({ partner }: { partner: PartnerFrontmatter }) {
  return (
    <Link href={`/partners#${partner.slug}`} className="block rounded-2xl border border-ink-200 bg-ink-50 p-6 transition-all hover:border-ink-900">
      <div className="aspect-[4/5] rounded-xl bg-ink-100" aria-hidden/>
      <div className="mt-4 font-serif text-xl text-ink-900">{partner.name}</div>
      <div className="text-sm text-ink-400">{partner.role}</div>
      <div className="mt-3 flex flex-wrap gap-1 text-xs">
        {partner.credentials.map(c => (
          <span key={c} className="rounded-full bg-ink-100 px-2 py-1 text-ink-600">{c}</span>
        ))}
      </div>
    </Link>
  );
}
