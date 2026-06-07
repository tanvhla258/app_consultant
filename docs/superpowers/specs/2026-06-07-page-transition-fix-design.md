# Page Transition Fix — Design Spec

**Date:** 2026-06-07
**Status:** Approved

## Problem

Navigating between pages shows a jarring "jump down" after the exit animation. The root cause is two compounding issues in the current `PageTransition` component:

1. `AnimatePresence mode="wait"` creates a sequential gap — exit finishes, container briefly collapses to zero height, then the entering content appears.
2. The exit moves content upward (`y: -8`) and the enter starts below (`y: 8`). This directional reversal (up → down) makes the jump visually jarring.

## Solution

Switch `AnimatePresence` to `mode="popLayout"`. This mode absolutely positions the *exiting* element for the duration of its animation so it does not affect layout flow. The result:

- Container height is immediately determined by the *entering* content — no collapse gap.
- Exit and enter animate simultaneously rather than sequentially.
- Both exit and enter move in the same upward direction, eliminating the reversal.

## Changes

### `components/motion/PageTransition.tsx`

- `mode="wait"` → `mode="popLayout"`
- Y offset: `8` → `12` (slightly more readable motion at simultaneous play)
- All other values unchanged

### `app/[locale]/layout.tsx`

- Add `className="relative"` to `<main>` tag so the absolutely-positioned exiting element stays contained within the main content area.

## Non-changes

- Animation duration (`0.25s`) and easing (`easeOut`) stay the same.
- No changes to any other motion components (`FadeIn`, `Stagger`).
- No new dependencies.
