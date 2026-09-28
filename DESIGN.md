# DESIGN — "The Workshop at Night"

A late-night workshop: warm charcoal surfaces, lamp-light, paper grain. Print magazine meets code
editor. Big confident serif, small precise mono. Calm, never neon.

## Tokens (`src/styles/tokens.css`)

Everything themeable lives in one file. Components only ever reference **semantic** tokens
(`--bg`, `--fg`, `--accent` …), which map onto the raw palette per theme.

### Raw palette

| Token         | Value                   | Use                               |
| ------------- | ----------------------- | --------------------------------- |
| `--ink-950`   | `#131211`               | deepest shade: preloader, curtain |
| `--ink-900`   | `#1a1917`               | footer, sunken areas              |
| `--ink-800`   | `#1d1c1a`               | **main background**               |
| `--ink-700`   | `#262523`               | raised surfaces (cards)           |
| `--ink-600`   | `#34322f`               | hover surface, strong hairline    |
| `--bone`      | `#ECE6DA`               | primary text                      |
| `--bone-dim`  | `#A39E93`               | secondary text                    |
| `--line`      | `rgba(236,230,218,.10)` | hairlines                         |
| `--clay`      | `#E8956A`               | accent (sparingly)                |
| `--sage`      | `#A8B5A0`               | "available" dot only              |
| `--paper`     | `#EFEAE0`               | paper background                  |
| `--clay-deep` | `#9A4A26`               | clay for text on paper (AA)       |

### Semantic tokens × theme

| Semantic       | Charcoal (default) | Paper                                  |
| -------------- | ------------------ | -------------------------------------- |
| `--bg`         | ink-800            | `#EFEAE0`                              |
| `--bg-raised`  | ink-700            | `#E6E0D4`                              |
| `--bg-sunken`  | ink-900            | `#E8E2D6`                              |
| `--fg`         | bone               | `#1d1c1a`                              |
| `--fg-dim`     | bone-dim           | `#5E5950`                              |
| `--line`       | bone @ 10%         | ink @ 12%                              |
| `--accent`     | clay               | clay (decorative: cursor, dots, fills) |
| `--accent-ink` | clay               | clay-deep (text, focus rings)          |
| `--status`     | sage               | `#5C7352`                              |

### Contrast (WCAG 2.2, measured)

| Pair                          | Ratio |                                                                                                      |
| ----------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| bone / ink-800                | 13.70 | AAA                                                                                                  |
| bone-dim / ink-800            | 6.38  | AA                                                                                                   |
| bone-dim / ink-700            | 5.74  | AA                                                                                                   |
| clay / ink-800                | 7.25  | AAA                                                                                                  |
| ink-800 / clay (button label) | 7.25  | AAA                                                                                                  |
| sage / ink-800                | 7.93  | AAA                                                                                                  |
| ink / paper                   | 14.20 | AAA                                                                                                  |
| fg-dim `#5E5950` / paper      | 5.80  | AA                                                                                                   |
| clay-deep / paper             | 5.18  | AA                                                                                                   |
| clay / paper                  | 1.96  | **fails**, so it's never used for text or focus on paper; `--accent-ink` switches to clay-deep there |

## Typography

| Role          | Family                        | Notes                                                                                                |
| ------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Display       | Instrument Serif 400 + italic | headlines, numerals, pull quotes. The italic marks the one emphasis word per headline, in clay.      |
| Body / UI     | Hanken Grotesk (variable)     | chosen once for the whole site. It's warmer than Geist and has humanist details that suit the serif. |
| Labels / meta | JetBrains Mono (variable)     | uppercase, 0.72–0.8rem, `letter-spacing: .12em`                                                      |

Fluid scale (`clamp()`, 320 → 1920 px):

