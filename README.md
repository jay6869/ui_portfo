# janithgodage.dev

Personal portfolio of **Janith Godage**, a web developer (front-end & creative development)
based in Sri Lanka. The visual direction is "The Workshop at Night": charcoal surfaces, lamp
light, paper grain, big serif type, small mono labels.

Built with Vite, React 18, TypeScript (strict), CSS Modules, GSAP + ScrollTrigger,
Locomotive Scroll v5, Framer Motion, Three.js, Zustand + Immer, React Hook Form + Zod,
Radix UI, Swiper, D3, Day.js, and lazy-loaded p5.js, Tone.js, Sortable.js and Leaflet.

Every route is **prerendered to static HTML** and hydrated. The site reads and works with
JavaScript off, and the animation layer is progressive enhancement on top.

- `PLAN.md`: architecture and build plan
- `DESIGN.md`: tokens, type scale, grid, motion principles, component inventory
- `DECISIONS.md`: every opinionated call and deviation from the brief, with reasons

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Requirements: Node ≥ 20.19. Built and tested on Node 26.

> **npm 12 note:** npm now blocks install scripts by default, so the Cypress binary isn't
> downloaded automatically. Run `npx cypress install` once, or approve it with
> `npm install-scripts approve cypress`.

## Scripts

| Script                                                       | What it does                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                                | Vite dev server with HMR. Content is validated with Zod on load (errors appear in the console).                    |
| `npm run build`                                              | Typecheck → lint → GitHub fetch → client build → SSR build → prerender (fails on invalid content). Output: `dist/` |
| `npm run build:only`                                         | The build without typecheck and lint                                                                               |
| `npm run preview`                                            | Serves `dist/` like the real host (prerendered routes, real 404, brotli, headers) on :4173                         |
| `npm run assets`                                             | Regenerates `public/og.png`, the favicon set, the web manifest and the placeholder CV                              |
| `npm run analyze`                                            | Bundle treemap → `stats.html`                                                                                      |
| `npm run storybook`                                          | Design-system primitives on :6006 (`npm run build-storybook` for a static build)                                   |
| `npm run test:e2e`                                           | Starts the preview server and runs the Cypress smoke suite                                                         |
| `npm run cy:open`                                            | Cypress UI (run `npm run preview` in another terminal first)                                                       |
| `npm run audit:a11y`                                         | axe-core audit (needs `npm run preview` running)                                                                   |
| `node scripts/lh.mjs / /work/flagship-one`                   | Lighthouse mobile runs against the preview server                                                                  |
| `node scripts/walkthrough.mjs`                               | Keyboard-only and reduced-motion walkthroughs                                                                      |
| `node scripts/inp.mjs`                                       | Interaction latency under a 4× CPU throttle                                                                        |
| `node scripts/shoot.mjs --name x --widths 375,768,1440,1920` | Screenshots for design review (dev server)                                                                         |

> The e2e suite runs in **Chrome** (`--browser chrome`). Cypress's bundled Electron couldn't
> render or capture screenshots on the GPU-less machine this was built on.
>
> **Running Cypress from a VS Code terminal?** VS Code sets `ELECTRON_RUN_AS_NODE=1`, which
> makes Cypress fail with `bad option: --no-sandbox`. Use `env -u ELECTRON_RUN_AS_NODE npm run test:e2e`.

---

## Editing content (no component changes needed)

All copy and data live in **`src/content/`**, as typed objects validated by Zod:

| File          | What's in it                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.ts`     | Name, role, intro line, location and timezone, email, socials, CV path, **availability pill**, SEO, section headings, contact copy, 404 copy, footer |
| `projects.ts` | The six projects (order = display order; `featured: true` = flagship)                                                                                |
| `services.ts` | The four "What I do" cards (`emphasis` must be a word in `title`)                                                                                    |
| `stack.ts`    | Tools grouped by layer (drives the D3 orbit), plus the marquee list                                                                                  |
| `lab.ts`      | Lab experiment titles, blurbs, tags and source paths                                                                                                 |
| `about.ts`    | Three-paragraph bio, facts, principles, portrait, map marker                                                                                         |

