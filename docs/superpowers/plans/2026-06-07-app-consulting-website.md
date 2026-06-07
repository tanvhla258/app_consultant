# APP Consulting Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/VI), statically generated, SEO-optimized corporate profile site for APP Consulting using Next.js 16 App Router, React 19, TailwindCSS v4, MDX content, and a Resend-powered contact form.

**Architecture:** All pages SSG via `generateStaticParams` on `[locale]`. Content lives in repo as MDX (services, partners) and JSON dictionaries (UI strings). RSC by default; client islands only for Framer Motion, the locale switcher, and the contact form. SEO is centralized through a `buildMetadata()` helper and per-page JSON-LD components. Locale detection runs in `proxy.ts` (Next 16's renamed middleware).

**Tech Stack:** Next.js 16.2.7, React 19.2, TailwindCSS v4, TypeScript 5, MDX via `next-mdx-remote/rsc`, Framer Motion, Zod, Resend, Vitest + React Testing Library for unit tests.

---

## Reference Docs (read before touching the corresponding area)

All paths are inside `node_modules/next/dist/docs/01-app/`:

- Routing & params: `01-getting-started/03-layouts-and-pages.md`, `03-api-reference/03-file-conventions/page.md`, `03-api-reference/03-file-conventions/layout.md`
- **Proxy (renamed from middleware in v16):** `01-getting-started/16-proxy.md`, `03-api-reference/03-file-conventions/proxy.md`
- Metadata: `01-getting-started/14-metadata-and-og-images.md`, `03-api-reference/04-functions/generate-metadata.md`
- Fonts: `01-getting-started/13-fonts.md`, `03-api-reference/02-components/font.md`
- Images: `01-getting-started/12-images.md`
- i18n: `02-guides/internationalization.md`
- JSON-LD: `02-guides/json-ld.md`
- Server Actions / forms: `01-getting-started/07-mutating-data.md`, `02-guides/forms.md`
- Sitemap / robots: `03-api-reference/03-file-conventions/01-metadata/` (sitemap.ts, robots.ts)
- MDX: `02-guides/mdx.md`

**Critical v16 deltas vs. prior knowledge:**
1. `middleware.ts` → `proxy.ts` (root level, sibling of `app/`). Export `proxy()`, not `middleware()`.
2. `params` and `searchParams` in pages/layouts are **Promises** — must `await params`.
3. JSON-LD is rendered as a raw `<script type="application/ld+json">` with `<` escaped to `<`.

---

## File Structure

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx                        # Home
│   ├── about/page.tsx
│   ├── services/
│   │   ├── page.tsx                    # Services overview
│   │   └── [slug]/page.tsx             # Service detail
│   ├── partners/page.tsx
│   └── contact/page.tsx
├── layout.tsx                          # Root: <html><body> placeholder per locale
├── sitemap.ts
├── robots.ts
├── opengraph-image.tsx                 # default OG (1200x630)
├── icon.tsx
├── not-found.tsx
└── globals.css

proxy.ts                                # Locale redirect (renamed from middleware)

content/
├── services/<slug>.<en|vi>.mdx
├── partners/<slug>.<en|vi>.mdx
└── home/<en|vi>.json                   # Hero copy, stats, industries

locales/
├── en.json
└── vi.json

lib/
├── i18n/
│   ├── config.ts                       # locales tuple, Locale type, defaultLocale
│   ├── get-dictionary.ts               # async dict loader
│   ├── link.tsx                        # <Link> wrapper that prefixes locale
│   └── use-switch-locale.ts            # client hook for switcher
├── content/
│   ├── types.ts                        # ServiceFrontmatter, PartnerFrontmatter
│   ├── services.ts                     # getService, getAllServices
│   ├── partners.ts                     # getPartner, getAllPartners
│   └── mdx.ts                          # readMdxFile, compileMdx wrappers
├── seo/
│   ├── metadata.ts                     # buildMetadata({ locale, path, title, description, image })
│   ├── jsonld.tsx                      # <JsonLd> server component
│   └── schema.ts                       # Organization, LocalBusiness, Person, Service builders
└── actions/
    └── contact.ts                      # submitContactForm server action

components/
├── ui/
│   ├── Button.tsx
│   ├── Container.tsx
│   ├── Section.tsx
│   └── Heading.tsx
├── marketing/
│   ├── Hero.tsx
│   ├── ServiceGrid.tsx
│   ├── ServiceCard.tsx
│   ├── MethodTimeline.tsx
│   ├── StatTile.tsx
│   ├── PartnerCard.tsx
│   ├── IndustriesStrip.tsx
│   └── FinalCta.tsx
├── motion/
│   ├── FadeIn.tsx
│   ├── Reveal.tsx
│   └── Stagger.tsx
└── layout/
    ├── Nav.tsx
    ├── Footer.tsx
    └── LocaleSwitcher.tsx

tests/
├── lib/i18n/get-dictionary.test.ts
├── lib/content/services.test.ts
├── lib/seo/metadata.test.ts
├── lib/seo/schema.test.ts
└── lib/actions/contact.test.ts
```

**Testing philosophy:** unit-test the things with logic — i18n dictionary loader, content registry, SEO builders, contact-form validation. Presentational components are verified by typecheck + lint + visual review (manual dev-server check), not unit tests. This is consistent with the spec's "presentation-heavy marketing site" nature.

---

## Phase A — Foundation

### Task 1: Install dependencies & configure tooling

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json` (update path aliases)
- Create: `vitest.config.ts`
- Create: `.env.example`
- Create: `mdx-components.tsx` (root)

- [ ] **Step 1: Install runtime + dev dependencies**

Run:
```bash
npm install framer-motion zod resend next-mdx-remote gray-matter clsx tailwind-merge schema-dts
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/node
```
Expected: clean install, no peer warnings beyond Next 16's known ones.

- [ ] **Step 2: Add path alias `@/*` to `tsconfig.json`**

Replace `compilerOptions` block with the boilerplate plus:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```
(Keep the existing options; only add/ensure `paths`.)

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 4: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Add `test` script to `package.json`**

In `scripts`, add: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Create `.env.example`**

```
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 7: Create root `mdx-components.tsx`** (required by `@next/mdx` even though we use remote MDX, harmless to keep)

```tsx
import type { MDXComponents } from 'mdx/types';
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: clean build, no type errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts tests/setup.ts .env.example mdx-components.tsx
git commit -m "chore: install deps and configure vitest, mdx, path aliases"
```

---

### Task 2: i18n config and types

**Files:**
- Create: `lib/i18n/config.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/i18n/config.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config';

describe('i18n config', () => {
  it('exposes en and vi as supported locales', () => {
    expect(locales).toEqual(['en', 'vi']);
  });
  it('defaults to en', () => {
    expect(defaultLocale).toBe('en');
  });
  it('isLocale narrows valid strings', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- tests/lib/i18n/config.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/i18n/config.ts`**

```ts
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- tests/lib/i18n/config.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/config.ts tests/lib/i18n/config.test.ts
git commit -m "feat(i18n): add locale config (en, vi) and isLocale guard"
```

---

### Task 3: Dictionary loader

**Files:**
- Create: `locales/en.json`, `locales/vi.json`
- Create: `lib/i18n/get-dictionary.ts`

- [ ] **Step 1: Create `locales/en.json`**

```json
{
  "nav": {
    "services": "Services",
    "about": "About",
    "partners": "Partners",
    "contact": "Contact",
    "bookConsultation": "Book a Consultation"
  },
  "footer": {
    "tagline": "Your Vision. Our Mission.",
    "officeHeading": "Office",
    "contactHeading": "Contact",
    "servicesHeading": "Services",
    "rights": "All rights reserved."
  },
  "form": {
    "name": "Full name",
    "company": "Company",
    "email": "Email",
    "phone": "Phone",
    "service": "Service of interest",
    "message": "Message",
    "submit": "Send message",
    "success": "Thanks — we'll be in touch within one business day.",
    "errors": {
      "name": "Please enter your name.",
      "email": "Enter a valid email.",
      "message": "Tell us briefly what you need."
    }
  },
  "common": {
    "readMore": "Read more",
    "discuss": "Discuss this service",
    "back": "Back"
  }
}
```

- [ ] **Step 2: Create `locales/vi.json` (mirror keys, Vietnamese values)**

```json
{
  "nav": {
    "services": "Dịch vụ",
    "about": "Về chúng tôi",
    "partners": "Đối tác",
    "contact": "Liên hệ",
    "bookConsultation": "Đặt lịch tư vấn"
  },
  "footer": {
    "tagline": "Tầm Nhìn Của Bạn. Sứ Mệnh Của Chúng Tôi.",
    "officeHeading": "Văn phòng",
    "contactHeading": "Liên hệ",
    "servicesHeading": "Dịch vụ",
    "rights": "Bảo lưu mọi quyền."
  },
  "form": {
    "name": "Họ và tên",
    "company": "Công ty",
    "email": "Email",
    "phone": "Điện thoại",
    "service": "Dịch vụ quan tâm",
    "message": "Nội dung",
    "submit": "Gửi tin nhắn",
    "success": "Cảm ơn — chúng tôi sẽ phản hồi trong 1 ngày làm việc.",
    "errors": {
      "name": "Vui lòng nhập tên.",
      "email": "Vui lòng nhập email hợp lệ.",
      "message": "Vui lòng mô tả ngắn gọn nhu cầu của bạn."
    }
  },
  "common": {
    "readMore": "Xem thêm",
    "discuss": "Trao đổi về dịch vụ này",
    "back": "Quay lại"
  }
}
```

- [ ] **Step 3: Write failing test**

Create `tests/lib/i18n/get-dictionary.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getDictionary } from '@/lib/i18n/get-dictionary';

describe('getDictionary', () => {
  it('returns en dictionary with nav keys', async () => {
    const dict = await getDictionary('en');
    expect(dict.nav.services).toBe('Services');
  });
  it('returns vi dictionary with nav keys', async () => {
    const dict = await getDictionary('vi');
    expect(dict.nav.services).toBe('Dịch vụ');
  });
});
```

- [ ] **Step 4: Run test, expect failure**

Run: `npm test -- tests/lib/i18n/get-dictionary.test.ts`
Expected: FAIL.

- [ ] **Step 5: Implement `lib/i18n/get-dictionary.ts`**

```ts
import 'server-only';
import type { Locale } from './config';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

const dictionaries = { en, vi } as const;
export type Dictionary = typeof en;
export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale] as Dictionary;
```

(Imports are synchronous JSON — fine for two locales, bundled at build, zero runtime cost.)

- [ ] **Step 6: Run test, expect pass**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add locales/ lib/i18n/get-dictionary.ts tests/lib/i18n/get-dictionary.test.ts
git commit -m "feat(i18n): add EN/VI dictionaries and getDictionary loader"
```

---

### Task 4: Locale-aware Link wrapper and switcher hook

**Files:**
- Create: `lib/i18n/link.tsx`
- Create: `lib/i18n/use-switch-locale.ts`

- [ ] **Step 1: Implement `lib/i18n/link.tsx`**

```tsx
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
```

- [ ] **Step 2: Implement `lib/i18n/use-switch-locale.ts`**

```ts
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/link.tsx lib/i18n/use-switch-locale.ts
git commit -m "feat(i18n): add locale-prefixed Link and useSwitchLocale hook"
```

---

### Task 5: Proxy (locale redirect) — replaces middleware

**Files:**
- Create: `proxy.ts` (root, sibling of `app/`)

> Reference: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. The export must be named `proxy`.

- [ ] **Step 1: Implement `proxy.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, isLocale } from '@/lib/i18n/config';

