import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { Locale } from '@/lib/i18n/config';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export async function readMdx<T extends Record<string, unknown>>(
  subdir: string,
  slug: string,
  locale: Locale,
): Promise<{ frontmatter: T; raw: string } | null> {
  const tryRead = async (loc: Locale) => {
    const filePath = path.join(CONTENT_ROOT, subdir, `${slug}.${loc}.mdx`);
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  };
  const source = (await tryRead(locale)) ?? (await tryRead('en'));
  if (!source) return null;
  const { data, content } = matter(source);
  return { frontmatter: data as T, raw: content };
}

export async function renderMdx(raw: string) {
  const { content } = await compileMDX({
    source: raw,
    options: { parseFrontmatter: false },
  });
  return content;
}

export async function listSlugs(subdir: string): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, subdir);
  const entries = await fs.readdir(dir);
  const slugs = new Set<string>();
  for (const f of entries) {
    const m = f.match(/^(.+)\.(en|vi)\.mdx$/);
    if (m) slugs.add(m[1]);
  }
  return [...slugs];
}
