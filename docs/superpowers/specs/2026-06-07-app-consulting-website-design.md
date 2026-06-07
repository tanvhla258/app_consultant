# APP Consulting — Corporate Profile Website Design

**Date:** 2026-06-07
**Status:** Approved (brainstorm phase)
**Stack:** Next.js 16 (App Router) · React 19 · TailwindCSS v4 · TypeScript

---

## 1. Goals & Constraints

Digitalize APP Consulting's company profile into a premium, fast, bilingual (EN/VI) corporate site that builds trust with multinational corporations and investment funds, and captures qualified leads. The site is content-light, trust-heavy. Founders are ex-Big4/KPMG; the brand must read "institutional, restrained, premium" — not agency-flashy.

**Key constraints**
- Content rarely changes — no CMS.
- Two locales: English and Vietnamese.
- Lead capture must work without a database.
- Maximize SEO surface for high-value consulting keywords (IFRS, transfer pricing, M&A DD, tax compliance — Vietnam/HCMC).
- Premium look without sacrificing Core Web Vitals.

---

## 2. Architecture

### 2.1 Stack decisions
- **Content source:** local Markdown/JSON + i18n files (no CMS).
- **Lead capture:** Server Action → Resend email to the firm.
- **Animation:** Framer Motion (page transitions, hero) + CSS scroll-driven animations (reveals).
- **Hosting target:** Vercel (assumed; edge middleware + static export both work).

### 2.2 Folder structure

```
app/
├── [locale]/                    # 'en' | 'vi' — generateStaticParams
│   ├── layout.tsx               # locale-aware <html lang>, fonts, nav, footer
│   ├── page.tsx                 # Home
│   ├── about/page.tsx
│   ├── services/
│   │   ├── page.tsx             # Services overview
│   │   └── [slug]/page.tsx      # Service detail
│   ├── partners/page.tsx
│   └── contact/page.tsx
├── sitemap.ts
├── robots.ts
├── opengraph-image.tsx          # default OG; per-route overrides allowed
├── icon.tsx
└── not-found.tsx

content/
├── services/{slug}.{en|vi}.mdx
├── partners/{slug}.{en|vi}.mdx
└── site/home.{en|vi}.json       # structured copy used by Home sections

locales/
├── en.json                      # UI strings: nav, CTAs, form labels
└── vi.json

lib/
├── i18n/                        # config, getDictionary, Link wrapper, useSwitchLocale
├── content/                     # MDX loader, frontmatter types, service/partner registries
├── seo/                         # buildMetadata, JSON-LD builders
└── actions/                     # contact-form server action + Resend client

components/
├── ui/                          # Button, Container, Section, Heading — primitives
├── marketing/                   # Hero, ServiceGrid, PartnerCard, MethodTimeline, CTA, StatTile
├── motion/                      # FadeIn, Reveal, Stagger — Framer Motion client islands
└── layout/                      # Nav, Footer, LocaleSwitcher
```

### 2.3 Conventions
- **Server Components by default.** Only `components/motion/*`, form inputs, and the locale switcher are `'use client'`.
- **Middleware** redirects `/` → `/en` or `/vi` based on `NEXT_LOCALE` cookie, then `Accept-Language`.
- **MDX as data:** services/partners load via a typed registry; slugs feed `generateStaticParams`.
- **Server Action** in `lib/actions/contact.ts` validates with Zod, calls Resend, returns typed result to a client form.

> **Implementation note (per `AGENTS.md`):** Next.js 16 has breaking changes from prior versions. Before writing code, consult `node_modules/next/dist/docs/` for current App Router, metadata, middleware, and Server Action APIs.

---

## 3. Animation Strategy

**Principle:** motion communicates quality, never demands attention. Subtle, fast (200–400ms), eased, respects `prefers-reduced-motion`.

### 3.1 Layers
1. **Page transitions (Framer Motion).** Soft fade + 8px upward translate on route change via `AnimatePresence` in the locale layout. ~250ms ease-out.
2. **Scroll reveals (CSS, zero JS).** `animation-timeline: view()` on section headings and cards. Fade + 16px rise on viewport entry. Graceful fallback on older browsers.
3. **Micro-interactions (Tailwind + Framer).**
   - Buttons: 150ms background + subtle shadow lift on hover, scale 0.98 on press.
   - Service cards: border-color shift, icon nudges 2px, underline grows from left.
   - Nav: animated underline on active link; locale switcher cross-fades label.
   - Form fields: floating labels, focus ring eases in, inline validation slides in (no layout shift).
4. **Hero signature moment (Framer).** Stagger-in of the headline (word-by-word, 40ms stagger) + slow parallax on a background accent shape. No particles, no autoplay video.

### 3.2 Reusable primitives (`components/motion/`)
- `<FadeIn delay?>` — Framer wrapper for client-side reveals.
- `<Reveal>` — CSS-only scroll-driven wrapper.
- `<Stagger>` — orchestrates child delays for lists.