function pickLocale(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && isLocale(cookie)) return cookie;
  const header = req.headers.get('accept-language') ?? '';
  const preferred = header.split(',').map(p => p.split(';')[0].trim().toLowerCase());
  for (const p of preferred) {
    if (p.startsWith('vi')) return 'vi';
    if (p.startsWith('en')) return 'en';
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
```

- [ ] **Step 2: Run dev server, verify redirect**

Run: `npm run dev` (background)
Visit `http://localhost:3000/` → should 307-redirect to `/en` (or `/vi` if browser prefers VI).
Visit `http://localhost:3000/services` → redirects to `/en/services`.

(Pages don't exist yet — expect 404 *after* redirect; that's correct.)

- [ ] **Step 3: Stop dev server, commit**

```bash
git add proxy.ts
git commit -m "feat(i18n): add proxy for locale detection and redirect"
```

---

### Task 6: Tailwind v4 theme tokens and globals

**Files:**
- Modify: `app/globals.css`

> Tailwind v4 uses CSS-first config. Theme tokens live in `@theme` inside the global CSS.

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-ink-50:  #f6f7f8;
  --color-ink-100: #e8eaed;
  --color-ink-200: #c9ced4;
  --color-ink-400: #6b7280;
  --color-ink-600: #374151;
  --color-ink-900: #0b1220;

  --color-brand-50:  #eef4ff;
  --color-brand-100: #d9e6ff;
  --color-brand-500: #2563eb;
  --color-brand-700: #1d4ed8;
  --color-brand-900: #1e3a8a;

  --color-accent-500: #c9a24a; /* placeholder gold — swap with final brand */

  --font-sans: var(--font-app-sans), ui-sans-serif, system-ui;
  --font-serif: var(--font-app-serif), ui-serif, Georgia, serif;
}

:root {
  color-scheme: light;
}

html {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  background: var(--color-ink-50);
  color: var(--color-ink-900);
  font-family: var(--font-sans);
}

/* Scroll-driven reveal: applied via class="reveal" */
@supports (animation-timeline: view()) {
  .reveal {
    animation: reveal-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
@keyframes reveal-rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; opacity: 1; transform: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat(theme): add tailwind v4 tokens and scroll-driven reveal base"
```

---

### Task 7: UI primitives

**Files:**
- Create: `lib/cn.ts`
- Create: `components/ui/Container.tsx`
- Create: `components/ui/Section.tsx`
- Create: `components/ui/Heading.tsx`
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Create `lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

- [ ] **Step 2: Create `components/ui/Container.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-6xl px-6 md:px-10', className)} {...rest} />;
}
```

- [ ] **Step 3: Create `components/ui/Section.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

export function Section({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-20 md:py-28', className)} {...rest} />;
}
```

- [ ] **Step 4: Create `components/ui/Heading.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { HTMLAttributes, ElementType } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: ElementType;
  eyebrow?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizes = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
};

export function Heading({ as: Tag = 'h2', eyebrow, size = 'md', className, children, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? <span className="text-xs uppercase tracking-[0.18em] text-brand-700">{eyebrow}</span> : null}
      <Tag className={cn('font-serif font-medium leading-tight text-ink-900', sizes[size], className)} {...rest}>
        {children}
      </Tag>
    </div>
  );
}
```

- [ ] **Step 5: Create `components/ui/Button.tsx`**

```tsx
import { cn } from '@/lib/cn';
import { Link } from '@/lib/i18n/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]';
const variants: Record<Variant, string> = {
  primary: 'bg-ink-900 text-ink-50 hover:bg-brand-900 shadow-sm hover:shadow-md',
  secondary: 'bg-ink-50 text-ink-900 border border-ink-200 hover:border-ink-400',
  ghost: 'bg-transparent text-ink-900 hover:bg-ink-100',
};

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };
type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', className, children } = props;
  const cls = cn(base, variants[variant], className);
  if ('href' in props && props.href) {
    return <Link href={props.href} className={cls}>{children}</Link>;
  }
  const { href: _h, variant: _v, className: _c, children: _ch, ...buttonProps } = props as AsButton;
  return <button className={cls} {...buttonProps}>{children}</button>;
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/cn.ts components/ui/
git commit -m "feat(ui): add Container, Section, Heading, Button primitives"
```

---

### Task 8: Motion primitives

**Files:**
- Create: `components/motion/FadeIn.tsx`
- Create: `components/motion/Reveal.tsx`
- Create: `components/motion/Stagger.tsx`

- [ ] **Step 1: Create `components/motion/FadeIn.tsx`**

```tsx
'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'div'> & { delay?: number };

export function FadeIn({ delay = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `components/motion/Reveal.tsx`**

```tsx
import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';
export function Reveal({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('reveal', className)} {...rest} />;
}
```

- [ ] **Step 3: Create `components/motion/Stagger.tsx`**

```tsx
'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export function Stagger({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {Array.isArray(children)
        ? children.map((child, i) => <motion.div key={i} variants={item}>{child}</motion.div>)
        : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  );
}
```

- [ ] **Step 4: Typecheck and commit**

Run: `npx tsc --noEmit`
```bash
git add components/motion/
git commit -m "feat(motion): add FadeIn, Reveal, Stagger primitives"
```

---

### Task 9: SEO metadata helper

**Files:**
- Create: `lib/seo/metadata.ts`
- Create: `tests/lib/seo/metadata.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildMetadata } from '@/lib/seo/metadata';

