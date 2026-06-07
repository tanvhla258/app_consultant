'use client';
import NextLink, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { isLocale, type Locale, defaultLocale } from './config';

function currentLocale(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : defaultLocale;
}

type Props = Omit<LinkProps, 'href'> & { href: string; children: ReactNode; className?: string };

export function Link({ href, children, ...rest }: Props) {
  const pathname = usePathname();
  const locale = currentLocale(pathname);
  const localized = href.startsWith('/') ? `/${locale}${href === '/' ? '' : href}` : href;
  return <NextLink href={localized} {...rest}>{children}</NextLink>;
}
