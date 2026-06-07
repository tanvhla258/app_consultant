import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n/config';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

function url(locale: Locale, path: string) {
  const clean = path === '/' ? '' : path;
  return `${SITE_URL}/${locale}${clean}`;
}

export function buildMetadata(args: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const { locale, path, title, description, image } = args;
  const canonical = url(locale, path);
  const languages = Object.fromEntries(locales.map(l => [l, url(l, path)])) as Record<Locale, string>;
  const ogImage = image ?? `${SITE_URL}/opengraph-image`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: 'APP Consulting',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}