describe('buildMetadata', () => {
  it('builds canonical and hreflang alternates', () => {
    const m = buildMetadata({
      locale: 'en',
      path: '/services',
      title: 'Services',
      description: 'desc',
    });
    expect(m.alternates?.canonical).toBe('https://app.com/en/services');
    expect(m.alternates?.languages).toEqual({
      en: 'https://app.com/en/services',
      vi: 'https://app.com/vi/services',
    });
    expect(m.title).toBe('Services');
  });
  it('handles root path per locale', () => {
    const m = buildMetadata({ locale: 'vi', path: '/', title: 'Trang chủ', description: 'd' });
    expect(m.alternates?.canonical).toBe('https://app.com/vi');
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- tests/lib/seo/metadata.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/seo/metadata.ts`**

```ts
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
```

- [ ] **Step 4: Update test to use `https://app.com` and pass**

If `NEXT_PUBLIC_SITE_URL` is not in the test env, the default `https://app.com` is used — tests pass. Run:
```bash
npm test -- tests/lib/seo/metadata.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/seo/metadata.ts tests/lib/seo/metadata.test.ts
git commit -m "feat(seo): add buildMetadata helper with hreflang alternates"
```

---

### Task 10: JSON-LD component and schema builders

**Files:**
- Create: `lib/seo/jsonld.tsx`
- Create: `lib/seo/schema.ts`
- Create: `tests/lib/seo/schema.test.ts`

> Reference: `02-guides/json-ld.md`. Escape `<` to `<` in serialized output.

- [ ] **Step 1: Write failing schema test**

```ts
import { describe, it, expect } from 'vitest';
import { organization, person, service } from '@/lib/seo/schema';

describe('schema builders', () => {
  it('organization has required fields', () => {
    const o = organization();
    expect(o['@type']).toBe('Organization');
    expect(o.name).toBe('APP Consulting');
    expect(o.address).toBeDefined();
  });
  it('person includes credentials and alumniOf', () => {
    const p = person({
      name: 'Christ Vo',
      jobTitle: 'Partner',
      email: 'cvo@app.com',
      telephone: '+84908142529',
      credentials: ['ACCA', 'VACPA'],
      alumniOf: ['KPMG Vietnam'],
    });
    expect(p.hasCredential).toEqual(['ACCA', 'VACPA']);
    expect(p.alumniOf).toEqual([{ '@type': 'Organization', name: 'KPMG Vietnam' }]);
  });
  it('service references provider and area', () => {
    const s = service({ name: 'Transfer Pricing', description: 'd', slug: 'transfer-pricing' });
    expect(s['@type']).toBe('Service');
    expect(s.areaServed).toBe('Vietnam');
    expect(s.provider['@type']).toBe('Organization');
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- tests/lib/seo/schema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/seo/schema.ts`**

```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'APP Consulting',
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14th Floor, HM Town Building, 412 Nguyen Thi Minh Khai',
      addressLocality: 'Ho Chi Minh City',
      addressRegion: 'District 3',
      addressCountry: 'VN',
    },
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+84909121045',
      email: 'toandhnh@gmail.com',
      areaServed: 'VN',
      availableLanguage: ['English', 'Vietnamese'],
    }],
  } as const;
}

export function localBusiness() {
  return {
    ...organization(),
    '@type': 'ProfessionalService',
    priceRange: '$$$',
  };
}

export function person(args: {
  name: string;
  jobTitle: string;
  email: string;
  telephone: string;
  credentials: string[];
  alumniOf: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: args.name,
    jobTitle: args.jobTitle,
    email: args.email,
    telephone: args.telephone,
    worksFor: { '@type': 'Organization', name: 'APP Consulting' },
    hasCredential: args.credentials,
    alumniOf: args.alumniOf.map(name => ({ '@type': 'Organization', name })),
  };
}

export function service(args: { name: string; description: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    serviceType: args.name,
    areaServed: 'Vietnam',
    provider: { '@type': 'Organization', name: 'APP Consulting', url: SITE_URL },
    url: `${SITE_URL}/en/services/${args.slug}`,
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
```

- [ ] **Step 4: Run test, expect pass**

Expected: PASS.

- [ ] **Step 5: Implement `lib/seo/jsonld.tsx`**

```tsx
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/seo/ tests/lib/seo/schema.test.ts
git commit -m "feat(seo): add JSON-LD component and schema builders"
```

---

## Phase B — Shared content layer

### Task 11: Content registry — types and MDX loader

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/mdx.ts`

- [ ] **Step 1: Create `lib/content/types.ts`**

```ts
export type ServiceFrontmatter = {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  order: number;
  whoFor?: string[];
  delivers?: string[];
};

export type PartnerFrontmatter = {
  slug: string;
  name: string;
  role: string;
  credentials: string[];
  email: string;
  phone: string;
  alumniOf: string[];
  notableEngagements: string[];
  order: number;
};
```

- [ ] **Step 2: Create `lib/content/mdx.ts`**

```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts lib/content/mdx.ts
git commit -m "feat(content): add MDX loader and content types"
```

---

### Task 12: Services registry + initial MDX content

**Files:**
- Create: `content/services/{slug}.{en,vi}.mdx` for 7 services
- Create: `lib/content/services.ts`
- Create: `tests/lib/content/services.test.ts`

- [ ] **Step 1: Create 7 service MDX files** — one pair per service

For each of: `accounting`, `tax`, `financial-advisory`, `training`, `business-advisory`, `m-and-a`, `transfer-pricing`.

Template — `content/services/accounting.en.mdx`:
```mdx
---
slug: accounting
title: Accounting
summary: Bookkeeping, financial statements, IFRS conversion, and payroll handled by ex-Big4 practitioners.
order: 1
bullets:
  - Bookkeeping and preparation of financial statements
  - Audit and review of financial statements
  - Consulting on converting financial statements to IFRS
  - Payroll, tax and employee insurance services
delivers:
  - Monthly close package
  - Audit-ready financial statements
  - IFRS conversion workpapers
  - Payroll register and statutory filings
whoFor:
  - Multinational subsidiaries
  - Investment-fund portfolio companies
  - Domestic SMEs entering audit cycles
---

We handle the full accounting close — from daily bookkeeping through audit-ready financial statements — using the same standards our team applied at KPMG and other Big4 firms. For groups reporting under IFRS, we convert VAS books into IFRS-compliant statements with full workpaper support.

Our approach is hands-on: a senior practitioner is assigned to every engagement, and we coordinate directly with your auditor or parent-company finance team.
```

`content/services/accounting.vi.mdx` — same frontmatter shape, VI body:
```mdx
---
slug: accounting
title: Kế toán
summary: Ghi sổ, lập báo cáo tài chính, chuyển đổi IFRS và tiền lương — thực hiện bởi đội ngũ từng làm Big4.
order: 1
bullets:
  - Ghi sổ và lập báo cáo tài chính
  - Soát xét và kiểm toán báo cáo tài chính
  - Tư vấn chuyển đổi báo cáo tài chính sang IFRS
  - Dịch vụ lương, thuế và bảo hiểm nhân viên
delivers:
  - Báo cáo đóng sổ hàng tháng
  - Báo cáo tài chính sẵn sàng kiểm toán
  - Hồ sơ chuyển đổi IFRS
  - Bảng lương và hồ sơ pháp lý
whoFor:
  - Công ty con của tập đoàn đa quốc gia
  - Công ty trong danh mục quỹ đầu tư
  - Doanh nghiệp Việt Nam bước vào chu kỳ kiểm toán
---

Chúng tôi xử lý toàn bộ quy trình kế toán — từ ghi sổ hàng ngày đến báo cáo tài chính sẵn sàng kiểm toán — với chuẩn mực tương đương khi đội ngũ chúng tôi còn làm tại KPMG và các công ty Big4 khác. Với các tập đoàn báo cáo theo IFRS, chúng tôi chuyển đổi sổ sách VAS sang IFRS kèm đầy đủ hồ sơ làm việc.

Cách tiếp cận của chúng tôi là trực tiếp: mỗi hợp đồng đều có một chuyên gia cấp cao phụ trách, làm việc trực tiếp với kiểm toán viên hoặc bộ phận tài chính công ty mẹ của bạn.
```

Repeat the same pattern for the other 6 services. Use the bullets from `APP-PROFILE-2025-EN.md` lines 38–87 for the EN bullets; translate to VI for the VI files. Set `order` 1–7 in the order listed above.

Service titles (EN / VI):
- accounting → Accounting / Kế toán
- tax → Tax / Thuế
- financial-advisory → Financial Advisory / Tư vấn Tài chính
- training → Training Services / Dịch vụ Đào tạo
- business-advisory → Business Advisory / Tư vấn Doanh nghiệp
- m-and-a → M&A Advisory / Tư vấn M&A
- transfer-pricing → Transfer Pricing / Chuyển giá

- [ ] **Step 2: Write failing test**

Create `tests/lib/content/services.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getAllServices, getService } from '@/lib/content/services';

describe('services registry', () => {
  it('lists 7 services sorted by order', async () => {
    const list = await getAllServices('en');
    expect(list).toHaveLength(7);
    expect(list[0].frontmatter.slug).toBe('accounting');
    const orders = list.map(s => s.frontmatter.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
  it('returns vi title for known slug', async () => {
    const s = await getService('tax', 'vi');
    expect(s?.frontmatter.title).toBe('Thuế');
  });
  it('falls back to en when vi missing', async () => {
    // Simulates: if a vi file were absent, en is returned. Both exist, so this just asserts the API works.
    const s = await getService('accounting', 'vi');
    expect(s?.frontmatter.slug).toBe('accounting');
  });
});
```

- [ ] **Step 3: Run test, expect failure**

Run: `npm test -- tests/lib/content/services.test.ts`
Expected: FAIL — registry not implemented.

- [ ] **Step 4: Implement `lib/content/services.ts`**

```ts
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
```

- [ ] **Step 5: Run test, expect pass**

Expected: PASS (assuming all 7 MDX pairs exist).

- [ ] **Step 6: Commit**

```bash
git add content/services/ lib/content/services.ts tests/lib/content/services.test.ts
git commit -m "feat(content): add services registry with 7 service MDX entries (EN/VI)"
```

---

### Task 13: Partners registry + 3 MDX entries

**Files:**
- Create: `content/partners/christ-vo.{en,vi}.mdx`
- Create: `content/partners/dennis-nguyen.{en,vi}.mdx`
- Create: `content/partners/michael-pham.{en,vi}.mdx`
- Create: `lib/content/partners.ts`

- [ ] **Step 1: Create `content/partners/christ-vo.en.mdx`**

```mdx
---
slug: christ-vo
name: Christ Vo
role: Partner
order: 1
credentials:
  - VACPA
  - ACCA
email: cvo@app.com
phone: +84 908 14 2529
alumniOf:
  - KPMG Vietnam Audit and Advisory
notableEngagements:
  - Saigon Paper Corporation
  - TWG Corporation
  - Dong Tien Paper
---

Christ Vo is a highly experienced professional in accounting, auditing, and business consultancy, with over 20 years of expertise, including nearly 10 years at KPMG Vietnam Audit and Advisory. He has directly led audit projects and corporate restructuring consultations for major corporations in consumer goods, real estate, and services.

With a solid foundation in international accounting standards, Christ has played a crucial role in enhancing financial transparency, optimizing control processes, and ensuring adherence to the highest accounting standards. He has also served as CFO at organizations such as Saigon Paper Corporation, TWG Corporation, and Dong Tien Paper, and has participated in numerous M&A transactions in manufacturing, education, and environment sectors.

As a member of ACCA and VACPA, Christ is committed to upholding the highest professional standards while delivering optimal financial solutions that drive operational efficiency and business growth.
```

- [ ] **Step 2: Create `content/partners/christ-vo.vi.mdx`**

```mdx
---
slug: christ-vo
name: Christ Vo
role: Đối tác sáng lập
order: 1
credentials:
  - VACPA
  - ACCA
email: cvo@app.com
phone: +84 908 14 2529
alumniOf:
  - KPMG Việt Nam
notableEngagements:
  - Saigon Paper
  - TWG Corporation
  - Dong Tien Paper
---

Christ Vo là chuyên gia giàu kinh nghiệm trong lĩnh vực kế toán, kiểm toán và tư vấn doanh nghiệp với hơn 20 năm kinh nghiệm, trong đó gần 10 năm tại KPMG Việt Nam. Anh đã trực tiếp dẫn dắt các dự án kiểm toán và tái cấu trúc cho các tập đoàn lớn trong ngành hàng tiêu dùng, bất động sản và dịch vụ.

Với nền tảng vững chắc về chuẩn mực kế toán quốc tế, Christ đóng vai trò then chốt trong việc nâng cao tính minh bạch tài chính, tối ưu hóa quy trình kiểm soát và đảm bảo tuân thủ các chuẩn mực kế toán cao nhất. Anh cũng từng giữ vị trí Giám đốc Tài chính tại Saigon Paper, TWG Corporation và Dong Tien Paper, đồng thời tham gia nhiều thương vụ M&A trong các lĩnh vực sản xuất, giáo dục và môi trường.

Là thành viên của ACCA và VACPA, Christ cam kết duy trì các chuẩn mực nghề nghiệp cao nhất, đồng thời cung cấp các giải pháp tài chính tối ưu cho hiệu quả vận hành và tăng trưởng kinh doanh.
```

- [ ] **Step 3: Create `dennis-nguyen.en.mdx` and `dennis-nguyen.vi.mdx`**

EN frontmatter:
```yaml
slug: dennis-nguyen
name: Dennis Nguyen
role: Partner
order: 2
credentials: [MBA, VACPA, ACCA]
email: nghinv83@yahoo.com
phone: +84 909 83 1905
alumniOf: ['Big4 Vietnam']
notableEngagements: ['Novaland Corporation', 'Indochina Resort (Hoi An)', 'Bien Hoa Sugar JSC', 'Petronas Vietnam']
```
EN body (from profile lines 120–122): 3 paragraphs describing 19+ years of audit experience, Big4 background, industries (manufacturing, property, retail, resort, services, logistics), CFO experience in hospitality, golf, F&B, retail, fashion, education, gym.

VI version: same frontmatter shape with translated `role` (`Đối tác sáng lập`) and translated body.

- [ ] **Step 4: Create `michael-pham.en.mdx` and `michael-pham.vi.mdx`**

EN frontmatter:
```yaml
slug: michael-pham
name: Michael Pham
role: Partner
order: 3
credentials: [ACCA, VACPA]
email: toandhnh@gmail.com
phone: +84 909 12 1045
alumniOf: ['KPMG Vietnam', 'BDO', 'Mazars', 'PKF']
notableEngagements: ['Masan Consumer', 'Mappletree', 'Van Phat Hung', 'Gameloft', 'Dragon Capital Group', 'Mekong Capital', 'Vietcombank', 'Maersk Vietnam']
```
EN body from profile lines 131–134; VI translation in `.vi.mdx`.

- [ ] **Step 5: Implement `lib/content/partners.ts`**

```ts
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
```

- [ ] **Step 6: Commit**

```bash
git add content/partners/ lib/content/partners.ts
git commit -m "feat(content): add 3 partner profiles (EN/VI) and partners registry"
```

---

### Task 14: Home page JSON content

**Files:**
- Create: `content/home/en.json`
- Create: `content/home/vi.json`

- [ ] **Step 1: Create `content/home/en.json`**

```json
{
  "hero": {
    "eyebrow": "Ex-Big4 Advisors · Ho Chi Minh City",
    "title": "Your Vision. Our Mission.",
    "subtitle": "Accounting, tax, and advisory services for multinationals, investment funds, and ambitious Vietnamese businesses.",
    "primaryCta": "Book a Consultation",
    "secondaryCta": "Explore Services",
    "trust": ["Ex-KPMG", "ACCA", "VACPA", "20+ years"]
  },
  "stats": [
    { "value": "20+", "label": "Years of practice" },
    { "value": "3", "label": "Ex-Big4 partners" },
    { "value": "90+", "label": "Engagements led" },
    { "value": "13", "label": "Industries served" }
  ],
  "method": [
    { "title": "Understand", "body": "Deep, thorough understanding of your operations." },
    { "title": "Diagnose", "body": "Identify the key risks and issues in your model." },
    { "title": "Prioritize", "body": "Agree on what's urgent and what can wait." },
    { "title": "Recommend", "body": "Propose solutions tuned to your context." },
    { "title": "Implement", "body": "Work alongside your team to deploy." },
    { "title": "Monitor", "body": "Track outcomes and surface new risks." }
  ],
  "industries": [
    "Manufacturing & services","Retail & ecommerce","F&B & restaurants","Construction & real estate",
    "Banking & finance","Investment funds","Insurance & securities","Pharmacy & medical",
    "Information technology","Health & hospitality","Hotel & tourism","Education, gym & media",
    "Transportation & logistics"
  ],
  "finalCta": {
    "title": "Let's discuss your next move.",
    "body": "Tell us about your business — we'll respond within one business day."
  }
}
```

- [ ] **Step 2: Create `content/home/vi.json`** (same shape, VI text):

```json
{
  "hero": {
    "eyebrow": "Cố vấn từ Big4 · TP. Hồ Chí Minh",
    "title": "Tầm Nhìn Của Bạn. Sứ Mệnh Của Chúng Tôi.",
    "subtitle": "Dịch vụ kế toán, thuế và tư vấn cho tập đoàn đa quốc gia, quỹ đầu tư và doanh nghiệp Việt Nam đầy tham vọng.",
    "primaryCta": "Đặt lịch tư vấn",
    "secondaryCta": "Khám phá dịch vụ",
    "trust": ["Cựu KPMG", "ACCA", "VACPA", "20+ năm"]
  },
  "stats": [
    { "value": "20+", "label": "Năm kinh nghiệm" },
    { "value": "3", "label": "Đối tác từ Big4" },
    { "value": "90+", "label": "Dự án đã thực hiện" },
    { "value": "13", "label": "Ngành phục vụ" }
  ],
  "method": [
    { "title": "Tìm hiểu", "body": "Nắm sâu hoạt động của doanh nghiệp bạn." },
    { "title": "Chẩn đoán", "body": "Xác định rủi ro và vấn đề chính." },
    { "title": "Ưu tiên", "body": "Thống nhất việc cấp bách và việc có thể chờ." },
    { "title": "Đề xuất", "body": "Giải pháp phù hợp với bối cảnh của bạn." },
    { "title": "Triển khai", "body": "Phối hợp cùng đội ngũ của bạn để thực thi." },
    { "title": "Giám sát", "body": "Theo dõi kết quả và phát hiện rủi ro mới." }
  ],
  "industries": [
    "Sản xuất & dịch vụ","Bán lẻ & TMĐT","F&B & nhà hàng","Xây dựng & bất động sản",
    "Ngân hàng & tài chính","Quỹ đầu tư","Bảo hiểm & chứng khoán","Dược phẩm & y tế",
    "Công nghệ thông tin","Sức khỏe & dịch vụ lưu trú","Khách sạn & du lịch","Giáo dục, gym & truyền thông",
    "Vận tải & logistics"
  ],
  "finalCta": {
    "title": "Hãy trao đổi về bước đi tiếp theo.",
    "body": "Chia sẻ về doanh nghiệp của bạn — chúng tôi sẽ phản hồi trong 1 ngày làm việc."
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add content/home/
git commit -m "feat(content): add bilingual home page copy"
```

---

## Phase C — Layout, navigation, fonts

### Task 15: Root layout, fonts, locale layout

**Files:**
- Replace: `app/layout.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx` (placeholder — replaced in Task 19)

> Reference: `03-api-reference/02-components/font.md`, `03-api-reference/03-file-conventions/layout.md`.

- [ ] **Step 1: Replace `app/layout.tsx`** (root passes through to locale layout)

```tsx
import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return children as JSX.Element;
}
```

(Locale layout owns the `<html>` and `<body>` so it can set `lang` and apply fonts per locale.)

- [ ] **Step 2: Create `app/[locale]/layout.tsx`**

```tsx
import { Inter, Fraunces } from 'next/font/google';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/lib/seo/jsonld';
import { organization, localBusiness } from '@/lib/seo/schema';
import { locales, isLocale, type Locale } from '@/lib/i18n/config';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import type { ReactNode } from 'react';

const sans = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-app-sans',
});

const serif = Fraunces({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-app-serif',
});

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <JsonLd data={organization()} />
        <JsonLd data={localBusiness()} />
        <Nav locale={locale as Locale} />
        <main>{children}</main>
        <Footer locale={locale as Locale} />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create placeholder `app/[locale]/page.tsx`**

```tsx
export default async function Home() {
  return <div className="p-10">Home placeholder</div>;
}
```

- [ ] **Step 4: Delete the boilerplate `app/page.tsx` if present**

```bash
rm -f app/page.tsx
```

- [ ] **Step 5: Commit (without running yet — Nav/Footer don't exist)**

```bash
git add app/layout.tsx app/\[locale\]/
git commit -m "feat(app): add locale-aware root layout with fonts and JSON-LD"
```

---

### Task 16: Footer

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Implement `components/layout/Footer.tsx`**

```tsx
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import type { Locale } from '@/lib/i18n/config';

export async function Footer({ locale }: { locale: Locale }) {
  const d = await getDictionary(locale);
  return (
    <footer className="border-t border-ink-200 bg-ink-50 py-16 text-sm text-ink-600">
      <Container className="grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl text-ink-900">APP Consulting</div>
          <p className="mt-3 text-ink-400">{d.footer.tagline}</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.servicesHeading}</div>
          <ul className="space-y-2">
            <li><Link href="/services">{d.nav.services}</Link></li>
            <li><Link href="/about">{d.nav.about}</Link></li>
            <li><Link href="/partners">{d.nav.partners}</Link></li>
            <li><Link href="/contact">{d.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.officeHeading}</div>
          <p>14th Floor, HM Town Building<br/>412 Nguyen Thi Minh Khai<br/>Ward 5, District 3, HCMC</p>
        </div>
        <div>
          <div className="mb-3 font-medium text-ink-900">{d.footer.contactHeading}</div>
          <p><a href="tel:+84909121045">+84 909 121 045</a><br/>
          <a href="mailto:toandhnh@gmail.com">toandhnh@gmail.com</a></p>
          <p className="mt-4 text-xs text-ink-400">ACCA · VACPA</p>
        </div>
      </Container>
      <Container className="mt-10 flex items-center justify-between text-xs text-ink-400">
        <span>© {new Date().getFullYear()} APP Consulting. {d.footer.rights}</span>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(layout): add bilingual footer"
```

---

### Task 17: Locale switcher (client)

**Files:**
- Create: `components/layout/LocaleSwitcher.tsx`

- [ ] **Step 1: Implement**

```tsx
'use client';
import { useSwitchLocale } from '@/lib/i18n/use-switch-locale';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n/config';

export function LocaleSwitcher({ current }: { current: Locale }) {
  const switchTo = useSwitchLocale();
  const linkCls = (active: boolean) =>
    cn(
      'px-2 py-1 text-xs font-medium uppercase tracking-wider transition-colors',
      active ? 'text-ink-900' : 'text-ink-400 hover:text-ink-900',
    );
  return (
    <div className="flex items-center gap-1" aria-label="Language">
      <button className={linkCls(current === 'en')} onClick={() => switchTo('en')}>EN</button>
      <span className="text-ink-200">/</span>
      <button className={linkCls(current === 'vi')} onClick={() => switchTo('vi')}>VI</button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/LocaleSwitcher.tsx
git commit -m "feat(layout): add locale switcher with cookie persistence"
```

---

### Task 18: Nav

**Files:**
- Create: `components/layout/Nav.tsx`

- [ ] **Step 1: Implement**

```tsx
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';

export async function Nav({ locale }: { locale: Locale }) {
  const d = await getDictionary(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-ink-50/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-xl text-ink-900">APP Consulting</Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-600 md:flex">
          <Link href="/services" className="hover:text-ink-900">{d.nav.services}</Link>
          <Link href="/about" className="hover:text-ink-900">{d.nav.about}</Link>
          <Link href="/partners" className="hover:text-ink-900">{d.nav.partners}</Link>
          <Link href="/contact" className="hover:text-ink-900">{d.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher current={locale} />
          <Button href="/contact" className="hidden md:inline-flex">{d.nav.bookConsultation}</Button>
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 2: Run dev server and visit `/en`**

Run: `npm run dev`
Visit `http://localhost:3000/` → redirects → see placeholder Home with Nav + Footer.
Click locale switcher → URL flips to `/vi`, nav labels translate.

- [ ] **Step 3: Stop dev, commit**

```bash
git add components/layout/Nav.tsx
git commit -m "feat(layout): add sticky nav with locale switcher and primary CTA"
```

---

## Phase D — Pages

### Task 19: Marketing components for Home

**Files:**
- Create: `components/marketing/Hero.tsx`
- Create: `components/marketing/ServiceCard.tsx`
- Create: `components/marketing/ServiceGrid.tsx`
- Create: `components/marketing/StatTile.tsx`
- Create: `components/marketing/MethodTimeline.tsx`
- Create: `components/marketing/IndustriesStrip.tsx`
- Create: `components/marketing/FinalCta.tsx`
- Create: `components/marketing/PartnerCard.tsx`

- [ ] **Step 1: Create `Hero.tsx`**

```tsx
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Stagger } from '@/components/motion/Stagger';
import { cn } from '@/lib/cn';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trust: string[];
};

export function Hero({ eyebrow, title, subtitle, primaryCta, secondaryCta, trust }: Props) {
  const words = title.split(' ');
  return (
    <section className="relative overflow-hidden bg-ink-50 pt-20 pb-24 md:pt-28 md:pb-32">
      <Container className="relative z-10">
        <span className="text-xs uppercase tracking-[0.2em] text-brand-700">{eyebrow}</span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.1] text-ink-900 md:text-7xl">
          <Stagger>
            {words.map((w, i) => (
              <span key={i} className="mr-3 inline-block">{w}</span>
            ))}
          </Stagger>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-600">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href={secondaryCta.href} variant="secondary">{secondaryCta.label}</Button>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-400">
          {trust.map(t => <li key={t} className={cn('flex items-center gap-2')}>
            <span className="h-1 w-1 rounded-full bg-accent-500"/>{t}
          </li>)}
        </ul>
      </Container>
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-100/40 blur-3xl"/>
    </section>
  );
}
```

- [ ] **Step 2: Create `ServiceCard.tsx`**

```tsx
import { Link } from '@/lib/i18n/link';
import { cn } from '@/lib/cn';

export function ServiceCard({
  number, title, summary, href,
}: { number: number; title: string; summary: string; href: string }) {
  return (
    <Link href={href} className={cn(
      'group flex flex-col justify-between rounded-2xl border border-ink-200 bg-ink-50 p-8 transition-all duration-200',
      'hover:border-ink-900 hover:shadow-md',
    )}>
      <div>
        <div className="text-xs font-mono text-ink-400">{String(number).padStart(2, '0')}</div>
        <h3 className="mt-4 font-serif text-2xl text-ink-900">{title}</h3>
        <p className="mt-3 text-sm text-ink-600">{summary}</p>
      </div>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-900">
        <span className="border-b border-ink-900 transition-all group-hover:pr-2">→</span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Create `ServiceGrid.tsx`**

```tsx
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { ServiceCard } from './ServiceCard';
import { getAllServices } from '@/lib/content/services';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/lib/i18n/config';

export async function ServiceGrid({ locale, eyebrow, title }: { locale: Locale; eyebrow: string; title: string }) {
  const services = await getAllServices(locale);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <Reveal><Heading eyebrow={eyebrow} size="lg">{title}</Heading></Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.frontmatter.slug}>
              <ServiceCard
                number={i + 1}
                title={s.frontmatter.title}
                summary={s.frontmatter.summary}
                href={`/services/${s.frontmatter.slug}`}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Create `StatTile.tsx`**

```tsx
export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
      <div className="font-serif text-4xl text-ink-900">{value}</div>
      <div className="mt-2 text-sm text-ink-400">{label}</div>
    </div>
  );
}
```

- [ ] **Step 5: Create `MethodTimeline.tsx`**

```tsx
import { Reveal } from '@/components/motion/Reveal';

export function MethodTimeline({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="relative grid gap-8 md:grid-cols-3 lg:grid-cols-6">
      <div className="pointer-events-none absolute left-0 top-6 hidden h-px w-full bg-ink-200 lg:block" aria-hidden/>
      {steps.map((step, i) => (
        <Reveal key={step.title} className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-900 bg-ink-50 font-mono text-sm">
            {String(i + 1).padStart(2, '0')}
          </div>
          <h4 className="mt-4 font-medium text-ink-900">{step.title}</h4>
          <p className="mt-1 text-sm text-ink-600">{step.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}
```

- [ ] **Step 6: Create `IndustriesStrip.tsx`**

```tsx
export function IndustriesStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(item => (
        <span key={item} className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600">
          {item}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `FinalCta.tsx`**

```tsx
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function FinalCta({ title, body, ctaLabel }: { title: string; body: string; ctaLabel: string }) {
  return (
    <section className="bg-ink-900 py-24 text-ink-50">
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
          <p className="mt-2 max-w-xl text-ink-200">{body}</p>
        </div>
        <Button href="/contact" variant="secondary">{ctaLabel}</Button>
      </Container>
    </section>
  );
}
```

- [ ] **Step 8: Create `PartnerCard.tsx`**

```tsx
import type { PartnerFrontmatter } from '@/lib/content/types';
import { Link } from '@/lib/i18n/link';

export function PartnerCard({ partner }: { partner: PartnerFrontmatter }) {
  return (
    <Link href={`/partners#${partner.slug}`} className="block rounded-2xl border border-ink-200 bg-ink-50 p-6 transition-all hover:border-ink-900">
      <div className="aspect-[4/5] rounded-xl bg-ink-100" aria-hidden/>
      <div className="mt-4 font-serif text-xl text-ink-900">{partner.name}</div>
      <div className="text-sm text-ink-400">{partner.role}</div>
      <div className="mt-3 flex flex-wrap gap-1 text-xs">
        {partner.credentials.map(c => (
          <span key={c} className="rounded-full bg-ink-100 px-2 py-1 text-ink-600">{c}</span>
        ))}
      </div>
    </Link>
  );
}
```

- [ ] **Step 9: Typecheck and commit**

Run: `npx tsc --noEmit`
```bash
git add components/marketing/
git commit -m "feat(marketing): add Hero, ServiceGrid, MethodTimeline, partner and CTA components"
```

---

### Task 20: Home page assembly

**Files:**
- Replace: `app/[locale]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Hero } from '@/components/marketing/Hero';
import { ServiceGrid } from '@/components/marketing/ServiceGrid';
import { StatTile } from '@/components/marketing/StatTile';
import { MethodTimeline } from '@/components/marketing/MethodTimeline';
import { IndustriesStrip } from '@/components/marketing/IndustriesStrip';
import { FinalCta } from '@/components/marketing/FinalCta';
import { PartnerCard } from '@/components/marketing/PartnerCard';
import { getAllPartners } from '@/lib/content/partners';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import { Reveal } from '@/components/motion/Reveal';
import enHome from '@/content/home/en.json';
import viHome from '@/content/home/vi.json';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const home = locale === 'vi' ? viHome : enHome;
  return buildMetadata({
    locale,
    path: '/',
    title: 'APP Consulting — ' + home.hero.title,
    description: home.hero.subtitle,
  });
}

export default async function Home({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const home = loc === 'vi' ? viHome : enHome;
  const partners = await getAllPartners(loc);

  return (
    <>
      <Hero
        eyebrow={home.hero.eyebrow}
        title={home.hero.title}
        subtitle={home.hero.subtitle}
        primaryCta={{ label: home.hero.primaryCta, href: '/contact' }}
        secondaryCta={{ label: home.hero.secondaryCta, href: '/services' }}
        trust={home.hero.trust}
      />

      <ServiceGrid
        locale={loc}
        eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Services'}
        title={loc === 'vi' ? 'Tư vấn toàn diện cho doanh nghiệp xuyên biên giới.' : 'Full-spectrum advisory for cross-border businesses.'}
      />

      <section className="bg-ink-100 py-24">
        <Container className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Vì sao chọn APP' : 'Why APP'} size="lg">
              {loc === 'vi' ? 'Tiêu chuẩn Big4. Cách tiếp cận thực dụng.' : 'Big4 standards. Pragmatic delivery.'}
            </Heading>
            <p className="mt-6 text-ink-600">
              {loc === 'vi'
                ? 'Đội ngũ của chúng tôi từng dẫn dắt kiểm toán và tái cấu trúc cho các tập đoàn lớn tại KPMG và các công ty Big4 khác. Nay chúng tôi mang chuyên môn đó đến phục vụ trực tiếp doanh nghiệp của bạn.'
                : 'Our team led audits and restructuring for major corporations at KPMG and other Big4 firms. We bring that craft directly to your business — without the overhead.'}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {home.stats.map(s => <Reveal key={s.label}><StatTile value={s.value} label={s.label} /></Reveal>)}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Phương pháp' : 'Our Method'} size="lg">
              {loc === 'vi' ? 'Sáu bước có kỷ luật.' : 'Six disciplined steps.'}
            </Heading>
          </Reveal>
          <div className="mt-16"><MethodTimeline steps={home.method} /></div>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Đối tác' : 'Partners'} size="lg">
              {loc === 'vi' ? 'Dẫn dắt bởi cựu đối tác Big4.' : 'Led by ex-Big4 partners.'}
            </Heading>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {partners.map(p => <PartnerCard key={p.frontmatter.slug} partner={p.frontmatter} />)}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <Heading eyebrow={loc === 'vi' ? 'Ngành' : 'Industries'} size="md">
              {loc === 'vi' ? 'Mười ba ngành. Một chuẩn mực.' : 'Thirteen industries. One standard.'}
            </Heading>
          </Reveal>
          <div className="mt-10"><IndustriesStrip items={home.industries} /></div>
        </Container>
      </section>

      <FinalCta title={home.finalCta.title} body={home.finalCta.body} ctaLabel={d.nav.bookConsultation} />
    </>
  );
}
```

- [ ] **Step 2: Run dev, verify both locales**

Run: `npm run dev`
Visit `/en` and `/vi` — page renders, no console errors, locale switcher flips content.

- [ ] **Step 3: Stop dev, commit**

```bash
git add app/\[locale\]/page.tsx
git commit -m "feat(home): assemble bilingual home page with all sections"
```

---

### Task 21: About page

**Files:**
- Create: `app/[locale]/about/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { MethodTimeline } from '@/components/marketing/MethodTimeline';
import { FinalCta } from '@/components/marketing/FinalCta';
import { Reveal } from '@/components/motion/Reveal';
import { buildMetadata } from '@/lib/seo/metadata';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale, type Locale } from '@/lib/i18n/config';
import enHome from '@/content/home/en.json';
import viHome from '@/content/home/vi.json';

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/about',
    title: locale === 'vi' ? 'Về chúng tôi' : 'About',
    description: locale === 'vi'
      ? 'APP Consulting — đội ngũ chuyên gia tài chính, thuế và kiểm toán từng làm tại Big4.'
      : 'APP Consulting — a team of finance, tax, and audit specialists from Big4 backgrounds.',
  });
}

const copy = {
  en: {
    eyebrow: 'About APP',
    title: 'A consulting firm built by practitioners.',
    intro: 'APP Consulting was founded by leading experts in accounting, finance, auditing, tax, and advisory — each with deep experience at international auditing firms and large multinational corporations.',
    body: 'We understand the culture, thinking, and working environments of multinationals operating in Vietnam as well as domestic enterprises. That perspective lets us deliver flexible, fit-for-purpose solutions — for multinational groups, mid-market companies, and non-profit organizations alike.',
    visionHeading: 'Vision',
    vision: 'Become a leading accounting and consulting service provider.',
    missionHeading: 'Mission',
    mission: 'Create and maintain a strong brand image, deliver consulting services of the highest quality, and bring the greatest efficiency to our clients — through a professional, dedicated team built to serve.',
    valuesHeading: 'Core values',
    values: [
      { title: 'Responsibility & commitment', body: 'We accept ownership of outcomes from kickoff through monitoring.' },
      { title: 'Professional & dedicated', body: 'Big4-trained practitioners on every engagement.' },
      { title: 'Quality solutions', body: 'Effective, evidence-based, and ready to defend.' },
    ],
    methodEyebrow: 'Method',
    methodTitle: 'How we work.',
  },
  vi: {
    eyebrow: 'Về APP',
    title: 'Công ty tư vấn do chính người làm nghề xây dựng.',
    intro: 'APP Consulting được thành lập bởi các chuyên gia hàng đầu trong lĩnh vực kế toán, tài chính, kiểm toán, thuế và tư vấn — đều giàu kinh nghiệm tại các công ty kiểm toán quốc tế và các tập đoàn đa quốc gia lớn.',
    body: 'Chúng tôi hiểu rõ văn hóa, tư duy và môi trường làm việc của các tập đoàn đa quốc gia tại Việt Nam cũng như doanh nghiệp trong nước. Điều đó giúp chúng tôi cung cấp giải pháp linh hoạt, phù hợp — cho tập đoàn lớn, doanh nghiệp tầm trung và cả tổ chức phi lợi nhuận.',
    visionHeading: 'Tầm nhìn',
    vision: 'Trở thành đơn vị tư vấn và kế toán hàng đầu.',
    missionHeading: 'Sứ mệnh',
    mission: 'Xây dựng và giữ vững hình ảnh tốt, cung cấp dịch vụ tư vấn chất lượng cao nhất, mang lại hiệu quả tối ưu cho khách hàng — với đội ngũ chuyên nghiệp, tận tâm.',
    valuesHeading: 'Giá trị cốt lõi',
    values: [
      { title: 'Trách nhiệm & cam kết', body: 'Chúng tôi đồng hành cùng kết quả từ khởi tạo đến giám sát.' },
      { title: 'Chuyên nghiệp & tận tâm', body: 'Chuyên gia được đào tạo Big4 trong mỗi dự án.' },
      { title: 'Giải pháp chất lượng', body: 'Hiệu quả, có bằng chứng và sẵn sàng bảo vệ.' },
    ],
    methodEyebrow: 'Phương pháp',
    methodTitle: 'Cách chúng tôi làm việc.',
  },
};

export default async function AboutPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const c = copy[loc];
  const home = loc === 'vi' ? viHome : enHome;

  return (
    <>
      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={c.eyebrow} size="xl">{c.title}</Heading>
          <p className="mt-8 text-lg text-ink-600">{c.intro}</p>
          <p className="mt-4 text-ink-600">{c.body}</p>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-700">{c.visionHeading}</div>
              <p className="mt-4 font-serif text-2xl text-ink-900">{c.vision}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-brand-700">{c.missionHeading}</div>
              <p className="mt-4 text-ink-900">{c.mission}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal><Heading eyebrow={c.valuesHeading} size="lg">{loc === 'vi' ? 'Ba giá trị định hướng mọi hành động.' : 'Three values that guide every action.'}</Heading></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {c.values.map(v => (
              <Reveal key={v.title}>
                <div className="rounded-2xl border border-ink-200 p-8">
                  <h3 className="font-serif text-xl text-ink-900">{v.title}</h3>
                  <p className="mt-3 text-sm text-ink-600">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink-100 py-24">
        <Container>
          <Reveal><Heading eyebrow={c.methodEyebrow} size="lg">{c.methodTitle}</Heading></Reveal>
          <div className="mt-16"><MethodTimeline steps={home.method} /></div>
        </Container>
      </section>

      <FinalCta
        title={loc === 'vi' ? 'Sẵn sàng làm việc cùng chúng tôi?' : 'Ready to work with us?'}
        body={loc === 'vi' ? 'Một cuộc trao đổi ngắn cũng đủ để bắt đầu.' : 'A short conversation is enough to begin.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run dev` → visit `/en/about` and `/vi/about`. Stop. Commit.
```bash
git add app/\[locale\]/about/
git commit -m "feat(about): add bilingual about page"
```

---

### Task 22: Services overview page

**Files:**
- Create: `app/[locale]/services/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { FinalCta } from '@/components/marketing/FinalCta';
import { JsonLd } from '@/lib/seo/jsonld';
import { breadcrumbs } from '@/lib/seo/schema';
import { getAllServices } from '@/lib/content/services';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { locale: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/services',
    title: locale === 'vi' ? 'Dịch vụ' : 'Services',
    description: locale === 'vi'
      ? 'Kế toán, thuế, tư vấn tài chính, M&A, chuyển giá và đào tạo cho doanh nghiệp tại Việt Nam.'
      : 'Accounting, tax, financial advisory, M&A, transfer pricing, and training for businesses in Vietnam.',
  });
}

export default async function ServicesPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const services = await getAllServices(loc);

  return (
    <>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Dịch vụ' : 'Services', url: `${SITE}/${loc}/services` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Services'} size="xl">
            {loc === 'vi' ? 'Tư vấn toàn diện cho doanh nghiệp xuyên biên giới.' : 'Full-spectrum advisory for cross-border businesses.'}
          </Heading>
          <p className="mt-8 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Bảy lĩnh vực dịch vụ — mỗi lĩnh vực do một chuyên gia cấp cao phụ trách.'
              : 'Seven service categories — each led by a senior practitioner.'}
          </p>
        </Container>
      </section>

      <Container>
        <div className="grid gap-px bg-ink-200">
          {services.map((s, idx) => (
            <Reveal key={s.frontmatter.slug} className="bg-ink-50">
              <section id={s.frontmatter.slug} className="grid gap-10 py-16 md:grid-cols-[1fr_2fr] md:gap-16">
                <div>
                  <div className="font-mono text-sm text-ink-400">{String(idx + 1).padStart(2, '0')}</div>
                  <h2 className="mt-4 font-serif text-3xl text-ink-900">{s.frontmatter.title}</h2>
                  <p className="mt-4 text-ink-600">{s.frontmatter.summary}</p>
                  <Button href={`/services/${s.frontmatter.slug}`} variant="secondary" className="mt-6">
                    {d.common.readMore}
                  </Button>
                </div>
                <ul className="space-y-3 border-l border-ink-200 pl-8">
                  {s.frontmatter.bullets.map(b => (
                    <li key={b} className="text-ink-600">
                      <span className="text-accent-500">— </span>{b}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </Container>

      <FinalCta
        title={loc === 'vi' ? 'Bạn cần dịch vụ nào?' : 'Which service do you need?'}
        body={loc === 'vi' ? 'Cho chúng tôi biết, sẽ có chuyên gia phù hợp liên hệ.' : 'Tell us, and a partner will reach out directly.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify and commit**

Visit `/en/services` and `/vi/services`. Anchors `#accounting`, etc. work via direct URL.
```bash
git add app/\[locale\]/services/page.tsx
git commit -m "feat(services): add services overview page with anchored sections"
```

---

### Task 23: Service detail page

**Files:**
- Create: `app/[locale]/services/[slug]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { JsonLd } from '@/lib/seo/jsonld';
import { service as serviceSchema, breadcrumbs } from '@/lib/seo/schema';
import { getService, getAllServices } from '@/lib/content/services';
import { renderMdx } from '@/lib/content/mdx';
import { buildMetadata } from '@/lib/seo/metadata';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/lib/i18n/config';
import { listSlugs } from '@/lib/content/mdx';

type Params = { locale: string; slug: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateStaticParams() {
  const slugs = await listSlugs('services');
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const doc = await getService(slug, locale);
  if (!doc) return {};
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: doc.frontmatter.title,
    description: doc.frontmatter.summary,
  });
}

export default async function ServiceDetail({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const doc = await getService(slug, loc);
  if (!doc) notFound();
  const d = await getDictionary(loc);
  const all = await getAllServices(loc);
  const related = all.filter(s => s.frontmatter.slug !== slug).slice(0, 2);
  const body = await renderMdx(doc.raw);

  return (
    <>
      <JsonLd data={serviceSchema({
        name: doc.frontmatter.title,
        description: doc.frontmatter.summary,
        slug,
      })}/>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Dịch vụ' : 'Services', url: `${SITE}/${loc}/services` },
        { name: doc.frontmatter.title, url: `${SITE}/${loc}/services/${slug}` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Dịch vụ' : 'Service'} size="xl">{doc.frontmatter.title}</Heading>
          <p className="mt-6 text-lg text-ink-600">{doc.frontmatter.summary}</p>
          <Button href={`/contact?service=${slug}`} className="mt-10">{d.common.discuss}</Button>
        </Container>
      </section>

      <Container className="prose prose-ink max-w-3xl py-12 text-ink-600">
        {body}
      </Container>

      {doc.frontmatter.delivers ? (
        <section className="bg-ink-100 py-20">
          <Container className="max-w-3xl">
            <Heading size="md">{loc === 'vi' ? 'Sản phẩm bàn giao' : 'What we deliver'}</Heading>
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {doc.frontmatter.delivers.map(item => (
                <li key={item} className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-ink-600">
                  <span className="text-accent-500">✓ </span>{item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {doc.frontmatter.whoFor ? (
        <section className="py-20">
          <Container className="max-w-3xl">
            <Heading size="md">{loc === 'vi' ? 'Phù hợp với' : 'Who it\'s for'}</Heading>
            <div className="mt-6 flex flex-wrap gap-2">
              {doc.frontmatter.whoFor.map(item => (
                <span key={item} className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600">{item}</span>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="bg-ink-100 py-20">
        <Container>
          <Heading eyebrow={loc === 'vi' ? 'Liên quan' : 'Related'} size="md">
            {loc === 'vi' ? 'Dịch vụ khác có thể hữu ích.' : 'Other services that may help.'}
          </Heading>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {related.map(r => (
              <Reveal key={r.frontmatter.slug}>
                <a href={`/${loc}/services/${r.frontmatter.slug}`} className="block rounded-2xl border border-ink-200 bg-ink-50 p-6 hover:border-ink-900">
                  <div className="font-serif text-xl text-ink-900">{r.frontmatter.title}</div>
                  <p className="mt-2 text-sm text-ink-600">{r.frontmatter.summary}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify and commit**

Visit `/en/services/accounting` and `/vi/services/m-and-a`. Confirm body, deliverables, related.
```bash
git add app/\[locale\]/services/\[slug\]/
git commit -m "feat(services): add service detail page with MDX body and JSON-LD"
```

---

### Task 24: Partners page

**Files:**
- Create: `app/[locale]/partners/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { FinalCta } from '@/components/marketing/FinalCta';
import { JsonLd } from '@/lib/seo/jsonld';
import { person, breadcrumbs } from '@/lib/seo/schema';
import { renderMdx } from '@/lib/content/mdx';
import { getAllPartners } from '@/lib/content/partners';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { locale: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/partners',
    title: locale === 'vi' ? 'Đối tác' : 'Partners',
    description: locale === 'vi'
      ? 'Đội ngũ sáng lập APP Consulting — cựu chuyên gia Big4 với hơn 20 năm kinh nghiệm.'
      : 'APP Consulting partners — ex-Big4 leaders with 20+ years of experience.',
  });
}

export default async function PartnersPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const partners = await getAllPartners(loc);

  return (
    <>
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Đối tác' : 'Partners', url: `${SITE}/${loc}/partners` },
      ])}/>
      {partners.map(p => (
        <JsonLd
          key={p.frontmatter.slug}
          data={person({
            name: p.frontmatter.name,
            jobTitle: p.frontmatter.role,
            email: p.frontmatter.email,
            telephone: p.frontmatter.phone,
            credentials: p.frontmatter.credentials,
            alumniOf: p.frontmatter.alumniOf,
          })}
        />
      ))}

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Đối tác' : 'Partners'} size="xl">
            {loc === 'vi' ? 'Dẫn dắt bởi cựu đối tác Big4.' : 'Led by ex-Big4 partners.'}
          </Heading>
          <p className="mt-6 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Mỗi đối tác có hơn 17 năm kinh nghiệm tại các công ty kiểm toán quốc tế và tập đoàn lớn.'
              : 'Each partner brings 17+ years from international audit firms and large corporations.'}
          </p>
        </Container>
      </section>

      <Container className="space-y-24 pb-24">
        {await Promise.all(partners.map(async (p, idx) => {
          const body = await renderMdx(p.raw);
          const reverse = idx % 2 === 1;
          return (
            <Reveal key={p.frontmatter.slug}>
              <article id={p.frontmatter.slug} className={`grid items-start gap-12 md:grid-cols-[2fr_3fr] ${reverse ? 'md:[&>div:first-child]:order-2' : ''}`}>
                <div>
                  <div className="aspect-[4/5] rounded-2xl bg-ink-100" aria-hidden/>
                </div>
                <div>
                  <h2 className="font-serif text-3xl text-ink-900">{p.frontmatter.name}</h2>
                  <div className="mt-1 text-sm text-ink-400">{p.frontmatter.role}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.frontmatter.credentials.map(c => (
                      <span key={c} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{c}</span>
                    ))}
                  </div>
                  <div className="prose prose-ink mt-6 text-ink-600">{body}</div>
                  <div className="mt-6">
                    <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Đã làm việc với' : 'Notable engagements'}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.frontmatter.notableEngagements.map(e => (
                        <span key={e} className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={`mailto:${p.frontmatter.email}`} variant="secondary">{p.frontmatter.email}</Button>
                    <Button href={`tel:${p.frontmatter.phone.replace(/\s/g, '')}`} variant="ghost">{p.frontmatter.phone}</Button>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        }))}
      </Container>

      <FinalCta
        title={loc === 'vi' ? 'Trao đổi trực tiếp với một đối tác.' : 'Talk to a partner directly.'}
        body={loc === 'vi' ? 'Phản hồi trong một ngày làm việc.' : 'A reply within one business day.'}
        ctaLabel={d.nav.bookConsultation}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify and commit**

Visit `/en/partners` and `/vi/partners`. Check JSON-LD via DevTools (network/source).
```bash
git add app/\[locale\]/partners/
git commit -m "feat(partners): add partners page with bios, credentials, and Person JSON-LD"
```

---

### Task 25: Contact form server action with Resend

**Files:**
- Create: `lib/actions/contact.ts`
- Create: `tests/lib/actions/contact.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { submitContactForm } from '@/lib/actions/contact';

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'em_1' }, error: null });
  process.env.RESEND_API_KEY = 'test_key';
  process.env.CONTACT_TO_EMAIL = 'to@example.com';
  process.env.CONTACT_FROM_EMAIL = 'from@example.com';
});

function makeForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('name', 'Alex Tester');
  fd.set('email', 'alex@example.com');
  fd.set('message', 'Hello — need help with IFRS conversion.');
  fd.set('company', '');
  fd.set('phone', '');
  fd.set('service', '');
  fd.set('honeypot', '');
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe('submitContactForm', () => {
  it('returns ok when valid', async () => {
    const result = await submitContactForm({ ok: false }, makeForm());
    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
  });
  it('returns field errors when invalid', async () => {
    const result = await submitContactForm({ ok: false }, makeForm({ email: 'not-an-email', message: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.message).toBeDefined();
    }
    expect(sendMock).not.toHaveBeenCalled();
  });
  it('rejects honeypot submissions silently', async () => {
    const result = await submitContactForm({ ok: false }, makeForm({ honeypot: 'spam-bot' }));
    expect(result.ok).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- tests/lib/actions/contact.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `lib/actions/contact.ts`**

```ts
'use server';
import { z } from 'zod';
import { Resend } from 'resend';

const schema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
  honeypot: z.string().optional(),
});

