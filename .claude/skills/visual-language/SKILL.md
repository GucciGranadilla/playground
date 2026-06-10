---
name: visual-language
description: Authoritative visual language guidelines extracted from the home page. Apply when building or reviewing any new page or section so the design stays coherent — covers type, color, spacing, motion, imagery, and interaction.
---

# Visual Language Guidelines

This is the design system as it actually exists in the code. New pages must conform unless the user explicitly opts out. When a request would break a rule below, name the rule and ask before deviating.

The home page (`src/pages/index.tsx`) is the canonical reference: `Hero → TextTicker → TextBlock → Slider → TextImageBlock → Footer`. Every section here applies these rules — when in doubt, mirror what the home page already does.

---

## 1. Foundations: fluid `rem` on three breakpoints

The site scales typography and spacing fluidly using a CSS variable design width.

```scss
:root {
  --dw: 390;
} /* mobile */
@media (min-width: 481px) {
  :root {
    --dw: 768;
  }
} /* tablet */
@media (min-width: 1025px) {
  :root {
    --dw: 1440;
  }
} /* desktop */
html {
  font-size: calc(100vw / var(--dw));
}
```

**Implication: 1rem = 1 design pixel at the breakpoint.** Use `rem` for everything — type, padding, gaps, fixed heights. Never use `px` for layout. Use `vw`/`vh` only for full-bleed sections (e.g. hero is `100vh`).

When designing a section, picture the layout at `--dw` widths: 390 / 768 / 1440. A `60rem` vertical pad means 60px on a 390 mobile, 60px-equivalent on a 1440 desktop.

`useMobile()` (src/utils/useMobile.ts) breakpoint is **480px** — keep that as the mobile/tablet split when JS-gating behavior.

---

## 2. Color

Palette in [src/styles/\_colors.scss](src/styles/_colors.scss). Use the SCSS variable, not the hex.

| Role                      | Var        | Hex         | Where it's used                                 |
| ------------------------- | ---------- | ----------- | ----------------------------------------------- |
| Primary background        | `$white`   | `#f5f5f5`   | `body` background, footer card, slider button   |
| Primary foreground        | `$black`   | `#1b1b1b`   | body text default                               |
| Deep foreground           | `$eblack`  | `#171717`   | TextImageBlock body, navbar pill                |
| Inverted text             | `$ivory`   | `#e5e5de`   | text on dark/image (hero, slider button border) |
| Soft border / dashed line | `$lgrey`   | `#cfcfcf`   | TextImageBlock tag underline, ticker indicators |
| Slide placeholder         | `$plat50`  | `#e8e8e8`   | Slider fallback background                      |
| Outline (translucent)     | `$outline` | `#ffffff33` | overlays on imagery                             |

**The accent is dynamic, not static.** `randomHue.ts` generates a hue 0–359 once per session and is applied as `hsl(<hue>, 70%, 55%)` (70% saturation, 55% lightness — vibrant, mid-bright). Sections expose it via the CSS variable `--accent`. Use it for:

- Color blocks behind imagery (TextTicker, Slider)
- Accent rules in `text.module.scss` (`.red` → `var(--accent, #960707)`)

Never hardcode the accent. Read `--accent` or fall back to `$red` (`#960707`).

**Rule: dark/image-backed sections use $white or $ivory text; light/cream sections use $eblack or $black text.** Never put $black on the cream backgrounds — use $eblack for the slight extra weight.

---

## 3. Typography

Two families, never mixed within a single text element.

| Family              | Role                     | Classes                      |
| ------------------- | ------------------------ | ---------------------------- |
| **Questrial** (400) | Display, headlines, logo | `.logo` `.xxl` `.xl` `.l`    |
| **Geist** (100–900) | Body, UI, labels         | `.m` `.s` `.p` `.tag` `.cta` |

Full scale from [src/styles/text.module.scss](src/styles/text.module.scss):

