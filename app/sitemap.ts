import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';
import { listSlugs } from '@/lib/content/mdx';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/about', '/services', '/partners', '/contact'];
  const serviceSlugs = await listSlugs('services');
  const allPaths = [
    ...staticPaths,
    ...serviceSlugs.map(s => `/services/${s}`),
  ];
  return allPaths.flatMap(path =>
    locales.map(locale => ({
      url: `${SITE}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map(l => [l, `${SITE}/${l}${path}`])),
      },
    })),
  );
}
