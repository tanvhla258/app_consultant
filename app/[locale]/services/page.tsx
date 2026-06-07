import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { FinalCta } from '@/components/marketing/FinalCta';
import { JsonLd } from '@/lib/seo/jsonld';
import { breadcrumbs } from '@/lib/seo/schema';
import { getAllServices } from '@/lib/content/services';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { locale: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/services',
    title: locale === 'vi' ? 'Dịch vụ' : 'Services',
    description: locale === 'vi'
      ? 'Kế toán, thuế, tư vấn tài chính, M&A, chuyển giá và đào tạo cho doanh nghiệp tại Việt Nam.'
      : 'Accounting, tax, financial advisory, M&A, transfer pricing, and training for businesses in Vietnam.',
  });
}

export default async function ServicesPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const services = await getAllServices(loc);

  return (
    <>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Dịch vụ' : 'Services', url: `${SITE}/${loc}/services` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Services'} size="xl">
            {loc === 'vi' ? 'Tư vấn toàn diện cho doanh nghiệp xuyên biên giới.' : 'Full-spectrum advisory for cross-border businesses.'}
          </Heading>
          <p className="mt-8 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Bảy lĩnh vực dịch vụ — mỗi lĩnh vực do một chuyên gia cấp cao phụ trách.'
              : 'Seven service categories — each led by a senior practitioner.'}
          </p>
        </Container>
      </section>

      <Container>
        <div className="grid gap-px bg-ink-200">
          {services.map((s, idx) => (
            <Reveal key={s.frontmatter.slug} className="bg-ink-50">
              <section id={s.frontmatter.slug} className="grid gap-10 py-16 md:grid-cols-[1fr_2fr] md:gap-16">
                <div>
                  <div className="font-mono text-sm text-ink-400">{String(idx + 1).padStart(2, '0')}</div>
                  <h2 className="mt-4 font-serif text-3xl text-ink-900">{s.frontmatter.title}</h2>
                  <p className="mt-4 text-ink-600">{s.frontmatter.summary}</p>
                  <Button href={`/services/${s.frontmatter.slug}`} variant="secondary" className="mt-6">
                    {d.common.readMore}
                  </Button>
                </div>
                <ul className="space-y-3 border-l border-ink-200 pl-8">
                  {s.frontmatter.bullets.map(b => (
                    <li key={b} className="text-ink-600">
                      <span className="text-accent-500">— </span>{b}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </Container>

      <FinalCta
        title={loc === 'vi' ? 'Bạn cần dịch vụ nào?' : 'Which service do you need?'}
        body={loc === 'vi' ? 'Cho chúng tôi biết, sẽ có chuyên gia phù hợp liên hệ.' : 'Tell us, and a partner will reach out directly.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
