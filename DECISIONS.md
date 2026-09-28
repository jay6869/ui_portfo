# DECISIONS

Short, opinionated calls made while building. Each one says what I chose and why. Where I
deviated from the brief, it's marked **Deviation**.

## Stack & versions

- **React 18.3** (brief: React 18), even though React 19 is current. Every library still supports 18.
- **TypeScript 5.9**, not 7.x: `typescript-eslint` doesn't support TS 7 yet. Strict mode, plus
  `noUncheckedIndexedAccess`.
- **ESLint 9**: `eslint-plugin-jsx-a11y` doesn't support ESLint 10 yet.
- **React Router 7** (declarative `BrowserRouter` / `StaticRouter`). **framer-motion 13**, **Zod 4**.
- **Vite 8** (Rolldown) and **Storybook 10**.

## Rendering

- **Every route is prerendered to static HTML and hydrated.** This is the single most
  important performance decision. LCP under 2s on throttled mobile isn't realistic for a
  client-only SPA. It also gives real content with JS off, per-route meta tags, and a real
  `404.html` with a 404 status.
- **`renderToString`, not the streaming renderer.** React 18.3's `renderToPipeableStream`
  wrote a stray NUL byte when a multi-byte character (an em dash) straddled its internal
  buffer. Nothing in the prerendered tree suspends, so `renderToString` is equivalent.
- **"SPA fallback" is not a catch-all rewrite.** Prerendered routes are plain directories and
  unknown paths get `404.html`, which hydrates the React 404 route. That's better for SEO than
  a soft 404. (**Deviation** from the literal brief, same user-visible behaviour.)
- **Per-section `<Suspense>` boundaries on the home page.** Nothing suspends; the boundaries
  let React 18 hydrate section by section in small tasks. TBT fell from about 180ms to about 10ms.
- **JS starts downloading after first contentful paint.** A tiny CSP-hashed inline loader
  re-adds the modulepreloads and imports the entry once FCP is observed. The page is fully
  prerendered and the intro is pure CSS, so nothing visible waits on JS. The trade-off: on
  very slow connections, buttons that need React are inert for the first moment. Links work
  natively the whole time.
- **Entry CSS is inlined** into each prerendered page (12.5KB brotli), so first paint needs
  only the HTML.

## Motion & scroll

