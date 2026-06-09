import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Stagger } from '@/components/motion/Stagger';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trust: string[];
  imageSrc?: string;
};

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  trust,
  imageSrc = '/images/hero-placeholder.svg',
}: Props) {
  const words = title.split(' ');
  return (
    <section className="relative overflow-hidden bg-ink-900 pt-20 pb-24 md:pt-28 md:pb-32">
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover opacity-60"
        priority
        aria-hidden
      />
      <div className="absolute inset-0 bg-ink-900/50" aria-hidden />
      <Container className="relative z-10">
        <span className="text-xs uppercase tracking-[0.2em] text-brand-300">{eyebrow}</span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.1] text-ink-50 md:text-7xl">
          <Stagger>
            {words.map((w, i) => (
              <span key={i} className="mr-3 inline-block">{w}</span>
            ))}
          </Stagger>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-200">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href={secondaryCta.href} variant="secondary">{secondaryCta.label}</Button>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white">
          {trust.map(t => (
            <li key={t} className={cn('flex items-center gap-2')}>
              <span className="h-1 w-1 rounded-full bg-accent-500" />
              {t}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