Conventions:

- `*word*` in a headline becomes the italic clay accent. Use one per headline.
- `[PLACEHOLDER]` and `[EDIT ME: note]` render as visible dashed tags, so nothing unfinished
  can ship unnoticed. In dev, a small banner (bottom-left) counts what's left per file.
- A tool name in a project's `stack` must also appear in `stack.ts`. The build fails if not,
  because the orbit's "which projects used this" depends on it.
- Invalid content fails `npm run build` with a readable message, e.g.
  `content/projects.ts: flagship-one.links.live — Must be a URL, mailto: or /path`.

### Availability

`site.ts → availability.open`. Set it to `false` and the hero pill switches to `closedLabel`.

### Adding a real project

Replace a placeholder entry in `projects.ts`: set `status: 'real'`, fill in the text, and
swap the generative cover for a real image:

```ts
cover: {
  type: 'image',
  src: '/work/my-project/cover-1600.webp',              // fallback
  avif: '/work/my-project/cover-800.avif 800w, /work/my-project/cover-1600.avif 1600w',
  webp: '/work/my-project/cover-800.webp 800w, /work/my-project/cover-1600.webp 1600w',
  width: 1600, height: 900,                              // intrinsic size (no layout shift)
  color: '#2b2622',                                      // shown while loading
  alt: 'What the screenshot shows',
},
```

Put the files in `public/work/my-project/`. For the shared-element transition to stay
distortion-free, crop covers to **16:9** (desktop) with the subject roughly centred. Phones
crop the same image to 4:5. Videos use `{ type: 'video', src, poster, width, height, alt }`
and play muted only while on screen.

### Portrait

`about.ts → portrait`: replace the `{ type: 'placeholder' }` object with an image object
(same shape as above, portrait ratio 4:5). It gets a charcoal duotone that warms to colour on
hover.

### Replacing the CV

Drop your PDF at **`public/janith-godage-web-cv.pdf`** (keep the file name), then set
`site.ts → cv.placeholder` to `false`. `npm run assets` never overwrites a real CV: it only
replaces its own placeholder.

### Lab "view source" links

They point to `site.ts → repo.url` + the file path. Set `repo.url` to wherever this code
lives and `repo.placeholder` to `false`.

### GitHub strip

`scripts/github.mjs` fetches your latest public repos **at build time** (no token, no client
API calls) into `src/content/generated/github.json`. If the API is unreachable, the committed
JSON is kept.

---

## Environment variables

Copy `.env.example` to `.env`. Both variables are public (`VITE_` values end up in the
bundle), so never put secrets here.

| Variable             | Purpose                                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FORM_ENDPOINT` | Formspree/Resend-compatible URL that accepts a JSON `POST {name, email, message}`. **If unset, the form opens the visitor's mail app (`mailto:`) with the message filled in.** The origin is added to the CSP automatically. |
| `VITE_SITE_URL`      | Canonical origin (no trailing slash) for canonical URLs, OG tags and the sitemap. Defaults to `https://janithgodage.dev`.                                                                                                    |

---

## Deploying

**Vercel** (recommended): import the repo, set the env vars, done. `vercel.json` sets the
build, clean URLs, immutable caching for hashed assets, revalidated HTML, and security
headers.

**Netlify**: `netlify.toml` does the same. Unknown paths serve `dist/404.html` with a 404
status on both hosts.

After connecting a domain, set `VITE_SITE_URL` and rebuild. That updates canonical URLs, OG
image URLs and `sitemap.xml`.

---

## Quality budgets: measured results

Measured on this machine against the production build (`npm run preview`). Lighthouse
13.5, mobile preset, simulated slow 4G and 4× CPU. Numbers vary slightly between runs;
these are typical of 3–4 consecutive runs.

