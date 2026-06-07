# Visual Enrichment — Icons & Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lucide-react icons and placeholder `next/image` images across every page section so the site has visual weight, with placeholders that swap to real images by replacing a single file.

**Architecture:** Install `lucide-react`, create 3 SVG placeholder files in `/public/images/`, then update each component individually — icons are hardcoded in components (no CMS coupling), images flow through optional props with `/images/*-placeholder.svg` defaults.

**Tech Stack:** Next.js 16, lucide-react, `next/image`, Tailwind CSS, TypeScript

---

### Task 1: Install lucide-react and create placeholder SVG files

**Files:**
- Modify: `package.json` (via npm install)
- Create: `public/images/hero-placeholder.svg`
- Create: `public/images/service-banner-placeholder.svg`
- Create: `public/images/partner-placeholder.svg`

- [ ] **Step 1: Install lucide-react**

```bash
npm install lucide-react
```

Expected: `lucide-react` appears in `package.json` dependencies, `node_modules/lucide-react` exists.

- [ ] **Step 2: Create the images directory**

```bash
mkdir -p public/images
```

- [ ] **Step 3: Create hero-placeholder.svg**

Write this to `public/images/hero-placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d1d5db"/>
      <stop offset="100%" stop-color="#9ca3af"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#g)"/>
</svg>
```

- [ ] **Step 4: Create service-banner-placeholder.svg**

Write this to `public/images/service-banner-placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d1d5db"/>
      <stop offset="100%" stop-color="#9ca3af"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="500" fill="url(#g)"/>
</svg>
```

- [ ] **Step 5: Create partner-placeholder.svg**

Write this to `public/images/partner-placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d1d5db"/>
      <stop offset="100%" stop-color="#9ca3af"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#g)"/>
</svg>
```

- [ ] **Step 6: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json public/images/
git commit -m "feat: install lucide-react and add placeholder SVG images"
```

---

### Task 2: Add optional image field to content types

**Files:**
- Modify: `lib/content/types.ts`

- [ ] **Step 1: Update types.ts**

Replace the entire file content of `lib/content/types.ts` with:

```ts
export type ServiceFrontmatter = {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  order: number;
  image?: string;
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
  image?: string;
};
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat: add optional image field to ServiceFrontmatter and PartnerFrontmatter"
```

---

### Task 3: Add heroImage to home content JSON + wire Hero call

**Files:**
- Modify: `content/home/en.json`
- Modify: `content/home/vi.json`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Add heroImage to en.json**

In `content/home/en.json`, update the `"hero"` object to add `"heroImage"`:

```json
"hero": {
  "eyebrow": "Ex-Big4 Advisors · Ho Chi Minh City",
  "title": "Your Vision. Our Mission.",
  "subtitle": "Accounting, tax, and advisory services for multinationals, investment funds, and ambitious Vietnamese businesses.",
  "primaryCta": "Book a Consultation",
  "secondaryCta": "Explore Services",
  "trust": ["Ex-KPMG", "ACCA", "VACPA", "20+ years"],
  "heroImage": "/images/hero-placeholder.svg"
}
```

- [ ] **Step 2: Add heroImage to vi.json**

In `content/home/vi.json`, update the `"hero"` object to add `"heroImage"`:

```json
"hero": {
  "eyebrow": "Cố vấn từ Big4 · TP. Hồ Chí Minh",
  "title": "Tầm Nhìn Của Bạn. Sứ Mệnh Của Chúng Tôi.",
  "subtitle": "Dịch vụ kế toán, thuế và tư vấn cho tập đoàn đa quốc gia, quỹ đầu tư và doanh nghiệp Việt Nam đầy tham vọng.",
  "primaryCta": "Đặt lịch tư vấn",
  "secondaryCta": "Khám phá dịch vụ",
  "trust": ["Cựu KPMG", "ACCA", "VACPA", "20+ năm"],
  "heroImage": "/images/hero-placeholder.svg"
}
```

- [ ] **Step 3: Update Hero call in app/[locale]/page.tsx**

Find the `<Hero ... />` call in `app/[locale]/page.tsx` and add `imageSrc`:

```tsx
<Hero
  eyebrow={home.hero.eyebrow}
  title={home.hero.title}
  subtitle={home.hero.subtitle}
  primaryCta={{ label: home.hero.primaryCta, href: '/contact' }}
  secondaryCta={{ label: home.hero.secondaryCta, href: '/services' }}
  trust={home.hero.trust}
  imageSrc={home.hero.heroImage}