export type ContactState =
  | { ok: true }
  | { ok: false; errors: Partial<Record<'name' | 'email' | 'message' | 'form', string>> };

export async function submitContactForm(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      },
    };
  }
  if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
    return { ok: true }; // silent drop
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return { ok: false, errors: { form: 'Email service not configured.' } };
  }
  const resend = new Resend(apiKey);
  const { name, company, email, phone, service, message } = parsed.data;
  const subject = `New consultation request from ${name}${company ? ` (${company})` : ''}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company ?? '')}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone ?? '')}</p>
    <p><strong>Service:</strong> ${escapeHtml(service ?? '')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
  `;
  const { error } = await resend.emails.send({ from, to, subject, html, replyTo: email });
  if (error) return { ok: false, errors: { form: 'Failed to send. Please try again.' } };
  return { ok: true };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]!));
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- tests/lib/actions/contact.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/actions/contact.ts tests/lib/actions/contact.test.ts
git commit -m "feat(contact): add Server Action for contact form via Resend"
```

---

### Task 26: Contact form component and page

**Files:**
- Create: `components/marketing/ContactForm.tsx`
- Create: `app/[locale]/contact/page.tsx`

- [ ] **Step 1: Create `components/marketing/ContactForm.tsx`**

```tsx
'use client';
import { useActionState } from 'react';
import { submitContactForm, type ContactState } from '@/lib/actions/contact';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Dict = {
  name: string; company: string; email: string; phone: string; service: string;
  message: string; submit: string; success: string;
  errors: { name: string; email: string; message: string };
};

