'use client';
import { usePathname, useRouter } from 'next/navigation';
import { isLocale, type Locale } from './config';

export function useSwitchLocale() {
  const pathname = usePathname();
  const router = useRouter();
  return (next: Locale) => {
    const parts = pathname.split('/');
    if (isLocale(parts[1] ?? '')) parts[1] = next;
    else parts.splice(1, 0, next);
    const target = parts.join('/') || `/${next}`;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(target);
  };
}
