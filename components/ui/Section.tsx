import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

export function Section({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-20 md:py-28', className)} {...rest} />;
}
