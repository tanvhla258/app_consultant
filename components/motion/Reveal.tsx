import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';
export function Reveal({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('reveal', className)} {...rest} />;
}