### 3.3 Performance
Framer Motion is lazy-loaded; only mounted in client islands. Reduced-motion users get instant fades only.

---

## 4. SEO Architecture

### 4.1 Rendering
- **100% SSG** at build via `generateStaticParams` for `[locale]` and `[slug]`. No SSR needed.
- Edge runtime for middleware (locale detect/redirect).
- ISR reserved for a future insights/blog section.

### 4.2 Metadata API
- Central `lib/seo/metadata.ts` exposes `buildMetadata({ locale, path, title, description, image })`.
- Every page exports `generateMetadata()` calling it.
- Output includes: title template (`%s | APP Consulting`), description, OG image, Twitter card, canonical URL, `alternates.languages` (hreflang for EN/VI counterparts).
- `metadataBase` set to production URL.

### 4.3 Structured data (JSON-LD)
Injected via a `<JsonLd>` server component:
- **Root layout:** `Organization` + `LocalBusiness` (HCMC address, phone, hours, `sameAs`).
- **Home:** `WebSite`.
- **Partners pages:** `Person` per partner with `jobTitle`, `worksFor`, credentials (`hasCredential` for ACCA/VACPA), `alumniOf` (KPMG, etc.).
- **Service detail:** `Service` with `provider`, `areaServed: Vietnam`, `serviceType`.
- **Contact:** `ContactPage` + `LocalBusiness`.
- **Breadcrumbs:** `BreadcrumbList` on all non-home pages.

### 4.4 Technical foundation
- `app/sitemap.ts` — dynamic, both locales × all routes, with `xhtml:link rel="alternate"` per pair.
- `app/robots.ts` — allow all, point to sitemap.
- `app/icon.tsx`, `app/apple-icon.tsx`, dynamic `app/opengraph-image.tsx` via `ImageResponse`.
- `<html lang={locale}>` in `[locale]/layout.tsx`.

### 4.5 Core Web Vitals plan
- **LCP:** hero image as `next/image` with `priority`; primary font via `next/font`, Vietnamese subset, `display: swap`.
- **CLS:** explicit image dimensions; reserved space for reveals (transforms only).
- **INP:** Framer Motion lazy-loaded; marketing pages have no critical-path client JS.
- **Bundle:** client islands restricted to `motion/`, contact form, locale switcher.

### 4.6 Keyword shape (informs IA)
- Service detail pages target high-intent queries: "IFRS conversion Vietnam", "transfer pricing documentation HCMC", "tax due diligence Vietnam", "M&A advisory Ho Chi Minh".
- Partner pages target branded + credential queries (ex-KPMG, ACCA).
- Bilingual indexable surface = ~2× routes; hreflang disambiguates.

---

## 5. UI/UX Layout

### 5.1 Global shell
- **Nav (sticky, translucent on scroll):** Logo · Services · About · Partners · Contact · `EN/VI` switcher · "Book a Consultation" primary CTA.
- **Footer:** 4 columns — Company blurb, Services links, Office (address + map link), Contact (phone, email, LinkedIn). Bottom strip: credentials (ACCA, VACPA) + © + locale switcher.

### 5.2 Home (`/[locale]`)
1. **Hero** — eyebrow ("Ex-Big4 Advisors · HCMC"), H1 "Your Vision. Our Mission." (word-stagger), 2-line sub, primary + secondary CTAs, trust strip (KPMG · ACCA · VACPA · 20+ yrs).
2. **Services grid** — 7 cards: Accounting, Tax, Financial Advisory, Training, Business Advisory, M&A, Transfer Pricing.
3. **Why APP (split)** — narrative left; 4 stat tiles right (20+ yrs, 3 Big4 partners, 90+ clients, 13 industries).
4. **Our Method** — 6-step horizontal timeline with scroll-driven progress fill.
5. **Partners preview** — 3 cards → `/partners`.
6. **Industries strip** — 13 sectors as chips; marquee on mobile.
7. **Final CTA.**

### 5.3 About (`/[locale]/about`)
- Hero with mission + slogan (no image).
- Two-column narrative: company story + Vision/Mission cards.
- Three core-value cards.
- Full 6-step method: vertical timeline desktop, accordion mobile.
- CTA strip.

### 5.4 Services (`/[locale]/services`)
- Hero.
- 7 anchored sections (one per category): left = number + name + intro; right = offerings list (from MDX frontmatter); "Discuss this service →" prefills Contact with `?service=`.
- Sticky side-rail TOC on desktop, jump anchors with smooth scroll.

### 5.5 Service detail (`/[locale]/services/[slug]`)
- Hero with service name + 2-line promise + "Talk to a partner" CTA.
- Overview (MDX body).
- "What we deliver" checklist.
- "Who it's for" — industry chips.
- 3–5 step service-scoped mini-timeline.
- Related services (2 cards).
- CTA.

