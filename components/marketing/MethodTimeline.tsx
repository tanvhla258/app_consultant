import { Search, Target, Zap, CheckCircle, Package, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

const STEP_ICONS: LucideIcon[] = [Search, Target, Zap, CheckCircle, Package, RefreshCw];

export function MethodTimeline({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="relative grid gap-8 md:grid-cols-3 lg:grid-cols-6">
      <div className="pointer-events-none absolute left-0 top-6 hidden h-px w-full bg-ink-200 lg:block" aria-hidden />
      {steps.map((step, i) => {
        const StepIcon = STEP_ICONS[i] ?? Search;
        return (
          <Reveal key={step.title} className="relative">
            <StepIcon size={20} className="mb-3 text-brand-700" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-900 bg-ink-50 font-mono text-sm">
              {String(i + 1).padStart(2, '0')}
            </div>
            <h4 className="mt-4 font-medium text-ink-900">{step.title}</h4>
            <p className="mt-1 text-sm text-ink-600">{step.body}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}
