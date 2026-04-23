# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run go       # Build + start (production shortcut)
```

No test suite is configured.

## Architecture

This is an animation-heavy Next.js (Pages Router) portfolio/studio site using TypeScript and SCSS Modules.

### App shell (`src/pages/_app.tsx`)

All pages are wrapped in this provider hierarchy:

```
LenisProvider (smooth scroll)
└── Preloader (GSAP loading sequence, runs once)
    └── Navbar (scroll-aware hide/show)
        └── PageTransition (Framer Motion route animation)
            └── Layout
                └── Page content (sections)
```

`_app.tsx` passes `pageProps` containing `page`, `settings`, and `popup` through the tree.

### Pages & Sections

Pages live in `src/pages/`. Content is composed from reusable section components in `src/sections/`:

- **Hero** — Canvas, Cape Town timezone clock (Luxon), scroll indicator
- **TextBlock** — GSAP ScrollTrigger text reveal
- **TextTicker** — Animated scrolling text
- **Slider** — Embla Carousel image carousel
- **ColourBlock** — Colour-theme content block

### Animation stack

Three animation libraries are used together:

| Library | Role |
|---|---|
| **GSAP + ScrollTrigger** | Scroll-based reveals, SplitText stagger, preloader sequence |
| **Framer Motion** | Page transition enter/exit animations |
| **Lenis** | Smooth scroll; Navbar and PageTransition both listen to Lenis events |

`PageTransition` kills all GSAP animations and ScrollTriggers between route changes, then re-initialises Lenis.

### Styling

- **SCSS Modules** (`*.module.scss`) for scoped component styles
- **`src/styles/globals.scss`** — global resets, font faces, CSS custom properties
- **`src/styles/ani.module.scss`** — shared animation classes (`.moveUp`, `.clipRevealUp`, `.blurFade`, etc.) consumed by multiple components
- **`src/styles/text.module.scss`** — typography scale classes (xxl → tag)
- **`src/styles/_colors.scss`, `_eases.scss`, `_mixins.scss`** — SCSS partials; `src/` is on the SASS load path so these can be imported without a path prefix

Fluid typography uses a `--dw` CSS variable (design width) that steps across four breakpoints: 390px → 768px → 1440px → 2240px.

### Utilities & hooks

- **`src/utils/eases.tsx`** — 50+ custom cubic-bezier easing curves, exported as raw arrays and as CSS strings for GSAP's `CustomEase`
- **`src/utils/randomHue.ts`** — generates a random hue on page load and sets `--accent` as an HSL colour
- **`src/utils/useMobile.ts`** — responsive mobile detection hook
- **`src/utils/classNames.tsx`** — tiny helper that filters falsy values and joins class strings

### Path alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json` and `jsconfig.json`).