/>
```

- [ ] **Step 4: Verify lint passes**

```bash
npm run lint
```

Expected: no errors. (The Hero component doesn't accept `imageSrc` yet — that's Task 4. TypeScript will error until then. If running lint before Task 4, expect a type error on `imageSrc`. Proceed to Task 4 immediately.)

- [ ] **Step 5: Commit**

```bash
git add content/home/en.json content/home/vi.json app/\[locale\]/page.tsx
git commit -m "feat: add heroImage to home content and wire up Hero imageSrc prop"
```

---

### Task 4: Hero — full-width background image

**Files:**
- Modify: `components/marketing/Hero.tsx`

- [ ] **Step 1: Replace Hero.tsx entirely**

Write this to `components/marketing/Hero.tsx`:

```tsx
import Image from 'next/image';
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
  imageSrc?: string;
};

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  trust,
  imageSrc = '/images/hero-placeholder.svg',
}: Props) {
  const words = title.split(' ');
  return (
    <section className="relative overflow-hidden bg-ink-900 pt-20 pb-24 md:pt-28 md:pb-32">
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover opacity-60"
        priority
        aria-hidden
      />
      <div className="absolute inset-0 bg-ink-900/50" aria-hidden />
      <Container className="relative z-10">
        <span className="text-xs uppercase tracking-[0.2em] text-brand-300">{eyebrow}</span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.1] text-ink-50 md:text-7xl">
          <Stagger>
            {words.map((w, i) => (
              <span key={i} className="mr-3 inline-block">{w}</span>
            ))}
          </Stagger>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-200">{subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={primaryCta.href}>{primaryCta.label}</Button>
          <Button href={secondaryCta.href} variant="secondary">{secondaryCta.label}</Button>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-300">
          {trust.map(t => (
            <li key={t} className={cn('flex items-center gap-2')}>
              <span className="h-1 w-1 rounded-full bg-accent-500" />
              {t}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/marketing/Hero.tsx
git commit -m "feat(Hero): add full-width background image with dark overlay"
```

---

### Task 5: ServiceCard icon prop + ServiceGrid slug mapping

**Files:**
- Modify: `components/marketing/ServiceCard.tsx`
- Modify: `components/marketing/ServiceGrid.tsx`

- [ ] **Step 1: Update ServiceCard.tsx**

Replace `components/marketing/ServiceCard.tsx` entirely:

```tsx
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/lib/i18n/link';
import { cn } from '@/lib/cn';

export function ServiceCard({
  number, title, summary, href, icon: Icon,
}: {
  number: number;
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className={cn(
      'group flex flex-col justify-between rounded-2xl border border-ink-200 bg-ink-50 p-8 transition-all duration-200',
      'hover:border-ink-900 hover:shadow-md',
    )}>
      <div>
        <Icon size={24} className="text-brand-700" />
        <div className="mt-3 text-xs font-mono text-ink-400">{String(number).padStart(2, '0')}</div>
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

- [ ] **Step 2: Update ServiceGrid.tsx**

Replace `components/marketing/ServiceGrid.tsx` entirely:

```tsx
import { Calculator, Briefcase, TrendingUp, Handshake, FileText, GraduationCap, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { ServiceCard } from './ServiceCard';
import { getAllServices } from '@/lib/content/services';
import { Reveal } from '@/components/motion/Reveal';
import type { Locale } from '@/lib/i18n/config';

const SLUG_ICONS: Record<string, LucideIcon> = {
  'accounting': Calculator,
  'business-advisory': Briefcase,
  'financial-advisory': TrendingUp,
  'm-and-a': Handshake,
  'tax': FileText,
  'training': GraduationCap,
  'transfer-pricing': Globe,
};

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
                icon={SLUG_ICONS[s.frontmatter.slug] ?? Briefcase}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/ServiceCard.tsx components/marketing/ServiceGrid.tsx
git commit -m "feat(ServiceCard): add lucide icon per service with slug-based mapping"
```

---

### Task 6: MethodTimeline — add icons above step numbers

**Files:**
- Modify: `components/marketing/MethodTimeline.tsx`

- [ ] **Step 1: Replace MethodTimeline.tsx entirely**

```tsx
import { Search, Target, Zap, CheckCircle, Package, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

const STEP_ICONS: LucideIcon[] = [Search, Target, Zap, CheckCircle, Package, RefreshCw];

export function MethodTimeline({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="relative grid gap-8 md:grid-cols-3 lg:grid-cols-6">
      <div className="pointer-events-none absolute left-0 top-6 hidden h-px w-full bg-ink-200 lg:block" aria-hidden />
      {steps.map((step, i) => {
        const StepIcon = STEP_ICONS[i] ?? Search;
        return (
          <Reveal key={step.title} className="relative">
            <StepIcon size={20} className="mb-3 text-brand-700" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-900 bg-ink-50 font-mono text-sm">
              {String(i + 1).padStart(2, '0')}
            </div>
            <h4 className="mt-4 font-medium text-ink-900">{step.title}</h4>
            <p className="mt-1 text-sm text-ink-600">{step.body}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/marketing/MethodTimeline.tsx
git commit -m "feat(MethodTimeline): add lucide icons above each step number"
```

---

### Task 7: IndustriesStrip — add Building2 icon to pills

**Files:**
- Modify: `components/marketing/IndustriesStrip.tsx`

- [ ] **Step 1: Replace IndustriesStrip.tsx entirely**

```tsx
import { Building2 } from 'lucide-react';

export function IndustriesStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(item => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600"
        >
          <Building2 size={12} className="text-ink-400" />
          {item}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/marketing/IndustriesStrip.tsx
git commit -m "feat(IndustriesStrip): add Building2 icon to each industry pill"
```

---

### Task 8: StatTile icon prop + pass icons from home page

**Files:**
- Modify: `components/marketing/StatTile.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace StatTile.tsx entirely**

```tsx
import type { LucideIcon } from 'lucide-react';

export function StatTile({ value, label, icon: Icon }: {
  value: string;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
      {Icon && <Icon size={20} className="mb-3 text-brand-700" />}
      <div className="font-serif text-4xl text-ink-900">{value}</div>
      <div className="mt-2 text-sm text-ink-400">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Update the stats block in app/[locale]/page.tsx**

Add these imports near the top of `app/[locale]/page.tsx`, after the existing imports:

```tsx
import { Clock, Users, Award, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
```

Add this constant inside the `Home` component function body, before the `return` statement:

```tsx
const STAT_ICONS: LucideIcon[] = [Clock, Users, Award, Building2];
```

Then find the `home.stats.map` block and replace it:

```tsx
{home.stats.map((s, i) => (
  <Reveal key={s.label}>
    <StatTile value={s.value} label={s.label} icon={STAT_ICONS[i]} />
  </Reveal>
))}
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/marketing/StatTile.tsx app/\[locale\]/page.tsx
git commit -m "feat(StatTile): add optional icon prop; pass stat icons from home page"
```

---

### Task 9: FinalCta — ArrowRight icon on button

**Files:**
- Modify: `components/marketing/FinalCta.tsx`

- [ ] **Step 1: Replace FinalCta.tsx entirely**

```tsx
import { ArrowRight } from 'lucide-react';
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
        <Button href="/contact" variant="primary">
          {ctaLabel}
          <ArrowRight size={16} />
        </Button>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/marketing/FinalCta.tsx
git commit -m "feat(FinalCta): add ArrowRight icon to CTA button"
```

---

### Task 10: PartnerCard — replace gray div with next/image

**Files:**
- Modify: `components/marketing/PartnerCard.tsx`

- [ ] **Step 1: Replace PartnerCard.tsx entirely**

```tsx
import Image from 'next/image';
import type { PartnerFrontmatter } from '@/lib/content/types';
import { Link } from '@/lib/i18n/link';

export function PartnerCard({ partner }: { partner: PartnerFrontmatter }) {
  return (
    <Link href={`/partners#${partner.slug}`} className="block rounded-2xl border border-ink-200 bg-ink-50 p-6 transition-all hover:border-ink-900">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-100">
        <Image
          src={partner.image ?? '/images/partner-placeholder.svg'}
          alt={partner.name}
          fill
          className="object-cover"
        />
      </div>
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

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/marketing/PartnerCard.tsx
git commit -m "feat(PartnerCard): replace gray placeholder div with next/image"
```

---

### Task 11: Service detail page — banner image + CheckCircle2 in delivers

**Files:**
- Modify: `app/[locale]/services/[slug]/page.tsx`

- [ ] **Step 1: Add imports at the top of the service detail page**

At the top of `app/[locale]/services/[slug]/page.tsx`, add these two imports after the existing import block:

```tsx
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
```

- [ ] **Step 2: Add the banner image section**

Find this block in `app/[locale]/services/[slug]/page.tsx`:

```tsx
      <Button href={`/contact?service=${slug}`} className="mt-10">{d.common.discuss}</Button>
        </Container>
      </section>

      <Container className="prose prose-ink max-w-3xl py-12 text-ink-600">
```

Replace it with:

```tsx
      <Button href={`/contact?service=${slug}`} className="mt-10">{d.common.discuss}</Button>
        </Container>
      </section>

      <div className="relative h-64 w-full overflow-hidden md:h-96">
        <Image
          src={doc.frontmatter.image ?? '/images/service-banner-placeholder.svg'}
          alt={doc.frontmatter.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <Container className="prose prose-ink max-w-3xl py-12 text-ink-600">
```

- [ ] **Step 3: Update the delivers list to use CheckCircle2**

Find this block:

```tsx
              <li key={item} className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-ink-600">
                  <span className="text-accent-500">✓ </span>{item}
                </li>
```

Replace it with:

```tsx
              <li key={item} className="flex items-start gap-2 rounded-xl border border-ink-200 bg-ink-50 p-4 text-ink-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent-500" />
                  {item}
                </li>
```

- [ ] **Step 4: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/\[locale\]/services/\[slug\]/page.tsx
git commit -m "feat(ServiceDetail): add banner image and CheckCircle2 in delivers list"
```

---

### Task 12: Nav — add BarChart3 icon to wordmark

**Files:**
- Modify: `components/layout/Nav.tsx`

- [ ] **Step 1: Update Nav.tsx**

Add the `BarChart3` import and update the wordmark link. Find this in `components/layout/Nav.tsx`:

```tsx
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';
```

Replace with:

```tsx
import { BarChart3 } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Link } from '@/lib/i18n/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LocaleSwitcher } from './LocaleSwitcher';
import type { Locale } from '@/lib/i18n/config';
```

Then find:

```tsx
        <Link href="/" className="font-serif text-xl text-ink-900">APP Consulting</Link>
```

Replace with:

```tsx
        <Link href="/" className="flex items-center gap-2 font-serif text-xl text-ink-900">
          <BarChart3 size={16} aria-hidden />
          APP Consulting
        </Link>
```

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Final build check**

```bash
npm run build
```

Expected: build completes with no TypeScript errors. Note: build may show warnings about `next/image` with SVGs — these are warnings only, not errors.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Nav.tsx
git commit -m "feat(Nav): add BarChart3 icon to wordmark"
```
