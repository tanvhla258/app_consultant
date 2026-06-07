import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Hero } from '@/components/marketing/Hero';
import { ServiceGrid } from '@/components/marketing/ServiceGrid';
import { StatTile } from '@/components/marketing/StatTile';
import { MethodTimeline } from '@/components/marketing/MethodTimeline';
import { IndustriesStrip } from '@/components/marketing/IndustriesStrip';
import { FinalCta } from '@/components/marketing/FinalCta';
import { PartnerCard } from '@/components/marketing/PartnerCard';
import { getAllPartners } from '@/lib/content/partners';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/Reveal';
import enHome from '@/content/home/en.json';
import viHome from '@/content/home/vi.json';
import { Clock, Users, Award, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const home = locale === 'vi' ? viHome : enHome;
  return buildMetadata({
    locale,
    path: '/',
    title: 'APP Consulting — ' + home.hero.title,
    description: home.hero.subtitle,
  });
}

export default async function Home({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const home = loc === 'vi' ? viHome : enHome;
  const partners = await getAllPartners(loc);

  const STAT_ICONS: LucideIcon[] = [Clock, Users, Award, Building2];

  return (
    <>
      <Hero
        eyebrow={home.hero.eyebrow}
        title={home.hero.title}
        subtitle={home.hero.subtitle}
        primaryCta={{ label: home.hero.primaryCta, href: '/contact' }}
        secondaryCta={{ label: home.hero.secondaryCta, href: '/services' }}
        trust={home.hero.trust}
        imageSrc={home.hero.heroImage}
      />

      <ServiceGrid
        locale={loc}
        eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Services'}
        title={loc === 'vi' ? 'Tư vấn toàn diện cho doanh nghiệp xuyên biên giới.' : 'Full-spectrum advisory for cross-border businesses.'}
      />

      <section className="bg-ink-100 py-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Vì sao chọn APP' : 'Why APP'} size="lg">
              {loc === 'vi' ? 'Tiêu chuẩn Big4. Cách tiếp cận thực dụng.' : 'Big4 standards. Pragmatic delivery.'}
            </Heading>
            <p className="mt-6 text-ink-600">
              {loc === 'vi'
                ? 'Đội ngũ của chúng tôi từng dẫn dắt kiểm toán và tái cấu trúc cho các tập đoàn lớn tại KPMG và các công ty Big4 khác. Nay chúng tôi mang chuyên môn đó đến phục vụ trực tiếp doanh nghiệp của bạn.'
                : 'Our team led audits and restructuring for major corporations at KPMG and other Big4 firms. We bring that craft directly to your business — without the overhead.'}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {home.stats.map((s, i) => (
              <Reveal key={s.label}>
                <StatTile value={s.value} label={s.label} icon={STAT_ICONS[i]} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Phương pháp' : 'Our Method'} size="lg">
              {loc === 'vi' ? 'Sáu bước có kỷ luật.' : 'Six disciplined steps.'}
            </Heading>
          </Reveal>
          <div className="mt-16"><MethodTimeline steps={home.method} /></div>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Đối tác' : 'Partners'} size="lg">
              {loc === 'vi' ? 'Dẫn dắt bởi cựu đối tác Big4.' : 'Led by ex-Big4 partners.'}
            </Heading>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {partners.map(p => <PartnerCard key={p.frontmatter.slug} partner={p.frontmatter} />)}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Ngành' : 'Industries'} size="md">
              {loc === 'vi' ? 'Mười ba ngành. Một chuẩn mực.' : 'Thirteen industries. One standard.'}
            </Heading>
          </Reveal>
          <div className="mt-10"><IndustriesStrip items={home.industries} /></div>
        </Container>
      </section>

      <FinalCta title={home.finalCta.title} body={home.finalCta.body} ctaLabel={d.nav.bookConsultation} />
    </>
  );
}
