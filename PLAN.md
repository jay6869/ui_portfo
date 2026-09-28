# PLAN — janithgodage.dev

Build plan for the portfolio. The brief is the spec; this file covers *how*.

## 1. Architecture at a glance

```
            ┌──────────────────────── build time ────────────────────────┐
 content/*.ts ──zod──▶ prerender (SSR, React renderToPipeableStream) ──▶ dist/**/index.html
 scripts/github.mjs ──▶ src/content/generated/github.json (fallback committed)
 scripts/og.mjs     ──▶ public/og.png, favicons (satori + resvg)
            └─────────────────────────────────────────────────────────────┘
            ┌──────────────────────── runtime ───────────────────────────┐
 hydrateRoot(App)
   ├─ Engine: gsap.ticker (THE one rAF) ─▶ Lenis (inside Locomotive v5) ─▶ ScrollTrigger.update
   ├─ Zustand stores (theme, sound, cursor, palette, preloader, transition)
   ├─ Layout shell: Grain · Cursor · Header · HUD · Preloader · Palette · Toasts
   └─ Routes: /  ·  /work/:slug  ·  *(404)
            └─────────────────────────────────────────────────────────────┘
```

### Why prerender?
LCP < 2.0 s on throttled mobile is not realistic for a client-only SPA: the hero text would wait for
~150 KB of JS. Each route is rendered to static HTML at build time and hydrated on the client. The
same work also gets us:
- real content with JS disabled or broken (the brief's "readable with animation failing"),
- correct `<title>`, OG and canonical tags per route without a server,
- a real `404.html` with a 404 status instead of a soft 404.

Browser-only concerns (time, theme, storage, WebGL, Locomotive) run only in effects. The server and
the first client render produce identical markup.

## 2. Folder structure

```
src/
  main.tsx                 client entry (hydrate or render)
  entry-server.tsx         SSR entry used by scripts/prerender.mjs
  App.tsx                  providers + routes
  routes/                  Home, CaseStudy, NotFound
  content/                 site, projects, services, lab, about (+ schema.ts, placeholders.ts)
  styles/                  tokens.css, fonts.css, global.css, utilities
  engine/                  gsap.ts, scroll.tsx (Locomotive provider), media.ts, ease.ts, near.ts
  stores/                  ui.ts (Zustand + Immer)
  components/
    primitives/            Button, Magnetic, TextRoll, SplitReveal, Marquee, Tag, SectionHeading,
                           ProjectRow, Toast, Dialog, Copy (placeholder-aware text)
    chrome/                Header, Hud, Cursor, Grain, Preloader, CommandPalette, MobileMenu,
                           ThemeToggle, SoundToggle, LocalTime, Shortcuts, PageTransition,
                           SharedCover, DevBanner, SkipLink
    sections/              Hero, StackMarquee, Work, Services, StackViz, Lab, About, Contact, Footer
    art/                   ProjectCover (generative SVG), Portrait placeholder, BlobFallback
    three/                 HeroBlob (lazy)
    lab/                   P5Loom, SortSpecimen, ToneKeys, TapeMeasure (lazy)
  lib/                     sound.ts, clipboard.ts, time.ts, storage.ts, cn.ts
scripts/                   prerender.mjs, og.mjs, github.mjs, sitemap.mjs, shoot.mjs, audit.mjs
cypress/                   e2e smoke specs
.storybook/                Storybook config
```

## 3. Component list

| Area | Components |
| --- | --- |
| Primitives | `Button`, `Magnetic`, `TextRoll`, `SplitReveal`, `Marquee`, `Tag`, `SectionHeading`, `ProjectRow`, `Toast`/`Toaster`, `Dialog`, `Copy` |
| Chrome | `Header`, `Hud`, `Cursor`, `Grain`, `Preloader`, `CommandPalette`, `MobileMenu`, `ThemeToggle`, `SoundToggle`, `LocalTime`, `Shortcuts`, `PageTransition`, `SharedCover`, `DevBanner`, `SkipLink` |
| Sections | `Hero`, `StackMarquee`, `Work` (`WorkList` desktop, `WorkCarousel` mobile, `FloatingPreview`), `Services`, `StackViz`, `GithubStrip`, `Lab`, `About` (`SriLankaMap` lazy), `Contact` (`ContactForm` lazy-enhanced), `Footer` |
| Routes | `Home`, `CaseStudy`, `NotFound` |

## 4. Animation architecture

- **One ticker.** `gsap.ticker` is the only rAF loop in the app. Lenis (inside Locomotive v5) is
  started with `autoStart:false`-style manual driving: `gsap.ticker.add(t => lenis.raf(t * 1000))`,
  `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`. The cursor, magnetic
  pulls and the floating preview use `gsap.quickTo`, which runs on the same ticker.
- **One scroll engine.** Locomotive v5 does the smooth scrolling only. Every scroll-linked effect
  (reveals, parallax, stacked cards, marquee velocity) is GSAP ScrollTrigger, so there's a single
  source of truth for scroll-driven animation. Locomotive's `data-scroll-speed` parallax is not used.
- **Scoped cleanup.** Every component animates inside `useGSAP()` / `gsap.context()` scoped to its
  root and reverted on unmount (no leaked triggers across route changes).
- **Framer Motion** only for: route presence and the panel wipe, the shared-element cover
  (`layoutId`), and UI micro-interactions (menus, toasts, palette). It's loaded through
  `LazyMotion` with async features, which keeps it out of the critical path.
- **Media gates** (`gsap.matchMedia`): `(prefers-reduced-motion: reduce)` removes smooth scroll,
  parallax, WebGL, marquee motion and the pin effects, which become plain fades. `(pointer: coarse)` removes the cursor,
  magnetic pulls and hover previews.
- **Off-screen work pauses.** WebGL, p5 and D3 timers stop when their IntersectionObserver reports
  them off-screen or the tab is hidden. Three.js resources are disposed on unmount.

### Shared-element transition (work → case study)
The desktop list has no inline covers. Its cover is the floating preview that follows the cursor.
Clicking a row expands that preview into the case-study cover. Mobile expands the carousel card
cover. Implementation: a persistent fixed-position `SharedCover` layer at the app root holds a
`motion.div` with `layoutId="cover"`. On click, the layer renders it at the source rect; on route
change it renders at the target rect (full-bleed hero). Framer Motion FLIPs between the two using
transforms. Because both boxes are `position: fixed`, scroll position doesn't affect the
measurement. When the animation ends, the real cover on the page becomes visible and the layer
unmounts. Back navigation (button or browser) reverses into the row or card. Home scroll position
is saved to the store and restored before the reverse measurement.

All other route changes get the charcoal panel wipe with the route title (~500 ms, interruptible).

## 5. Performance plan (initial JS ≤ 180 KB gzip)

| In the initial chunk | Lazy (IntersectionObserver or interaction) |
| --- | --- |
| react, react-dom, react-router, helmet-async, gsap + ScrollTrigger, zustand + immer, dayjs (+utc/tz), framer-motion `m` + LazyMotion shell, app code | Locomotive (right after hydrate, skipped for reduced motion), framer-motion features, Radix Dialog (palette, menu, shortcuts: on first open or idle), Three.js hero, Swiper (mobile only), D3 viz, p5, Tone, Sortable, Leaflet, RHF + Zod form |

- Zod validates content in dev (on load) and at build (prerender). It never ships for content.
- Fonts: latin subset only, `font-display: swap`, the display font is preloaded. Fallback faces
  use metric overrides so the swap doesn't shift layout (CLS < 0.02).
- Covers are generative SVG (a few KB). Real images go through `<picture>` with AVIF/WebP,
  explicit width/height and a dominant-colour placeholder.

## 6. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Locomotive v5 + ScrollTrigger drift or double rAF | Drive Lenis from `gsap.ticker` manually and verify it on a scratch route before building sections |
| Hydration mismatches (time, theme, storage) | Server-stable placeholders; client values set in effects; inline head script sets `data-theme` before paint |
| Preloader hurting LCP | The hero is painted under the curtain from the first frame (LCP ignores occlusion). The curtain is theatre and never gates rendering. |
| Budget blow-out (Framer, Radix, Swiper) | LazyMotion, lazy dialogs, Swiper only on narrow screens, and a visualizer report on every build |
| Pinned sections + smooth scroll jank | CSS `position: sticky` for stacking, with ScrollTrigger only scrubbing transform and opacity |
| Placeholder content shipped by accident | `[PLACEHOLDER]` and `[EDIT ME]` render as visible tags, and a dev-only banner counts them |
| Third-party requests (tiles, fonts, APIs) | None at runtime. The map uses a local GeoJSON outline, no tiles. GitHub data is fetched at build time. |

## 7. Order of work

1. PLAN / DESIGN docs
2. Scaffold (Vite, TS strict, ESLint, Prettier, aliases, tokens, global CSS, fonts)
3. Engine (scroll sync, stores, cursor, transitions, media gates) and a scratch verification route
4. Primitives with Storybook stories
5. Sections: Hero → Marquee → Work (+ case study) → Services → Stack viz → Lab → About → Contact → Footer → Preloader → Palette,
   with screenshots at 375 / 768 / 1440 / 1920 and a critique after each
6. Polish (grid alignment, easing, focus, 404, honeypot)
7. Audit (Lighthouse, axe, bundle, keyboard, reduced motion, 4× CPU)
8. Cypress, README, DECISIONS