| Class   | Size / line-height                | Tracking | Use                                  |
| ------- | --------------------------------- | -------- | ------------------------------------ |
| `.xxl`  | 180rem / 180rem                   | -0.02em  | Footer logo only — display moment    |
| `.xl`   | 50rem / 52rem                     | -0.03em  | Hero title, TextBlock body           |
| `.l`    | 32rem / 34rem                     | -0.03em  | TextTicker body, TextImageBlock body |
| `.m`    | 20rem / 26rem                     | —        | Mid body                             |
| `.s`    | 14rem / 20rem                     | —        | Small body                           |
| `.p`    | 14rem / 16rem                     | —        | Captions, paragraphs in side columns |
| `.tag`  | 13rem / 13rem, 500, **uppercase** | —        | Section eyebrow labels               |
| `.cta`  | 10rem / 8rem, 500, **uppercase**  | —        | Buttons, links, time, scroll labels  |
| `.logo` | 24rem / 24rem                     | -0.02em  | Navbar logo                          |

**Tight letter-spacing on display type (-0.02 to -0.03em) is non-negotiable.** Questrial is wide-set; the negative tracking is what gives it the editorial feel. Don't loosen it.

`text.module.scss` also exports `.lineClip` (overflow clip + inline-block + 0.15em padding/margin trick) — used by `SplitText` to mask reveals. Wrap any line you plan to slide-up with this.

---

## 4. Spacing & Layout

The whole site is built on an **8rem gutter**. This is the most important spacing token in the system.

| Token                                            | Value              | Use                                     |
| ------------------------------------------------ | ------------------ | --------------------------------------- |
| **Section horizontal padding**                   | `8rem`             | left/right of every section             |
| **Section vertical padding**                     | `60rem` top/bottom | standard between sections               |
| **Vertical padding before footer-like emphasis** | `120rem` bottom    | TextImageBlock sets this before footer  |
| **Grid gap**                                     | `8rem`             | universal column gap                    |
| **Sub-content row gap**                          | `20rem` or `24rem` | inside a content cluster (tag/text/CTA) |
| **Content max widths**                           | `364rem`           | footer card, content blocks             |

**Grids: 8 columns wide, 8rem gap.** Standard placements seen on the home page:

- 2-col label + 4-col title (Hero center): `tag → 1/3`, `title → 5/-1`
- 4-col body + 4-col detail (TextTicker): `body → 1/4`, `media → 5/-1`
- 2-col image + 3-col content (TextImageBlock): `image → 1/3`, `content → 6/8`

Navbar uses a **12-column grid** with 8rem gap and `8rem 8rem 4rem` padding — keep that asymmetric (less bottom) padding.

Section heights: most sections are `auto`. Hero and Footer are `100vh`. TextTicker locks its right column to `820rem` and Slider locks slides to `1066rem × 820rem`.

---

## 5. Motion language

This is the part that most distinguishes the site. Treat motion as a first-class design constraint.

### 5.1 The eases that matter

The full vocabulary is in [src/utils/eases.tsx](src/utils/eases.tsx) (mirrored in [src/styles/\_eases.scss](src/styles/_eases.scss)). Of those ~50 curves, four do almost all the work:

| Name       | Curve             | Used for                                                          |
| ---------- | ----------------- | ----------------------------------------------------------------- |
| `quartOut` | `.25, 1, .5, 1`   | Default reveal — moveUp, fadeUp, mediaParallax. **First choice.** |
| `ioC2`     | `.5, 0, .15, 1`   | Navbar slide, page transition, preloader image clips              |
| `io4`      | `.77, 0, .175, 1` | Clip reveals, preloader text exit                                 |
| `out2`     | `.4, .4, .1, 1`   | Fade-up secondary curve (alternative to quartOut)                 |

When picking an ease for a new animation, start with `quartOut`. Use `ioC2` for chrome (transitions, nav). Use `io4` for clip-path reveals.

### 5.2 The two reveal modes

Animations are gated by a **parent class** on the section root, not on the element itself. Two modes:

| Mode         | Parent class | Trigger                                        | When to use               |
| ------------ | ------------ | ---------------------------------------------- | ------------------------- |
| **`ready`**  | `.ready`     | Preloader sets it once page loads              | Above-the-fold (Hero)     |
| **`scroll`** | `.inView`    | IntersectionObserver toggles when ~20% in view | Everything below the fold |

