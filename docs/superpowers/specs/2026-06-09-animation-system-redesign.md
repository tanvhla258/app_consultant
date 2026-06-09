# Animation System Redesign

**Date:** 2026-06-09  
**Status:** Approved

## Problem

All animations feel broken on page navigation. Specifically:
- Exiting pages jerk downward slightly before disappearing — caused by `y: -12` on exit and `mode="popLayout"` making both pages animate simultaneously
- `Reveal` component only animates opacity (no translate), making scroll reveals feel flat
- `FadeIn` fires on mount, not on scroll — misses below-fold content
- `Stagger` interval (40ms) is too fast, feels mechanical
- Mixed animation approach: CSS `animation-timeline` in `Reveal` vs Framer Motion everywhere else

## Goals

- Fix the ambiguous exit animation so navigation feels clean and intentional
- Unify all scroll animations under Framer Motion `whileInView`
- Make the Hero entrance feel layered and deliberate
- Maintain `prefers-reduced-motion` support

## Design

### 1. PageTransition

**File:** `components/motion/PageTransition.tsx`

Two changes:
- `mode="popLayout"` → `mode="wait"` so the exiting page completes before the entering page starts
- Remove `y: -12` from exit — exit is opacity fade only

```tsx
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
```

**Why `mode="wait"`:** `popLayout` is designed for list items removed from the DOM. For route-level transitions, `wait` ensures sequential enter/exit — the old page dissolves, then the new page rises in. No overlap, no ambiguity.

### 2. Reveal Component

**File:** `components/motion/Reveal.tsx`

Convert from a plain `<div>` with a CSS class to a Framer Motion `whileInView` component. Adds the missing translate so reveals have both opacity and upward rise.

```tsx
'use client';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export function Reveal({ className, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={className}
      {...rest}
    />
  );
}
```

**Why spring:** `type: 'spring'` with `stiffness: 300, damping: 24` produces organic deceleration that feels more premium than a linear easing curve. No visible bounce at these values.

### 3. FadeIn Component

**File:** `components/motion/FadeIn.tsx`

Switch from `animate` (fires on mount only) to `whileInView` so it works for below-fold content on navigated pages.

```tsx
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

### 4. Stagger Component

**File:** `components/motion/Stagger.tsx`

Slower stagger interval + `delayChildren` to let the `PageTransition` fade-in settle before words appear. Spring transition replaces duration-based easing.

```tsx
const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.08 }
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
```

### 5. CSS Cleanup

**File:** `app/globals.css`

Remove the `.reveal` class and `@keyframes reveal-rise` — replaced by Framer Motion in `Reveal.tsx`. Keep the `prefers-reduced-motion` block and extend it to cover Framer Motion's global motion preference (Framer Motion respects this automatically via `useReducedMotion`).

## Files Changed

| File | Change |
|---|---|
| `components/motion/PageTransition.tsx` | `mode="wait"`, remove exit y |
| `components/motion/Reveal.tsx` | Rewrite to Framer Motion whileInView |
| `components/motion/FadeIn.tsx` | Switch animate → whileInView |
| `components/motion/Stagger.tsx` | Tune stagger timing + spring transition |
| `app/globals.css` | Remove .reveal + @keyframes reveal-rise |

## Out of Scope

- Hover animations on `ServiceCard` (already working)
- Directional page transitions (left/right based on nav history)
- Any new animation components
