/**
 * Production-like static server for dist/ (what `npm run preview` uses, and what Lighthouse
 * and Cypress run against). Mirrors the hosting config: prerendered directories, 404.html with
 * a real 404, brotli/gzip compression, immutable hashed assets, security headers.
 *
 *   node scripts/serve.mjs [--port 4173]
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { brotliCompressSync, gzipSync, constants } from 'node:zlib'

const port = Number(process.argv[process.argv.indexOf('--port') + 1]) || 4173
const dist = join(process.cwd(), 'dist')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4',
}
const compressible = /\.(html|js|css|json|webmanifest|svg|xml|txt)$/
const cache = new Map()

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '')
  const direct = join(dist, clean)
  if (!direct.startsWith(dist)) return null
  if (existsSync(direct) && statSync(direct).isFile()) return direct
  for (const f of [join(direct, 'index.html'), `${direct.replace(/\/$/, '')}.html`])
    if (existsSync(f)) return f
  return null
}

createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  let file = resolveFile(path)
  let status = 200
  if (!file) {
    file = join(dist, '404.html')
    status = 404
  }
  const ext = extname(file)
  const accept = String(req.headers['accept-encoding'] ?? '')
  const enc = compressible.test(file)
    ? accept.includes('br')
      ? 'br'
      : accept.includes('gzip')
        ? 'gzip'
        : null
    : null
  const key = `${file}|${statSync(file).mtimeMs}|${enc}` // mtime: never serve a stale build
  let body = cache.get(key)
  if (!body) {
    const raw = readFileSync(file)
    body =
      enc === 'br'
        ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } })
        : enc === 'gzip'
          ? gzipSync(raw, { level: 9 })
          : raw
    cache.set(key, body)
  }
  res.statusCode = status
  res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream')
  if (enc) res.setHeader('Content-Encoding', enc)
  res.setHeader('Vary', 'Accept-Encoding')
  res.setHeader(
    'Cache-Control',
    path.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.end(req.method === 'HEAD' ? undefined : body)
}).listen(port, () => console.log(`serving dist/ on http://localhost:${port}`))