The animation utility classes in [src/styles/ani.module.scss](src/styles/ani.module.scss) come in pairs (e.g. `.moveUp` + `.moveUpScroll`, `.fadeUp50` + `.fadeUp50Scroll`). Use the `Scroll` variant for any section that isn't the hero.

### 5.3 The reveal vocabulary

| Class                                   | Effect                   | Distance   | Duration             |
| --------------------------------------- | ------------------------ | ---------- | -------------------- |
| `.moveUp` / `.moveUpScroll`             | Slide up + fade in       | `120%` Y   | 0.85s `quartOut`     |
| `.moveUpF`                              | Slide up only (no fade)  | `120%` Y   | 0.7s `quartOut`      |
| `.fadeUp50` / `.fadeUp50Scroll`         | Fade + small lift        | `50rem` Y  | 1s `(0.2,0.6,0.1,1)` |
| `.fadeUp20`                             | Subtle fade + lift       | `20rem` Y  | 1s `(0.2,0.6,0.1,1)` |
| `.blurFade`                             | Opacity + blur(16px) → 0 | —          | 0.6s linear          |
| `.clipRevealUp` / `.clipRevealUpScroll` | Bottom-up clip reveal    | full inset | 1s `io4`             |
| `.mediaParallax`                        | Scale 1.2→1 + lift 30%   | —          | 1s `quartOut`        |
| `.drawLine`                             | Width 0 → 100% (1px)     | —          | 0.9s `quartOut`      |
| `.scaleIn`                              | Scale 1.08 → 1           | —          | 1s `(0.2,0.6,0.1,1)` |
| `.fillWidth`                            | scaleX → 1               | —          | 1s `(0.2,0.6,0.1,1)` |

Each consumes a CSS variable `--delay` set inline. **Stagger budget:** 0.04s per word (SplitText default), 0.05–0.08s per element across a section. The home page caps cumulative delay at roughly 0.6–0.8s — anything longer and the section feels lazy on entry.

### 5.4 Text reveals — always use `<SplitText>`

Display text uses [src/components/splitText/index.tsx](src/components/splitText/index.tsx). Defaults: `type="words"`, `stagger=0.04`, `delay=0`, `trigger="ready"`.

For below-the-fold body text (`.l` and `.xl`), pass `trigger="scroll"` and a small stagger like `0.01` for `.xl` body paragraphs. Never split letters on body copy — words only. Letters are reserved for short display lines.

### 5.5 ScrollTrigger / Lenis / Framer Motion — when to reach for which

| Library                             | Use                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| **GSAP + ScrollTrigger**            | Scroll-scrubbed effects (hero parallax), and Slider label tweens. Imperative animation. |
| **Framer Motion**                   | Page transitions, ResizeObserver-driven layouts (TextTicker carousel)                   |
| **Lenis**                           | Smooth scroll only — listen to `lenis` events for scroll position; don't bypass it      |
| **CSS classes (`ani.module.scss`)** | Default for entrance reveals. Reach for GSAP only if you need scrub.                    |

`PageTransition` kills all GSAP tweens and ScrollTriggers between routes — never assume animations from one page persist.

---

## 6. Imagery & media

Defaults in [src/components/parallaxImage/index.tsx](src/components/parallaxImage/index.tsx):

- `object-fit: cover`, `object-position: center`
- Default `parallaxAmount = 12` → image scales 1.12 and travels ±6% Y
- Image filter: `brightness(0.85)` — images are intentionally a touch dim so type sits cleanly on top
- Scroll offsets: `"start end"` → `"end start"` (full viewport pass)

**Aspect ratio guidance** by section:

- Hero: full-bleed `100vh` canvas, `brightness(0.6)` (darker than standard images)
- TextTicker: ~50vw block sized
- Slider: 72vw max, 1066rem × 820rem fixed
- TextImageBlock: image at `520rem` height
- Footer: `100vw`, `scale(1.2)`, scroll-driven `clipPath inset(14% → 0%)` reveal

For new sections, default to `parallaxAmount=12` and `brightness(0.85)` unless you have a reason. Always wrap reveals in `.fadeUp50Scroll` or `.mediaParallax`.

---

## 7. Interaction

### 7.1 Audio is part of the interaction language

