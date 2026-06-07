import { cn } from '@/lib/cn';
import type { HTMLAttributes, ElementType } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: ElementType;
  eyebrow?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizes = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
};

export function Heading({ as: Tag = 'h2', eyebrow, size = 'md', className, children, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? <span className="text-xs uppercase tracking-[0.18em] text-brand-700">{eyebrow}</span> : null}
      <Tag className={cn('font-serif font-medium leading-tight text-ink-900', sizes[size], className)} {...rest}>
        {children}
      </Tag>
    </div>
  );
}