| Budget                                          | Target          | Result                                                                                                     |
| ----------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| Lighthouse Performance (home)                   | ≥ 95            | **98**                                                                                                     |
| Lighthouse Performance (case study)             | ≥ 95            | **98**                                                                                                     |
| Accessibility / Best Practices / SEO            | 100 / 100 / 100 | **100 / 100 / 100** (both routes)                                                                          |
| LCP                                             | < 2.0 s         | **1.8 s** (home), 1.8–1.9 s (case study)                                                                   |
| CLS                                             | < 0.02          | **0.002–0.003** typical; occasionally 0.015 on a case study as the preloader curtain exits (always < 0.02) |
| TBT (lab proxy for responsiveness)              | —               | **10–30 ms**                                                                                               |
| INP (Event Timing, 4× CPU, 8 real interactions) | < 200 ms        | **p98 160 ms** (worst case: opening ⌘K)                                                                    |
| Initial JS (entry + preloads)                   | ≤ 180 KB gzip   | **168.9 KB gzip** / 149.5 KB brotli, fetched after first paint                                             |
| Inlined CSS                                     | —               | 12.5 KB brotli                                                                                             |
| Home HTML (incl. CSS)                           | —               | 21.9 KB brotli                                                                                             |
| axe-core (WCAG 2.2 AA + best practices)         | 0               | **0 violations** in 11 scenarios (both themes, mobile, dialogs, form errors)                               |
| Keyboard walkthrough                            | all reachable   | 74 tab stops on the home page, every one with a visible clay focus ring; ⌘K and Esc verified               |
| Reduced motion                                  | —               | Preloader is a short fade (under 600 ms); no smooth scroll, WebGL, parallax or marquee travel              |
| Cypress smoke suite                             | pass            | **14 / 14**                                                                                                |

Lazy chunks (gzip), each loaded only when needed: p5 311 KB (on "Start sketch"),
Three.js blob 128 KB (idle, capable GPUs only), Tone.js 77 KB (first key press or sound on),
Leaflet 43 KB, Framer features 27 KB, Zod + RHF form 25 + 13 KB, Swiper 22 KB (touch
layouts), D3 orbit 16 KB, Sortable 12 KB, Radix dialogs 11 KB, Locomotive 8 KB (skipped with
reduced motion).

Caveat, stated honestly: headless Chrome renders WebGL in software, and the site
deliberately serves the SVG blob to software renderers. So **Lighthouse measures the
fallback**. On GPU devices the WebGL blob loads after idle, outside the LCP and TBT windows.
Real-world numbers also depend on the host and CDN; re-run Lighthouse on the deployed URL.

---

## Testing

- **Cypress** (`cypress/e2e`): navigation and section scrolling, skip link, mobile menu
  dialog, ⌘K palette, preloader skip, theme toggle and persistence, form validation (inline
  aria errors and focus), mailto hand-off, honeypot, copy-to-clipboard toast, case-study
  round trip with scroll restoration, prerendered direct loads, next-project link, 404.
- **Storybook** (`src/components/primitives/*.stories.tsx`): Button, Magnetic, Marquee,
  SectionHeading, Tag, ProjectRow, TextRoll, with a charcoal/paper theme switcher in the
  toolbar.

## Keyboard shortcuts (the easter egg)

Press `?`, or type `dev`. `⌘/Ctrl K` opens the palette, `T` toggles the theme, `S` toggles
sound, and `1`–`6` jump to sections.

## Project structure

```
src/
  content/        typed, Zod-validated content (edit these)
  engine/         scroll engine, GSAP setup, transitions, media/viewport hooks, keys
  stores/         Zustand + Immer UI store
  components/
    primitives/   design-system pieces (+ stories)
    chrome/       header, HUD, cursor, preloader, palette, transitions, footer…
    sections/     hero, marquee, work, services, stack viz, lab, about, contact
    art/ three/ lab/
  routes/         Home, CaseStudy, NotFound
  entry-server.tsx  SSR entry for prerendering
scripts/          prerender, serve, og/favicons, cv, github, lighthouse, axe, walkthrough, inp, shoot
cypress/          e2e smoke suite
public/           favicons, og.png, CV, geo outline, manifest
```
