# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (Next.js with Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

Run a single test file: `npx vitest run tests/path/to/file.test.ts`

## Environment Variables

Copy `.env.example` to `.env.local`. Required for contact form:
- `RESEND_API_KEY` — Resend API key
- `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` — sender/recipient addresses
- `NEXT_PUBLIC_SITE_URL` — canonical base URL (default: `http://localhost:3000`)

## Architecture

### Routing & i18n

All pages live under `app/[locale]/`. The locale segment is always `en` or `vi` (defined in `lib/i18n/config.ts`). `app/layout.tsx` is a passthrough shell; `app/[locale]/layout.tsx` is the real root that attaches fonts, JSON-LD, Nav, and Footer.

There is no Next.js middleware for locale redirects. The root path (`/`) is not handled — URLs must include the locale prefix (e.g. `/en`, `/vi/services`).

Translation strings come from two sources:
1. **`locales/en.json` / `locales/vi.json`** — UI strings (nav labels, button text, shared copy). Loaded via `getDictionary(locale)` from `lib/i18n/get-dictionary.ts`.
2. **`content/home/en.json` / `content/home/vi.json`** — Home page section data (hero, stats, method steps, industries, finalCta). Imported directly in `app/[locale]/page.tsx`.

### Content (MDX)

Services and partners are authored as bilingual MDX files in `content/`:
- `content/services/{slug}.{en|vi}.mdx`
- `content/partners/{slug}.{en|vi}.mdx`

Each file has YAML frontmatter typed in `lib/content/types.ts`. `lib/content/mdx.ts` provides three server-only utilities: `readMdx` (parse frontmatter + raw body), `renderMdx` (compile to RSC), and `listSlugs` (enumerate slugs from the directory). If a locale file is missing, `readMdx` falls back to `en`.

`lib/content/services.ts` and `lib/content/partners.ts` are thin wrappers that call these utilities and sort by the `order` frontmatter field.

### SEO

- `lib/seo/metadata.ts` — `buildMetadata()` generates `Metadata` objects with canonical URL, hreflang alternates, OG, and Twitter card.
- `lib/seo/schema.ts` — `organization()` and `localBusiness()` return schema-dts typed JSON-LD objects.
- `lib/seo/jsonld.tsx` — `<JsonLd>` injects a `<script type="application/ld+json">` tag.
- `app/[locale]/services/[slug]/page.tsx` and `partners/page.tsx` add page-level JSON-LD (Service / Person schemas).

### Motion

Framer Motion wrappers in `components/motion/`:
- `FadeIn` — simple opacity fade
- `Reveal` — fade-in with upward translate on scroll into view
- `Stagger` — wraps children with staggered entrance
- `PageTransition` — wraps `<main>` content for route-level fade

### Contact Form

`lib/actions/contact.ts` is a Server Action (`'use server'`) that validates with Zod, checks a honeypot field, then sends via Resend. The form component `components/marketing/ContactForm.tsx` uses React's `useActionState` to manage optimistic state.

### Testing

Vitest runs in `node` environment. `server-only` is mocked in `tests/__mocks__/server-only.ts` so content utilities can be imported in tests. Path alias `@` maps to the project root.
