import 'server-only';
import { readMdx, listSlugs } from './mdx';
import type { ServiceFrontmatter } from './types';
import type { Locale } from '@/lib/i18n/config';

export async function getService(slug: string, locale: Locale) {
  return readMdx<ServiceFrontmatter>('services', slug, locale);
}

export async function getAllServices(locale: Locale) {
  const slugs = await listSlugs('services');
  const entries = await Promise.all(
    slugs.map(async slug => {
      const doc = await readMdx<ServiceFrontmatter>('services', slug, locale);
      return doc;
    }),
  );
  return entries
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}
