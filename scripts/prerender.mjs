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

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const siteUrl = ssr.site.seo.siteUrl.replace(/\/$/, '')

// CSP: allow exactly the inline head script (by hash), nothing else inline.
const inline = template.match(/<script>([\s\S]*?)<\/script>/)
const scriptHash = inline
  ? `'sha256-${createHash('sha256').update(inline[1]).digest('base64')}'`
  : ''
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