### 5.6 Partners (`/[locale]/partners`)
- Hero: "Led by ex-Big4 partners."
- 3 partner cards, alternating layout: photo + name, role, credentials badges, 3-paragraph bio, notable engagements chips (Novaland, Masan, Dragon Capital…), contact buttons (email, mobile).
- Credentials strip at bottom.

### 5.7 Contact (`/[locale]/contact`)
- Two-column.
  - **Left form:** Name, Company, Email, Phone, Service interest (select, prefillable via `?service=`), Message. Zod validation, inline errors, in-place success state.
  - **Right office card:** address, static map image, phone, email, business hours, partner direct contacts.
- FAQ accordion below (3–5 items: pricing model, languages, engagement process, NDA, response time).

### 5.8 Mobile
- Sticky nav collapses to hamburger + sticky bottom CTA bar.
- Services grid → vertical stack.
- Method timeline → vertical stepper.
- Partner cards → single column, photo above bio.

---

## 6. i18n Strategy

### 6.1 URL shape
- Every page under `/[locale]/...` where `locale ∈ {'en', 'vi'}`.
- **No translated slugs** — paths stay English for both locales (e.g., `/vi/services/transfer-pricing`). Tradeoff: slightly less VI keyword density vs. dramatically simpler routing, registry, and cross-locale linking. Acceptable for a B2B audience that reads English business terms.
- Root `/` middleware-redirects based on `NEXT_LOCALE` cookie, falling back to `Accept-Language`.

### 6.2 Static generation
- `[locale]/layout.tsx` → `generateStaticParams` returns `[{ locale: 'en' }, { locale: 'vi' }]`.
- `[locale]/services/[slug]/page.tsx` → cross-product of locales × service slugs.
- Every page built as static HTML per locale.

### 6.3 Dictionary loading (UI strings)
- `locales/en.json`, `locales/vi.json` — namespaced keys (`nav.services`, `cta.bookConsultation`, `form.errors.email`).
- `lib/i18n/get-dictionary.ts`:

  ```ts
  const dictionaries = {
    en: () => import('@/locales/en.json').then(m => m.default),
    vi: () => import('@/locales/vi.json').then(m => m.default),
  } as const;
  export const getDictionary = (locale: Locale) => dictionaries[locale]();
  ```
- Server Components call `await getDictionary(locale)` and pass strings down. No client i18n runtime, no bundle cost.

### 6.4 Long-form content (MDX)
- One file per locale: `content/services/accounting.en.mdx`, `accounting.vi.mdx`.
- `lib/content/services.ts` exposes `getService(slug, locale)` — typed registry with frontmatter (`title`, `summary`, `bullets[]`, `order`).
- Missing translation falls back to EN and logs a build warning.

### 6.5 Locale switcher UX
- In nav: `EN | VI` toggle (no flags).
- Switching preserves the current path via `useSwitchLocale()` that swaps the first segment of `usePathname()`.
- Sets `NEXT_LOCALE` cookie.
- Smooth label cross-fade.

### 6.6 Typed locale
- `lib/i18n/config.ts`:

  ```ts
  export const locales = ['en', 'vi'] as const;
  export type Locale = typeof locales[number];
  ```
- A `<Link>` wrapper in `lib/i18n/link.tsx` auto-prefixes the current locale.

### 6.7 Fonts
- One typeface with Latin Extended + Vietnamese subset (candidate: Inter, Manrope, or Fraunces for a more premium tone). Loaded via `next/font`, `display: swap`, preloaded only on routes that use it.

### 6.8 SEO crosslinks
- `alternates.languages` in every page's metadata.
- `hreflang` entries per URL pair in `sitemap.xml`.
- `<html lang={locale}>` on root.

### 6.9 Explicitly out of scope
- No `next-intl` / `next-i18next`.
- No translated URL slugs.
- No runtime locale detection inside rendered pages.

---

## 7. Lead-capture flow

1. User submits contact form (client component).
2. Server Action `submitContactForm` validates with Zod.
3. On success → Resend API sends styled email to the firm's inbox; returns `{ ok: true }`.
4. Client renders inline success state; form is not unmounted.
5. On validation failure → return field-level errors; form preserves input.
6. Spam: honeypot field + minimum-time-on-page check. No third-party captcha unless abuse appears.

Environment variables required: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

---

## 8. Out of scope (this iteration)

- CMS integration.
- Insights / blog routes (architecture is ready to add later as an ISR section).
- Authenticated client portal.
- Search.
- Analytics platform selection (assume Vercel Analytics + a privacy-friendly tool TBD by user).
- Final brand color tokens — placeholders only; user will swap theme later.

---

## 9. Open items for the implementation plan

- Choose primary typeface (Inter vs. Manrope vs. Fraunces — driven by final brand direction).
- Decide on optional Insights section now vs. later.
- Confirm production domain for `metadataBase`.
- Confirm whether the firm wants partner direct emails publicly listed or routed through the form.