[src/pages/\_app.tsx](src/pages/_app.tsx) attaches global click + hover sounds to every `<a>` and `<button>` (`/effects/click.wav` at 0.18 gain, `/effects/hover.mp3` at 0.30 gain, debounced 80ms / 100ms). **Anything tap- or hover-able must be a real `<a>` or `<button>`** — divs with onClick won't get the sound and will feel dead. This is the easiest rule to break.

### 7.2 Navbar blends, not floats

Navbar uses `mix-blend-mode: difference` on the logo, menu, and version button against a `$white` background plate that slides up from below. The plate is driven by `--nav-bg-offset`. Don't add solid backgrounds to elements that need to read against varied imagery — use `mix-blend-mode: difference`.

Hide/show on scroll: 0.6s `cubic-bezier(0.5, 0, 0.15, 1)` (= `ioC2`). Match this curve when extending nav behavior.

### 7.3 Hover states

Pattern from Slider hover: `brightness(0.9)` + `scale(1.02)` over 0.5s `ioC2`. For pill-style hovers (navbar), expand a background pill 8rem beyond the item with `0.6s expoOut`.

### 7.4 Cursor

No custom cursor on the home page. Don't add one without asking.

---

## 8. Distinctive moments — for reference, not for copy-paste

These are signature effects on the home page. Don't reproduce them on new pages unless the user asks for the same flavor — they earn their weight by being rare.

- **Hero**: WebGL canvas background, scroll parallax via GSAP ScrollTrigger
- **TextTicker**: scroll-bound text carousel (Framer Motion `animate()`), Web Audio click on each step, dashed indicator lines (`repeating-linear-gradient`)
- **Slider**: inactive slides at `scaleX(0.328) scaleY(0.428)`, image counter-scaled to maintain cover; `transform-origin: bottom right`
- **Footer**: SVG displacement filter — `feTurbulence` + `feDisplacementMap` (160 scale) + R/B channel offset for chromatic aberration; `backdrop-filter: blur(4px)`; layered specular shine (inset white shadows); auto-scrolling logo marquee (Embla `AutoScroll`, speed 1.4)
- **Preloader**: 2200ms minimum, organic progress fill (max +0.084 per 80ms tick), 4 image flashes 0.45s reveal / 0.65s hide using `ioC2`

---

## 9. Pre-flight checklist for a new page

Before you ship a new page or section, walk this list:

**Foundations**

- [ ] All sizes in `rem` (not `px`); section uses `8rem` horizontal pad, `60rem` vertical pad
- [ ] Layout uses an 8-column grid with `8rem` gap, or a clear flex equivalent

**Type**

- [ ] Display text uses Questrial classes (`.xl` `.l` `.xxl`); body/UI uses Geist (`.m` `.s` `.p` `.tag` `.cta`)
- [ ] Eyebrow labels are `.tag` (uppercase, 500 weight); buttons/links are `.cta`
- [ ] No element mixes both font families

**Color**

- [ ] Uses palette variables, not raw hex
- [ ] Accent reads from `var(--accent)` and falls back to `$red`
- [ ] Body text on cream is `$eblack` or `$black`; text on imagery is `$white` or `$ivory`

**Motion**

- [ ] Below-the-fold reveals use `*Scroll` variants (`.moveUpScroll`, `.fadeUp50Scroll`)
- [ ] Display text uses `<SplitText>` with `trigger="scroll"`
- [ ] Default ease is `quartOut` unless there's a reason otherwise
- [ ] Cumulative stagger across the section stays under ~0.8s
- [ ] No raw `transition: all 0.3s ease` — pick a named ease

**Imagery**

- [ ] Wrapped in `<ParallaxImage>` (default `parallaxAmount=12`) unless static is intentional
- [ ] `object-fit: cover`, `brightness(0.85)` filter applied (or section-specific override matched to hero)

**Interaction**

- [ ] Every clickable element is a real `<a>` or `<button>` (so it gets click/hover sounds)
- [ ] Hover state: `brightness(0.9)` + small scale, ~0.5s

**Plumbing**

- [ ] No new GSAP timelines that survive route changes (`PageTransition` kills tweens, plan accordingly)
- [ ] Lenis is the source of truth for scroll position — listen to its events, don't bypass

If a request would violate any item above, raise it with the user first.
