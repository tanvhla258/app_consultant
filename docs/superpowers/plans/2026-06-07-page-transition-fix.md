# Page Transition Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the jarring "jump down" during page transitions by switching `AnimatePresence` to `mode="popLayout"` so exit and enter animate simultaneously without a layout-collapse gap.

**Architecture:** `mode="popLayout"` absolutely positions the exiting element so the container height is immediately set by the entering content. This eliminates both the empty-container gap and the directional reversal (exit up → enter from below). The `<main>` wrapper needs `position: relative` to contain the absolutely-positioned exiting element.

**Tech Stack:** Framer Motion (`AnimatePresence`, `motion.div`), Next.js App Router, React

---

## Files

- Modify: `components/motion/PageTransition.tsx` — switch `mode`, adjust Y offsets
- Modify: `app/[locale]/layout.tsx` — add `relative` to `<main>`
- Create: `tests/components/motion/PageTransition.test.tsx` — render smoke test

---

### Task 1: Write and run a failing smoke test for PageTransition

**Files:**
- Create: `tests/components/motion/PageTransition.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render } from '@testing-library/react';
import { PageTransition } from '@/components/motion/PageTransition';

// framer-motion does not run real animations in jsdom — mock it to render children directly
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('PageTransition', () => {
  it('renders children', () => {
    const { getByText } = render(
      <PageTransition>
        <p>hello</p>
      </PageTransition>
    );
    expect(getByText('hello')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — expect it to pass (smoke test, not behavior)**

```bash
npx vitest run tests/components/motion/PageTransition.test.tsx
```

Expected: 1 passed. If it fails with a module resolution error, check that `@/` alias is configured in `vitest.config.ts`.

- [ ] **Step 3: Commit the test**

```bash
git add tests/components/motion/PageTransition.test.tsx
git commit -m "test(motion): add PageTransition render smoke test"
```

---

### Task 2: Fix PageTransition — switch to `mode="popLayout"`

**Files:**
- Modify: `components/motion/PageTransition.tsx`

- [ ] **Step 1: Update the component**

Replace the entire file content with:

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

- [ ] **Step 2: Run the smoke test to confirm nothing broke**

```bash
npx vitest run tests/components/motion/PageTransition.test.tsx
```

Expected: 1 passed.

- [ ] **Step 3: Commit**

```bash
git add components/motion/PageTransition.tsx
git commit -m "fix(motion): switch AnimatePresence to popLayout to eliminate jump on page transition"
```

---

### Task 3: Add `relative` to `<main>` in layout

**Files:**
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Add `relative` className to `<main>`**

Find line 43 in `app/[locale]/layout.tsx`:

```tsx
<main><PageTransition>{children}</PageTransition></main>
```

Change to:

```tsx
<main className="relative"><PageTransition>{children}</PageTransition></main>
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/layout.tsx
git commit -m "fix(layout): add relative positioning to main for popLayout exit containment"
```

---

### Task 4: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate between pages and observe**

Open `http://localhost:3000`. Click nav links to move between Home, Services, Partners, Contact. Watch the transition:

- Old content should slide up and fade out
- New content should appear simultaneously, sliding up from slightly below
- No gap, no jump, no directional reversal

- [ ] **Step 3: Check at different scroll positions**

Scroll halfway down a long page, then navigate. Verify the transition looks clean and the scroll position resets without a visible layout jump.
