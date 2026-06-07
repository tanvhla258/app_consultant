import 'server-only';
import { readMdx, listSlugs } from './mdx';
import type { PartnerFrontmatter } from './types';
import type { Locale } from '@/lib/i18n/config';

export async function getPartner(slug: string, locale: Locale) {
  return readMdx<PartnerFrontmatter>('partners', slug, locale);
}

export async function getAllPartners(locale: Locale) {
  const slugs = await listSlugs('partners');
  const entries = await Promise.all(
    slugs.map(slug => readMdx<PartnerFrontmatter>('partners', slug, locale)),
  );
  return entries
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}