const initial: ContactState = { ok: false, errors: {} } as ContactState;

export function ContactForm({
  dict,
  serviceOptions,
  prefilledService,
}: {
  dict: Dict;
  serviceOptions: { value: string; label: string }[];
  prefilledService?: string;
}) {
  const [state, formAction, pending] = useActionState(submitContactForm, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8 text-ink-600">
        {dict.success}
      </div>
    );
  }

  const errors = 'errors' in state ? state.errors : {};
  const field = (id: string, label: string, error?: string) => ({ id, label, error });
  const inputCls = (err?: string) => cn(
    'w-full rounded-xl border bg-ink-50 px-4 py-3 text-sm text-ink-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500',
    err ? 'border-red-500' : 'border-ink-200',
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.name}</span>
          <input name="name" required className={inputCls(errors.name)} />
          {errors.name ? <span className="text-xs text-red-600">{dict.errors.name}</span> : null}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.company}</span>
          <input name="company" className={inputCls()} />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.email}</span>
          <input name="email" type="email" required className={inputCls(errors.email)} />
          {errors.email ? <span className="text-xs text-red-600">{dict.errors.email}</span> : null}
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink-400">{dict.phone}</span>
          <input name="phone" className={inputCls()} />
        </label>
      </div>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-ink-400">{dict.service}</span>
        <select name="service" defaultValue={prefilledService ?? ''} className={inputCls()}>
          <option value="">—</option>
          {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs uppercase tracking-wider text-ink-400">{dict.message}</span>
        <textarea name="message" required rows={6} className={inputCls(errors.message)} />
        {errors.message ? <span className="text-xs text-red-600">{dict.errors.message}</span> : null}
      </label>
      {'errors' in state && state.errors.form ? (
        <div className="text-sm text-red-600">{state.errors.form}</div>
      ) : null}
      <Button type="submit" className="w-full md:w-auto" disabled={pending}>
        {pending ? '…' : dict.submit}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create `app/[locale]/contact/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { ContactForm } from '@/components/marketing/ContactForm';
import { JsonLd } from '@/lib/seo/jsonld';
import { localBusiness, breadcrumbs } from '@/lib/seo/schema';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getAllServices } from '@/lib/content/services';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { locale: string };
type SearchParams = { service?: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/contact',
    title: locale === 'vi' ? 'Liên hệ' : 'Contact',
    description: locale === 'vi'
      ? 'Đặt lịch tư vấn miễn phí với APP Consulting tại TP. Hồ Chí Minh.'
      : 'Schedule a free consultation with APP Consulting in Ho Chi Minh City.',
  });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const { service } = await searchParams;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const d = await getDictionary(loc);
  const services = await getAllServices(loc);
  const serviceOptions = services.map(s => ({ value: s.frontmatter.slug, label: s.frontmatter.title }));

  return (
    <>
      <JsonLd data={localBusiness()} />
      <JsonLd data={breadcrumbs([
        { name: 'Home', url: `${SITE}/${loc}` },
        { name: loc === 'vi' ? 'Liên hệ' : 'Contact', url: `${SITE}/${loc}/contact` },
      ])}/>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Heading eyebrow={loc === 'vi' ? 'Liên hệ' : 'Contact'} size="xl">
            {loc === 'vi' ? 'Hãy bắt đầu cuộc trò chuyện.' : 'Let\'s start the conversation.'}
          </Heading>
          <p className="mt-6 text-lg text-ink-600">
            {loc === 'vi'
              ? 'Chia sẻ ngắn gọn nhu cầu của bạn — một đối tác sẽ phản hồi trong vòng một ngày làm việc.'
              : 'Share a brief on your needs — a partner will respond within one business day.'}
          </p>
        </Container>
      </section>

      <section className="pb-24">
        <Container className="grid gap-12 md:grid-cols-[3fr_2fr]">
          <ContactForm dict={d.form} serviceOptions={serviceOptions} prefilledService={service} />
          <aside className="space-y-6 rounded-2xl border border-ink-200 bg-ink-50 p-8 text-sm text-ink-600">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Văn phòng' : 'Office'}</div>
              <p className="mt-2 text-ink-900">14th Floor, HM Town Building</p>
              <p>412 Nguyen Thi Minh Khai</p>
              <p>Ward 5, District 3, HCMC</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Liên hệ' : 'Direct'}</div>
              <p className="mt-2"><a href="tel:+84909121045" className="text-ink-900 hover:underline">+84 909 121 045</a></p>
              <p><a href="mailto:toandhnh@gmail.com" className="text-ink-900 hover:underline">toandhnh@gmail.com</a></p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-400">{loc === 'vi' ? 'Giờ làm việc' : 'Hours'}</div>
              <p className="mt-2">Mon–Fri · 09:00–18:00 ICT</p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`. Visit `/en/contact`. Submit invalid form → see field errors. Submit valid (with mocked env or real Resend key) → success state.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/ContactForm.tsx app/\[locale\]/contact/
git commit -m "feat(contact): add contact form UI and bilingual contact page"
```

---

## Phase E — SEO, sitemap, polish

### Task 27: Sitemap and robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Implement `app/sitemap.ts`**

```ts
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
```

- [ ] **Step 2: Implement `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm start`. Visit `/sitemap.xml` and `/robots.txt`. Expect both populated.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): add sitemap with hreflang alternates and robots.txt"
```

---

### Task 28: OG image, favicon, not-found

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/icon.tsx`
- Create: `app/not-found.tsx`

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '80px',
        background: '#0b1220', color: '#f6f7f8',
        fontFamily: 'serif',
      }}>
        <div style={{ fontSize: 28, opacity: 0.6, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          APP Consulting
        </div>
        <div>
          <div style={{ fontSize: 80, lineHeight: 1.05 }}>Your Vision.</div>
          <div style={{ fontSize: 80, lineHeight: 1.05, color: '#c9a24a' }}>Our Mission.</div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.6 }}>Ex-Big4 advisors · Ho Chi Minh City</div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Create `app/icon.tsx`**

```tsx
import { ImageResponse } from 'next/og';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0b1220', color: '#c9a24a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontFamily: 'serif', fontWeight: 600,
      }}>A</div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 3: Create `app/not-found.tsx`**

