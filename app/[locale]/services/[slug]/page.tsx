import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { ServiceStats } from '@/components/marketing/ServiceStats';
import { JsonLd } from '@/lib/seo/jsonld';
import { service as serviceSchema, breadcrumbs } from '@/lib/seo/schema';
import { getService, getAllServices } from '@/lib/content/services';
import { renderMdx, listSlugs } from '@/lib/content/mdx';
import { buildMetadata } from '@/lib/seo/metadata';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';

type Params = { locale: string; slug: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateStaticParams() {
  const slugs = await listSlugs('services');
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const doc = await getService(slug, locale);
  if (!doc) return {};
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: doc.frontmatter.title,
    description: doc.frontmatter.summary,
  });
}

export default async function ServiceDetail({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const doc = await getService(slug, loc);
  if (!doc) notFound();
  const d = await getDictionary(loc);
  const all = await getAllServices(loc);
  const related = all.filter(s => s.frontmatter.slug !== slug).slice(0, 2);
  const body = await renderMdx(doc.raw);

  return (
    <>
      <JsonLd data={serviceSchema({
        name: doc.frontmatter.title,
        description: doc.frontmatter.summary,
        slug,
      })}/>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Dịch vụ' : 'Services', url: `${SITE}/${loc}/services` },
        { name: doc.frontmatter.title, url: `${SITE}/${loc}/services/${slug}` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Service'} size="xl">{doc.frontmatter.title}</Heading>
          <p className="mt-6 text-lg text-ink-600">{doc.frontmatter.summary}</p>
          <Button href={`/contact?service=${slug}`} className="mt-10">{d.common.discuss}</Button>
        </Container>
      </section>

      <div className="relative h-64 w-full overflow-hidden md:h-96">
        <Image
          src={doc.frontmatter.image ?? '/images/service-banner-placeholder.svg'}
          alt={doc.frontmatter.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {doc.frontmatter.stats ? <ServiceStats stats={doc.frontmatter.stats} /> : null}

      <Container className="prose prose-ink max-w-3xl py-12 text-ink-600">
        {body}
      </Container>

      {doc.frontmatter.delivers ? (
        <section className="bg-ink-900 py-20">
          <Container className="max-w-3xl">
            <Heading size="md" className="text-ink-50">
              {loc === 'vi' ? 'Sản phẩm bàn giao' : 'What we deliver'}
            </Heading>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {doc.frontmatter.delivers.map(item => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-brand-500/30 bg-white/10 p-4 text-ink-50">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {doc.frontmatter.whoFor ? (
        <section className="bg-brand-50 py-20">
          <Container className="max-w-3xl">
            <Heading size="md">{loc === 'vi' ? 'Phù hợp với' : "Who it's for"}</Heading>
            <div className="mt-6 flex flex-wrap gap-3">
              {doc.frontmatter.whoFor.map(item => (
                <span key={item} className="flex items-center gap-3 rounded-xl border border-brand-200 bg-white px-5 py-3">
                  <span className="h-5 w-1 shrink-0 rounded-full bg-brand-500" />
                  <span className="text-sm text-ink-600">{item}</span>
                </span>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-brand-500 py-16">
        <Container className="max-w-3xl text-center">
          <p className="font-serif text-3xl text-ink-900 md:text-4xl">
            {loc === 'vi' ? 'Sẵn sàng nói chuyện về nhu cầu của bạn?' : 'Ready to talk about your needs?'}
          </p>
          <Button href={`/contact?service=${slug}`} variant="secondary" className="mt-8">
            {d.common.discuss}
          </Button>
        </Container>
      </section>

      <section className="bg-ink-100 py-20">
        <Container>
          <Heading eyebrow={loc === 'vi' ? 'Liên quan' : 'Related'} size="md">
            {loc === 'vi' ? 'Dịch vụ khác có thể hữu ích.' : 'Other services that may help.'}
          </Heading>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {related.map(r => (
              <Reveal key={r.frontmatter.slug}>
                <a href={`/${loc}/services/${r.frontmatter.slug}`} className="block rounded-2xl border border-ink-200 bg-ink-50 p-6 hover:border-ink-900">
                  <div className="font-serif text-xl text-ink-900">{r.frontmatter.title}</div>
                  <p className="mt-2 text-sm text-ink-600">{r.frontmatter.summary}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