- **One scroll engine, one ticker.** Locomotive v5 (Lenis) is driven by `gsap.ticker`
  through `initCustomTicker`, and its scroll events feed `ScrollTrigger.update`. All
  scroll-linked animation is ScrollTrigger; Locomotive's `data-scroll-speed` parallax is
  unused, so there's one source of truth. Verified on a dev-only `/__engine` route: the Lenis
  position equals `window.scrollY` and scrub stays in sync. (ScrollTrigger keeps GSAP's own
  empty rAF keep-alive. That's GSAP internals, not a second engine.)
- **The engine is reference-counted.** React StrictMode's mount → unmount → mount had
  destroyed the live instance in a race.
- **Scroll restoration is forced to `manual` on every history entry.** The mode is stored per
  entry, and Chrome jumped to the old scroll position before the case-study → home
  transition could measure.
- **Stacked "What I do" cards use CSS `position: sticky`**, not a ScrollTrigger pin.
  ScrollTrigger only scrubs scale and a shade layer (transform and opacity). A blur filter
  would repaint every frame, so there isn't one. It's robust, needs no pin-spacers, and works
  without JS.
- **Shared element (work → case study) is an explicit FLIP animated by Framer Motion**, not
  `layoutId`. **Deviation.** I tried `layoutId` (and `layoutRoot`) first. Framer measures in
  page coordinates, so the scroll reset between routes offset the start box by about 1,500px.
  Now the frame mounts at the target box with an inverted transform and Framer animates
  x, y and scale to identity: transform-only and scroll-proof. The desktop preview and the
  case-study cover are both 16:9, and phone cards and the phone cover both 4:5 (4:3 on
  tablet), so the scale is uniform and nothing distorts.
- **The preloader is pure CSS from first paint** (the counter uses `@property`). Any key or
  click skips it, handled by the head script, so skipping works before hydration too. The
  hero is painted under the curtain from frame one, so the preloader never delays LCP. When
  JS arrives before the curtain opens, GSAP runs the hero letter stagger in sync with the
  reveal; when it arrives late, it doesn't re-animate content you can already see.
  **Deviation**: the brief says "GSAP timeline" for the preloader. The curtain itself is CSS
  so it doesn't depend on JS timing; GSAP still does the hero letters.
- **SplitText is done by hand in React**, not the GSAP plugin. The plugin mutates DOM that
  React owns (hydration mismatches). Words and letters are server-rendered spans, visible by
  default, and hidden only just before they reveal.

## WebGL blob

- Loads at idle after first paint, only if all of these hold: reduced motion is off, the
  device doesn't look low-power, and WebGL is **hardware-accelerated**. SwiftShader and
  llvmpipe (GPU-less VMs, blocklisted drivers, headless browsers) get the SVG. A frame-time
  watchdog also falls back if the first 40 frames are slow.
- Consequence: **Lighthouse (headless) measures the SVG fallback**, because headless Chrome
  renders WebGL in software. On GPU devices the blob loads after idle, outside LCP and TBT.

## Libraries I used differently from the brief

- **Hammer.js: not used.** Pointer Events cover the lab canvas (pull, click) and Swiper
  handles carousel touch. Adding a 2014-era gesture library for nothing would be a library
  "just because". **Deviation.**
- **Recharts and Headless UI: not used.** The brief made both conditional, and D3 and Radix
  covered everything.
- **Lodash: per-function only (`throttle`).** `groupBy` pulled in about 20KB of iteratee
  machinery, so it's a five-line reduce instead.
- **Leaflet with no tile server.** It uses a local Natural Earth outline (public domain,
  12KB, lazy) and one clay marker. There are no third-party requests, no cookies and no
  attribution clutter. Wheel-zoom is off so it never traps page scrolling.
- **Swiper is vanilla (`new Swiper(el)`) over server-rendered markup.** Without JS, or
  before it loads, the track is a native scroll-snap row. Slides keep `listitem` semantics.

## Design calls

- **Hanken Grotesk** for body/UI: warmer than Geist, and pairs with Instrument Serif.
- **Paper theme accent.** Clay (#E8956A) on paper is 1.96:1, which fails AA. Paper uses
  `--accent-ink: #9A4A26` (5.18:1) for text and focus rings, and keeps clay for decorative
  fills.
- **Arial and Times appear only as metric-override fallback faces** (for CLS). They are
  never styled or used as design fonts.
- **The HUD section label is a vertical rail in the left margin**, and ⌘K lives in the
  header. In the bottom corners they collided with content.
- **`[PLACEHOLDER]` and `[EDIT ME]` render as visible dashed tags**, in production too, so
  unfinished copy can never ship unnoticed. The dev-only banner counts them per file.
- **Generative SVG covers** stand in for screenshots (six deterministic compositions in
  palette tokens, so they theme). Real images drop in through `<picture>` with AVIF/WebP.

## Security

- **CSP is generated at build as a meta tag.** Scripts are `'self'` plus the SHA-256 of our
  two inline scripts, no `unsafe-inline` for scripts. `blob:` and `wasm-unsafe-eval` are
  allowed for Tone.js worklets and p5. The form endpoint origin is added from
  `VITE_FORM_ENDPOINT`. Headers (HSTS, `nosniff`, DENY framing, referrer and permissions
  policies) live in `vercel.json` and `netlify.toml`.
- **The contact form has a honeypot and a 2.5s time-trap.** Bots get a fake "sent". Testing
  caught that the original Zod schema rejected a filled honeypot, so the fake-success path
  never ran. Fixed.

## Testing notes

- The Cypress harness strips the CSP meta tag (it blocks Cypress's injected script) and
  waits for hydration. The mailto hand-off goes through a documented test seam
  (`window.__jgOpenMail`).
- `scripts/serve.mjs` replaces `vite preview`. It mirrors the host: prerendered directories,
  `404.html` with a 404 status, brotli, cache and security headers. Lighthouse, axe and
  Cypress all run against it.