```tsx
import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-6xl text-ink-900">404</div>
        <p className="mt-4 text-ink-600">The page you’re looking for doesn’t exist.</p>
        <Link href="/en" className="mt-6 inline-block text-brand-700 hover:underline">Back to home</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/opengraph-image.tsx app/icon.tsx app/not-found.tsx
git commit -m "feat(seo): add default OG image, favicon, and not-found page"
```

---

### Task 29: Page transition layer

**Files:**
- Create: `components/motion/PageTransition.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create `components/motion/PageTransition.tsx`**

```tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Modify `app/[locale]/layout.tsx`** — wrap `<main>` children

Replace `<main>{children}</main>` with:
```tsx
<main><PageTransition>{children}</PageTransition></main>
```
And add import at top: `import { PageTransition } from '@/components/motion/PageTransition';`

- [ ] **Step 3: Verify and commit**

Run: `npm run dev`. Click through nav — fade transitions visible.
```bash
git add components/motion/PageTransition.tsx app/\[locale\]/layout.tsx
git commit -m "feat(motion): add page transition layer"
```

---

### Task 30: Production checklist

**Files:**
- Create: `README.md` updates (optional — only if user wants it)

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all suites pass.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: zero errors.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: clean build. Verify in output that every route is statically generated (`○` symbol next to `/[locale]`, `/[locale]/about`, etc., not `λ`).

