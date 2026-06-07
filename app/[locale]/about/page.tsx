import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { MethodTimeline } from '@/components/marketing/MethodTimeline';
import { FinalCta } from '@/components/marketing/FinalCta';
import { Reveal } from '@/components/motion/Reveal';
import { buildMetadata } from '@/lib/seo/metadata';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale, type Locale } from '@/lib/i18n/config';
import enHome from '@/content/home/en.json';
import viHome from '@/content/home/vi.json';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/about',
    title: locale === 'vi' ? 'Về chúng tôi' : 'About',
    description: locale === 'vi'
      ? 'APP Consulting — đội ngũ chuyên gia tài chính, thuế và kiểm toán từng làm tại Big4.'
      : 'APP Consulting — a team of finance, tax, and audit specialists from Big4 backgrounds.',
  });
}

const copy = {
  en: {
    eyebrow: 'About APP',
    title: 'A consulting firm built by practitioners.',
    intro: 'APP Consulting was founded by leading experts in accounting, finance, auditing, tax, and advisory — each with deep experience at international auditing firms and large multinational corporations.',
    body: 'We understand the culture, thinking, and working environments of multinationals operating in Vietnam as well as domestic enterprises. That perspective lets us deliver flexible, fit-for-purpose solutions — for multinational groups, mid-market companies, and non-profit organizations alike.',
    visionHeading: 'Vision',
    vision: 'Become a leading accounting and consulting service provider.',
    missionHeading: 'Mission',
    mission: 'Create and maintain a strong brand image, deliver consulting services of the highest quality, and bring the greatest efficiency to our clients — through a professional, dedicated team built to serve.',
    valuesHeading: 'Core values',
    values: [
      { title: 'Responsibility & commitment', body: 'We accept ownership of outcomes from kickoff through monitoring.' },
      { title: 'Professional & dedicated', body: 'Big4-trained practitioners on every engagement.' },
      { title: 'Quality solutions', body: 'Effective, evidence-based, and ready to defend.' },
    ],
    methodEyebrow: 'Method',
    methodTitle: 'How we work.',
  },
  vi: {
    eyebrow: 'Về APP',
    title: 'Công ty tư vấn do chính người làm nghề xây dựng.',
    intro: 'APP Consulting được thành lập bởi các chuyên gia hàng đầu trong lĩnh vực kế toán, tài chính, kiểm toán, thuế và tư vấn — đều giàu kinh nghiệm tại các công ty kiểm toán quốc tế và các tập đoàn đa quốc gia lớn.',
    body: 'Chúng tôi hiểu rõ văn hóa, tư duy và môi trường làm việc của các tập đoàn đa quốc gia tại Việt Nam cũng như doanh nghiệp trong nước. Điều đó giúp chúng tôi cung cấp giải pháp linh hoạt, phù hợp — cho tập đoàn lớn, doanh nghiệp tầm trung và cả tổ chức phi lợi nhuận.',
    visionHeading: 'Tầm nhìn',
    vision: 'Trở thành đơn vị tư vấn và kế toán hàng đầu.',
    missionHeading: 'Sứ mệnh',
    mission: 'Xây dựng và giữ vững hình ảnh tốt, cung cấp dịch vụ tư vấn chất lượng cao nhất, mang lại hiệu quả tối ưu cho khách hàng — với đội ngũ chuyên nghiệp, tận tâm.',
    valuesHeading: 'Giá trị cốt lõi',
    values: [
      { title: 'Trách nhiệm & cam kết', body: 'Chúng tôi đồng hành cùng kết quả từ khởi tạo đến giám sát.' },
      { title: 'Chuyên nghiệp & tận tâm', body: 'Chuyên gia được đào tạo Big4 trong mỗi dự án.' },
      { title: 'Giải pháp chất lượng', body: 'Hiệu quả, có bằng chứng và sẵn sàng bảo vệ.' },
    ],
    methodEyebrow: 'Phương pháp',
    methodTitle: 'Cách chúng tôi làm việc.',
  },
};

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const c = copy[loc];
  const home = loc === 'vi' ? viHome : enHome;

  return (
    <>
      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={c.eyebrow} size="xl">{c.title}</Heading>
          <p className="mt-8 text-lg text-ink-600">{c.intro}</p>
          <p className="mt-4 text-ink-600">{c.body}</p>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-700">{c.visionHeading}</div>
              <p className="mt-4 font-serif text-2xl text-ink-900">{c.vision}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-700">{c.missionHeading}</div>
              <p className="mt-4 text-ink-900">{c.mission}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal><Heading eyebrow={c.valuesHeading} size="lg">{loc === 'vi' ? 'Ba giá trị định hướng mọi hành động.' : 'Three values that guide every action.'}</Heading></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {c.values.map(v => (
              <Reveal key={v.title}>
                <div className="rounded-2xl border border-ink-200 p-8">
                  <h3 className="font-serif text-xl text-ink-900">{v.title}</h3>
                  <p className="mt-3 text-sm text-ink-600">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container>
          <Reveal><Heading eyebrow={c.methodEyebrow} size="lg">{c.methodTitle}</Heading></Reveal>
          <div className="mt-16"><MethodTimeline steps={home.method} /></div>
        </Container>
      </section>

      <FinalCta
        title={loc === 'vi' ? 'Sẵn sàng làm việc cùng chúng tôi?' : 'Ready to work with us?'}
        body={loc === 'vi' ? 'Một cuộc trao đổi ngắn cũng đủ để bắt đầu.' : 'A short conversation is enough to begin.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
