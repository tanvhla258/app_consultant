import { BarChart3 } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';

export async function Nav({ locale }: { locale: Locale }) {
  const d = await getDictionary(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-ink-50/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl text-ink-900">
          <BarChart3 size={16} aria-hidden />
          APP Consulting
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-600 md:flex">
          <Link href="/services" className="hover:text-ink-900">{d.nav.services}</Link>
          <Link href="/about" className="hover:text-ink-900">{d.nav.about}</Link>
          <Link href="/partners" className="hover:text-ink-900">{d.nav.partners}</Link>
          <Link href="/contact" className="hover:text-ink-900">{d.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher current={locale} />
          <Button href="/contact" className="hidden md:inline-flex">{d.nav.bookConsultation}</Button>
        </div>
      </Container>
    </header>
  );
}