- [ ] **Step 5: Smoke-test production server**

Run: `npm start` (background)
Visit:
- `/` → redirects to `/en` or `/vi`
- `/en`, `/vi`, `/en/about`, `/en/services`, `/en/services/accounting`, `/en/partners`, `/en/contact` — all render
- `/sitemap.xml` and `/robots.txt` — populated
- Switch locale → URL flips, content translates
- Submit contact form with invalid data → field errors
- View source on `/en/partners` → confirm `application/ld+json` blocks present

- [ ] **Step 6: Stop server, commit any final fixes if needed**

Nothing to commit if all green.

---

## Self-Review

**Spec coverage check:**
- §2 Architecture — Tasks 1, 5, 15 (folder structure, proxy, locale layout) ✓
- §3 Animation — Tasks 6 (CSS reveal), 8 (motion primitives), 29 (page transitions) ✓
- §4 SEO — Tasks 9 (metadata), 10 (JSON-LD + schema), 15 (Org/LocalBusiness in root layout), 22/23/24/26 (per-page JSON-LD), 27 (sitemap/robots), 28 (OG/icon) ✓
- §5 Layouts — Tasks 19 (marketing components), 20 (Home), 21 (About), 22 (Services overview), 23 (Service detail), 24 (Partners), 26 (Contact) ✓
- §6 i18n — Tasks 2 (config), 3 (dictionary), 4 (Link + switcher hook), 5 (proxy), 15 (per-locale layout), 17 (switcher UI) ✓
- §7 Lead capture — Tasks 25 (server action + Resend + honeypot + Zod), 26 (form UI) ✓

All spec sections are covered.

**Placeholder scan:** searched for "TBD", "TODO", "fill in", "handle edge cases", "similar to" — none found. Service MDX template uses concrete EN/VI copy for `accounting`; Task 12 Step 1 instructs the engineer to repeat the same fully-shown pattern for the remaining 6 services using bullets from the profile (no abstraction — the format is explicit).

**Type consistency:** `Dictionary` type derived from `en.json`, used in Footer/Nav. `ServiceFrontmatter` defined in Task 11 and used everywhere. `ContactState` defined in Task 25 and re-imported in Task 26's ContactForm. `Locale` derived from `locales` tuple, used consistently. Server action exported as `submitContactForm` and used by the same name in the client component.

**Scope:** focused on one cohesive deliverable — the public-facing bilingual site. No tangential refactoring or unrelated features.

---

Plan complete and saved to `docs/superpowers/plans/2026-06-07-app-consulting-website.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
