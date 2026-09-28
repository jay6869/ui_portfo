/**
 * Prerender every route to static HTML (hydrated on the client). Also validates content with
 * Zod — invalid content fails the build — and writes sitemap.xml + robots.txt.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssr = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)

const errors = ssr.validateContent()
if (errors.length) {
  console.error(`\n✖ Content validation failed:\n  ${errors.join('\n  ')}\n`)
  process.exit(1)
}

// Inline the entry stylesheet: first paint then needs nothing but the HTML (no render-blocking
// request competing with the JS module preloads on slow connections). Lazy chunks keep theirs.
let template = readFileSync(join(dist, 'index.html'), 'utf8').replace(
  /<link rel="stylesheet"[^>]*href="(\/assets\/index-[^"]+\.css)"[^>]*>/,
  (_m, href) => `<style>${readFileSync(join(dist, href), 'utf8')}</style>`,
)
// Start fetching JS only after first paint. The page is fully prerendered and the intro is pure
// CSS, so nothing visible waits on JS; this keeps ~150KB of module downloads from competing
// with first paint on slow connections. The loader re-adds the same modulepreloads (no
// waterfall) and imports the entry on the frame after first paint.
{
  const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
  const preloads = [
    ...template.matchAll(/<link rel="modulepreload" crossorigin href="([^"]+)">/g),
  ].map((m) => m[1])
  if (entry) {
    // Waits for the actual first *contentful* paint (not merely the first frame), with a
    // double-rAF fallback where paint timing is unsupported and a safety timer.
    const loader =
      `const d=document,p=${JSON.stringify(preloads)};let s=0;` +
      `const go=()=>{if(s)return;s=1;for(const h of p){const l=d.createElement('link');l.rel='modulepreload';l.href=h;l.crossOrigin='';d.head.append(l)}import(${JSON.stringify(entry[1])})};` +
      `const soon=()=>setTimeout(go,0);` +
      `if(performance.getEntriesByName('first-contentful-paint').length)soon();` +
      `else if((PerformanceObserver.supportedEntryTypes||[]).includes('paint'))new PerformanceObserver((l,o)=>{if(l.getEntriesByName('first-contentful-paint').length){o.disconnect();soon()}}).observe({type:'paint',buffered:true});` +
      `else requestAnimationFrame(()=>requestAnimationFrame(soon));` +
      `setTimeout(go,3000)`
    template = template
      .replace(entry[0], '')
      .replace(/\s*<link rel="modulepreload" crossorigin href="[^"]+">/g, '')
      .replace('</body>', `  <script type="module">${loader}</script>\n  </body>`)
  }
  // Body text renders fine in its metric-matched fallback until Hanken arrives; only the
  // display face (the hero name) is worth a preload.
  template = template.replace(/\s*<link rel="preload" as="font"[^>]*hanken[^>]*>/, '')
}
const siteUrl = ssr.site.seo.siteUrl.replace(/\/$/, '')

// CSP: allow exactly our two inline scripts (head bootstrap + JS loader) by hash, nothing else.
const scriptHash = [...template.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)]
  .map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
  .join(' ')
const formOrigin = (() => {
  try {
    return process.env.VITE_FORM_ENDPOINT ? new URL(process.env.VITE_FORM_ENDPOINT).origin : ''
  } catch {
    return ''
  }
})()
const csp = [
  "default-src 'self'",
  `script-src 'self' ${scriptHash} 'wasm-unsafe-eval' blob:`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${formOrigin}`.trim(),
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' mailto: ${formOrigin}`.trim(),
  'upgrade-insecure-requests',
].join('; ')

const routes = [
  { url: '/', file: 'index.html' },
  ...ssr.projects.map((p) => ({ url: `/work/${p.slug}`, file: `work/${p.slug}/index.html` })),
  { url: '/404', file: '404.html' },
]

for (const r of routes) {
  const { html, head } = await ssr.render(r.url)
  const page = template
    .replace(
      '<!--app-head-->',
      `<meta http-equiv="Content-Security-Policy" content="${csp}" />\n    ${head}`,
    )
    .replace('<!--app-html-->', html)
  const out = join(dist, r.file)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, page)
  console.log(
    `prerendered ${r.url.padEnd(24)} → dist/${r.file} (${(page.length / 1024).toFixed(1)} KB)`,
  )
}

const today = new Date().toISOString().slice(0, 10)
const urls = routes.filter((r) => r.url !== '/404')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (r) =>
        `  <url><loc>${siteUrl}${r.url === '/' ? '/' : r.url}</loc><lastmod>${today}</lastmod></url>`,
    )
    .join('\n')}\n</urlset>\n`,
)
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
)
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log('sitemap.xml, robots.txt written')
