import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config';

function pickLocale(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && isLocale(cookie)) return cookie;
  const header = req.headers.get('accept-language') ?? '';
  const preferred = header.split(',').map(p => p.split(';')[0].trim().toLowerCase());
  for (const p of preferred) {
    const match = locales.find(l => p.startsWith(l));
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = locales.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
