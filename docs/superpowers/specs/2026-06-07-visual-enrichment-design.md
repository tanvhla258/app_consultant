# Visual Enrichment — Icons & Images

**Date:** 2026-06-07  
**Status:** Approved

## Goal

Add icons and placeholder images across the full site so every section has visual weight. Placeholder files are drop-in swappable — no code changes needed to add real images later.

---

## Dependencies

- Install `lucide-react` (tree-shakeable, line-style icons)
- No new image CDN or remote domain config needed — all images are local `/public/` files

---

## Placeholder Image Files

Three SVG files added to `/public/images/`:

| File | Usage | Dimensions |
|---|---|---|
| `hero-placeholder.svg` | Hero background | 1920×1080 proportions, gray gradient |
| `service-banner-placeholder.svg` | Service detail banner | 16:5 aspect, gray gradient |
| `partner-placeholder.svg` | Partner card portrait | 4:5 aspect, gray gradient |

Swapping real images = replacing the file. No code changes required for hero/service banner. Partner images are also swappable via MDX frontmatter.

---

## Icons

### Nav
- Add `BarChart3` (16px) before "APP Consulting" wordmark
- Color: `text-ink-900`

### ServiceCard
- Add `icon: React.ComponentType<{ size?: number; className?: string }>` prop
- Icon renders above the service number, 24px, `text-brand-700`
- Slug-to-icon mapping lives in `ServiceGrid` (not in `ServiceCard`):

| Slug | Icon |
|---|---|
| `accounting` | `Calculator` |
| `business-advisory` | `Briefcase` |
| `financial-advisory` | `TrendingUp` |
| `m-and-a` | `Handshake` |
| `tax` | `FileText` |
| `training` | `GraduationCap` |
| `transfer-pricing` | `Globe` |

### MethodTimeline
- Add icon above each numbered circle, mapped by step index internally (no prop change)
- Icons by index: `Search`, `Target`, `Zap`, `CheckCircle`, `Package`, `RefreshCw`
- Icon size: 20px, `text-brand-700`

### IndustriesStrip
- Prepend `Building2` (12px) to every pill — no prop change, hardcoded internally
- Color: `text-ink-400`

### StatTile
- Add optional `icon?: React.ComponentType<{ size?: number; className?: string }>` prop
- Renders above the stat value, 20px, `text-brand-700`
- No existing call sites break — prop is optional

### Service Detail — "What we deliver" list
- Replace `✓ ` text with `CheckCircle2` icon (16px, `text-accent-500`, inline-flex aligned)

### FinalCta button
- Replace text `→` arrow with Lucide `ArrowRight` icon (16px) inside the Button

---

## Images

### Hero
- Add optional `imageSrc?: string` prop (default: `/images/hero-placeholder.svg`)
- `next/image` with `fill` + `object-cover` as absolute background layer
- `bg-ink-900/50` overlay div ensures text contrast
- Remove existing blurred circle blob (`aria-hidden` gradient div) — superseded
- `heroImage` field added to `content/home/en.json` and `content/home/vi.json`

### PartnerCard
- Replace existing gray `aspect-[4/5]` div with `next/image`
- `src`: `partner.image ?? '/images/partner-placeholder.svg'`
- Add `image?: string` to `PartnerFrontmatter` in `lib/content/types.ts`
- Existing partner MDX files unchanged — field is optional, fallback handles it

### Service Detail Page
- Add full-bleed banner image between the header section and prose body
- Height: `h-64 md:h-96`, `next/image` with `object-cover`
- `src`: `doc.frontmatter.image ?? '/images/service-banner-placeholder.svg'`
- Add `image?: string` to `ServiceFrontmatter` in `lib/content/types.ts`
- Existing service MDX files unchanged — field is optional

---

## What Does NOT Change

- All existing MDX frontmatter files — no required fields added
- `next.config` — no remote image domains needed
- Routing, i18n, SEO metadata — untouched
- Motion/animation components — untouched
