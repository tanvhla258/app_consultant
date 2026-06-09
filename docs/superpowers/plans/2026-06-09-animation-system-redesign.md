# Animation System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken page-transition exit animation and unify all motion components under a consistent Framer Motion `whileInView` + spring system.

**Architecture:** Five small, self-contained file edits — no new files, no structural changes. `PageTransition` switches to `mode="wait"` and drops the exit y-movement. `Reveal` and `FadeIn` switch from mount-time `animate` / CSS to scroll-triggered `whileInView`. `Stagger` gets slower, spring-based timing. CSS scroll rules are removed.

**Tech Stack:** Framer Motion (`motion`, `AnimatePresence`, `whileInView`, `viewport`), Next.js App Router, Tailwind CSS v4.

---

## File Map

| File | Change |
|---|---|
| `components/motion/PageTransition.tsx` | `mode="popLayout"` → `"wait"`, remove `y: -12` from exit |
| `components/motion/Reveal.tsx` | Rewrite plain `<div>` → `motion.div` with `whileInView` |
| `components/motion/FadeIn.tsx` | `animate` → `whileInView` + `viewport`, add spring |
| `components/motion/Stagger.tsx` | `staggerChildren: 0.04` → `0.08`, add `delayChildren: 0.1`, spring |
| `app/globals.css` | Remove `.reveal`, `@keyframes reveal-rise`, and reduced-motion `.reveal` rule |

> **Note on tests:** The Vitest environment is `node` with no jsdom. Existing tests cover only server-side lib utilities. Animation components require a browser to verify — use `npm run dev` and visual inspection as the test for each task.

---

## Task 1: Fix PageTransition exit animation

**Files:**
- Modify: `components/motion/PageTransition.tsx`

- [ ] **Step 1: Open the file and read current state**

Current content of `components/motion/PageTransition.tsx`:
```tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Replace with fixed version**

Write the following to `components/motion/PageTransition.tsx`:
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

Two changes only:
- `mode="popLayout"` → `mode="wait"` — exiting page fully completes before entering page starts
- `exit={{ opacity: 0, y: -12 }}` → `exit={{ opacity: 0 }}` — no y movement on exit

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Navigate between pages (e.g. `/en` → `/en/services` → `/en`). The exit should be a clean fade dissolve with no downward/upward jump. The new page then rises up from `y: 12`.

- [ ] **Step 4: Commit**

```bash
git add components/motion/PageTransition.tsx
git commit -m "fix(PageTransition): mode=wait, fade-only exit — removes ambiguous y jump"
```

---

## Task 2: Rewrite Reveal to Framer Motion whileInView

**Files:**
- Modify: `components/motion/Reveal.tsx`

- [ ] **Step 1: Replace the file**

Current `Reveal.tsx` is a plain `<div>` wrapper with a CSS class. Replace entirely:

```tsx
'use client';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export function Reveal({ className, children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
```

`viewport={{ once: true, amount: 0.2 }}` means: fire once when 20% of the element is visible. `y: 16` gives a subtle upward rise that was previously missing.

- [ ] **Step 2: Verify MethodTimeline renders correctly**

With dev server running, navigate to a page that uses `MethodTimeline` (home page method section). Scroll down to it — each step should fade in with a slight upward rise as it enters the viewport, one by one.

- [ ] **Step 3: Commit**

```bash
git add components/motion/Reveal.tsx
git commit -m "feat(Reveal): rewrite to Framer Motion whileInView with opacity+y rise"
```

---

## Task 3: Update FadeIn to whileInView

**Files:**
- Modify: `components/motion/FadeIn.tsx`

- [ ] **Step 1: Replace the file**

Current `FadeIn.tsx` uses `animate` which only fires on mount. Replace:

```tsx
'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'div'> & { delay?: number };

export function FadeIn({ delay = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Verify FadeIn usage across pages**

`FadeIn` is used in `Hero.tsx` and potentially other marketing components. Check that any `FadeIn`-wrapped content animates correctly on scroll after page navigation. Content that was previously only animating on first load should now animate each time it enters the viewport (but only once per element thanks to `once: true`).

- [ ] **Step 3: Commit**

```bash
git add components/motion/FadeIn.tsx
git commit -m "fix(FadeIn): switch to whileInView so below-fold content animates on scroll"
```

---

## Task 4: Tune Stagger timing and transition

**Files:**
- Modify: `components/motion/Stagger.tsx`

- [ ] **Step 1: Replace the file**

Current `Stagger.tsx` uses 40ms stagger and duration-based easing. Replace with slower spring-based timing:

```tsx
'use client';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function Stagger({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  );
}
```

Changes:
- `staggerChildren: 0.04` → `0.08` (more deliberate word-by-word pacing)
- Added `delayChildren: 0.1` (lets PageTransition fade-in settle first)
- `transition: { duration: 0.35 }` → `type: 'spring', stiffness: 300, damping: 24`

- [ ] **Step 2: Verify Hero title on the home page**

Navigate to `/en`. The Hero `<h1>` words should stagger in with a slightly slower, more deliberate cadence. Each word should feel like it has organic deceleration rather than a linear pop.

- [ ] **Step 3: Commit**

```bash
git add components/motion/Stagger.tsx
git commit -m "feat(Stagger): slower stagger + spring transition for deliberate Hero entrance"
```

---

## Task 5: Remove CSS scroll animation rules

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Remove the three CSS blocks related to .reveal**

Current `app/globals.css` contains these lines (lines 40–54):

```css
@supports (animation-timeline: view()) {
  .reveal {
    animation: reveal-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 30%;
  }
}
@keyframes reveal-rise {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; opacity: 1; transform: none; }
}
```

Replace `app/globals.css` with the version without those blocks:

```css
@import "tailwindcss";

@theme {
  --color-ink-50:  #f6f7f8;
  --color-ink-100: #e8eaed;
  --color-ink-200: #c9ced4;
  --color-ink-400: #6b7280;
  --color-ink-600: #374151;
  --color-ink-700: #1f2937;
  --color-ink-900: #0b1220;

  --color-brand-50:  #fdf8ec;
  --color-brand-100: #f9edcc;
  --color-brand-200: #f3dfa0;
  --color-brand-500: #edc253;
  --color-brand-700: #c9952a;
  --color-brand-900: #000000;

  --color-accent-500: #edc253;

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
```

> Framer Motion respects `prefers-reduced-motion` automatically via its internal `useReducedMotion` hook — no CSS rule needed.

- [ ] **Step 2: Run lint to confirm no errors**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Do a final visual pass**

With dev server running, check:
1. Home page `/en` — Hero words stagger in, method timeline steps reveal on scroll
2. Navigate to a service page — page transition is a clean fade, new page rises in
3. Navigate back — exit is fade-only, no jump
4. Scroll down any page — `Reveal`-wrapped elements rise in as they enter viewport

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "chore(globals): remove CSS reveal animation, replaced by Framer Motion whileInView"
```

---

## Self-Review Notes

- All 5 spec files covered by tasks 1–5 ✓
- No placeholders or TBDs ✓
- `Reveal` type signature uses `HTMLMotionProps<'div'>` which is compatible with existing call sites (only `className` and children are passed) ✓
- `FadeIn` type signature unchanged — `HTMLMotionProps<'div'> & { delay?: number }` ✓
- `prefers-reduced-motion` covered by Framer Motion's built-in behavior ✓
