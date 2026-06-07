import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import type { Locale } from '@/lib/i18n/config';

export async function Footer({ locale }: { locale: Locale }) {
  const d = await getDictionary(locale);
  return (
    <footer className="border-t border-ink-200 bg-ink-50 py-16 text-sm text-ink-600">
      <Container className="grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl text-ink-900">APP Consulting</div>
          <p className="mt-3 text-ink-400">{d.footer.tagline}</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.servicesHeading}</div>
          <ul className="space-y-2">
            <li><Link href="/services">{d.nav.services}</Link></li>
            <li><Link href="/about">{d.nav.about}</Link></li>
            <li><Link href="/partners">{d.nav.partners}</Link></li>
            <li><Link href="/contact">{d.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.officeHeading}</div>
          <p>14th Floor, HM Town Building<br/>412 Nguyen Thi Minh Khai<br/>Ward 5, District 3, HCMC</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.contactHeading}</div>
          <p><a href="tel:+84909121045">+84 909 121 045</a><br/>
          <a href="mailto:toandhnh@gmail.com">toandhnh@gmail.com</a></p>
          <p className="mt-4 text-xs text-ink-400">ACCA · VACPA</p>
        </div>
      </Container>
      <Container className="mt-10 flex items-center justify-between text-xs text-ink-400">
        <span>© {new Date().getFullYear()} APP Consulting. {d.footer.rights}</span>
      </Container>
    </footer>
  );
}
