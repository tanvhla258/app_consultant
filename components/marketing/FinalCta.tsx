import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function FinalCta({ title, body, ctaLabel }: { title: string; body: string; ctaLabel: string }) {
  return (
    <section className="bg-ink-900 py-24 text-ink-50">
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
          <p className="mt-2 max-w-xl text-ink-200">{body}</p>
        </div>
        <Button href="/contact" variant="primary">
          {ctaLabel}
          <ArrowRight size={16} aria-hidden />
        </Button>
      </Container>
    </section>
  );
}
