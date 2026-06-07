import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { ContactForm } from '@/components/marketing/ContactForm';
import { JsonLd } from '@/lib/seo/jsonld';
import { localBusiness, breadcrumbs } from '@/lib/seo/schema';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getAllServices } from '@/lib/content/services';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { locale: string };
type SearchParams = { service?: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/contact',
    title: locale === 'vi' ? 'Liên hệ' : 'Contact',
    description: locale === 'vi'
      ? 'Đặt lịch tư vấn miễn phí với APP Consulting tại TP. Hồ Chí Minh.'
      : 'Schedule a free consultation with APP Consulting in Ho Chi Minh City.',
  });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const { service } = await searchParams;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const services = await getAllServices(loc);
  const serviceOptions = services.map(s => ({ value: s.frontmatter.slug, label: s.frontmatter.title }));

  return (
    <>
      <JsonLd data={localBusiness()} />
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Liên hệ' : 'Contact', url: `${SITE}/${loc}/contact` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Liên hệ' : 'Contact'} size="xl">
            {loc === 'vi' ? 'Hãy bắt đầu cuộc trò chuyện.' : "Let's start the conversation."}
          </Heading>
          <p className="mt-6 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Chia sẻ ngắn gọn nhu cầu của bạn — một đối tác sẽ phản hồi trong vòng một ngày làm việc.'
              : 'Share a brief on your needs — a partner will respond within one business day.'}
          </p>
        </Container>
      </section>

      <section className="pb-24">
        <Container className="grid gap-12 md:grid-cols-[3fr_2fr]">
          <ContactForm dict={d.form} serviceOptions={serviceOptions} prefilledService={service} />
          <aside className="space-y-6 rounded-2xl border border-ink-200 bg-ink-50 p-8 text-sm text-ink-600">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Văn phòng' : 'Office'}</div>
              <p className="mt-2 text-ink-900">14th Floor, HM Town Building</p>
              <p>412 Nguyen Thi Minh Khai</p>
              <p>Ward 5, District 3, HCMC</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Liên hệ' : 'Direct'}</div>
              <p className="mt-2"><a href="tel:+84909121045" className="text-ink-900 hover:underline">+84 909 121 045</a></p>
              <p><a href="mailto:toandhnh@gmail.com" className="text-ink-900 hover:underline">toandhnh@gmail.com</a></p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Giờ làm việc' : 'Hours'}</div>
              <p className="mt-2">Mon–Fri · 09:00–18:00 ICT</p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
