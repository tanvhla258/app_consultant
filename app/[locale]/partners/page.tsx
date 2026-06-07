import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { FinalCta } from '@/components/marketing/FinalCta';
import { JsonLd } from '@/lib/seo/jsonld';
import { person, breadcrumbs } from '@/lib/seo/schema';
import { renderMdx } from '@/lib/content/mdx';
import { getAllPartners } from '@/lib/content/partners';
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
    path: '/partners',
    title: locale === 'vi' ? 'Đối tác' : 'Partners',
    description: locale === 'vi'
      ? 'Đội ngũ sáng lập APP Consulting — cựu chuyên gia Big4 với hơn 20 năm kinh nghiệm.'
      : 'APP Consulting partners — ex-Big4 leaders with 20+ years of experience.',
  });
}

export default async function PartnersPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const partners = await getAllPartners(loc);

  return (
    <>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Đối tác' : 'Partners', url: `${SITE}/${loc}/partners` },
      ])}/>
      {partners.map(p => (
        <JsonLd
          key={p.frontmatter.slug}
          data={person({
            name: p.frontmatter.name,
            jobTitle: p.frontmatter.role,
            email: p.frontmatter.email,
            telephone: p.frontmatter.phone,
            credentials: p.frontmatter.credentials,
            alumniOf: p.frontmatter.alumniOf,
          })}
        />
      ))}

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Đối tác' : 'Partners'} size="xl">
            {loc === 'vi' ? 'Dẫn dắt bởi cựu đối tác Big4.' : 'Led by ex-Big4 partners.'}
          </Heading>
          <p className="mt-6 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Mỗi đối tác có hơn 17 năm kinh nghiệm tại các công ty kiểm toán quốc tế và tập đoàn lớn.'
              : 'Each partner brings 17+ years from international audit firms and large corporations.'}
          </p>
        </Container>
      </section>

      <Container className="space-y-24 pb-24">
        {await Promise.all(partners.map(async (p, idx) => {
          const body = await renderMdx(p.raw);
          const reverse = idx % 2 === 1;
          return (
            <Reveal key={p.frontmatter.slug}>
              <article id={p.frontmatter.slug} className={`grid items-start gap-12 md:grid-cols-[2fr_3fr] ${reverse ? 'md:[&>div:first-child]:order-2' : ''}`}>
                <div>
                  <div className="aspect-[4/5] rounded-2xl bg-ink-100" aria-hidden/>
                </div>
                <div>
                  <h2 className="font-serif text-3xl text-ink-900">{p.frontmatter.name}</h2>
                  <div className="mt-1 text-sm text-ink-400">{p.frontmatter.role}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.frontmatter.credentials.map(c => (
                      <span key={c} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{c}</span>
                    ))}
                  </div>
                  <div className="prose prose-ink mt-6 text-ink-600">{body}</div>
                  <div className="mt-6">
                    <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Đã làm việc với' : 'Notable engagements'}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.frontmatter.notableEngagements.map(e => (
                        <span key={e} className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={`mailto:${p.frontmatter.email}`} variant="secondary">{p.frontmatter.email}</Button>
                    <Button href={`tel:${p.frontmatter.phone.replace(/\s/g, '')}`} variant="ghost">{p.frontmatter.phone}</Button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        }))}
      </Container>

      <FinalCta
        title={loc === 'vi' ? 'Trao đổi trực tiếp với một đối tác.' : 'Talk to a partner directly.'}
        body={loc === 'vi' ? 'Phản hồi trong một ngày làm việc.' : 'A reply within one business day.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
