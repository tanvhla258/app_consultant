import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { ServiceCard } from './ServiceCard';
import { getAllServices } from '@/lib/content/services';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/lib/i18n/config';

export async function ServiceGrid({ locale, eyebrow, title }: { locale: Locale; eyebrow: string; title: string }) {
  const services = await getAllServices(locale);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal><Heading eyebrow={eyebrow} size="lg">{title}</Heading></Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.frontmatter.slug}>
              <ServiceCard
                number={i + 1}
                title={s.frontmatter.title}
                summary={s.frontmatter.summary}
                href={`/services/${s.frontmatter.slug}`}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