| Step          | Size           | Leading | Use                            |
| ------------- | -------------- | ------- | ------------------------------ |
| `--step--2`   | 0.69 → 0.75rem | 1.4     | mono labels                    |
| `--step--1`   | 0.83 → 0.9rem  | 1.5     | small print                    |
| `--step-0`    | 1 → 1.125rem   | 1.6     | body                           |
| `--step-1`    | 1.2 → 1.45rem  | 1.45    | lead paragraph                 |
| `--step-2`    | 1.6 → 2.4rem   | 1.15    | card titles                    |
| `--step-3`    | 2.2 → 4.2rem   | 1.0     | section headlines              |
| `--step-4`    | 3 → 7.5rem     | 0.95    | contact headline, next-project |
| `--step-hero` | 19vw → 20vw    | 0.82    | hero name                      |

Measure: paragraphs max `62ch`. Display tracking: `-0.02em`. Mono tracking: `+0.12em`.

## Grid

- 12 columns, `--gutter: clamp(12px, 1.6vw, 24px)`, page margin `--margin: clamp(16px, 4vw, 64px)`.
- Mobile (< 768): 4 columns. Tablet: 8. Desktop (≥ 1024): 12.
- Utility: `.grid` sets up the columns. Children place themselves with `grid-column`.
- Deliberate asymmetry: headings start at col 1, body text at col 5 or 7, meta at col 10.
- Hairline dividers (`1px var(--line)`) separate sections. Oversized serif numerals (`01`–`06`)
  sit on the first column of each section heading.
- **HUD frame:** fixed, `pointer-events: none` except on its controls. Left-bottom shows the section
  index and label, the right edge a vertical scroll-progress hairline, bottom-right the `⌘K` hint.
  The header (top) carries the local time.

## Motion principles

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Primary ease (entrances) | `cubic-bezier(0.22, 1, 0.36, 1)` → `--ease-out`, GSAP `"expo-ish"` custom `workshop` |
| Snappy ease (micro)      | `cubic-bezier(0.32, 0.72, 0, 1)` → `--ease-snap`                                     |
| In-out (wipes, scrubs)   | `cubic-bezier(0.76, 0, 0.24, 1)` → `--ease-inout`                                    |
| Durations                | micro 0.4 s · entrances 0.8–1.1 s · wipes 0.5 s                                      |
| Stagger                  | letters 0.03 s · words 0.06 s · rows 0.08 s                                          |

Rules:

1. Everything is interruptible. New input kills or retargets the tween, never queues it.
2. Only `transform`, `opacity`, `clip-path` (and `filter` on small elements) animate.
3. Nothing loops near body text. The marquee and the blob live in their own bands.
4. Motion never carries information on its own. Every state change also shows in text or colour.
5. With reduced motion, everything becomes opacity fades of 0.3 s or less. No smooth scroll, parallax,
   WebGL or marquee travel.

## Texture

- Film grain: an SVG `feTurbulence` tile rendered once to a data-URI background on a fixed
  `::after` layer, `opacity: .05`, `mix-blend-mode: overlay`, `pointer-events: none`. It's static,
  and I don't animate grain because animated grain is noise that people notice.
- Lamp-light: one very large, very soft radial gradient (clay at 6%) in the hero's top-left.

## Component inventory

| Component        | Purpose                                                                          | States                                              |
| ---------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| `Button`         | primary (clay fill) / ghost (hairline)                                           | hover text-roll, focus ring, disabled, loading      |
| `Magnetic`       | wraps any element, eased pull toward the pointer                                 | fine pointer only                                   |
| `TextRoll`       | duplicate text slides vertically on hover/focus                                  | reduced motion becomes an underline                 |
| `SplitReveal`    | words or letters mask up on scroll                                               | server renders plain text, aria-label on the parent |
| `Marquee`        | infinite band, speed/direction/skew from scroll velocity                         | hover pause; reduced motion is static and wraps     |
| `Tag`            | mono pill                                                                        | default, accent, placeholder                        |
| `SectionHeading` | numeral + headline + kicker                                                      | words mask up                                       |
| `ProjectRow`     | index · title · discipline · stack · year                                        | hover, dimmed, focus                                |
| `Toast`          | aria-live status message                                                         | enter/leave                                         |
| `Dialog`         | Radix Dialog with site styling                                                   | palette, menu, shortcuts                            |
| `Copy`           | renders content strings, turning `[PLACEHOLDER]` / `[EDIT ME]` into visible tags |                                                     |
