import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

/**
 * Preload the fonts that paint above the fold. Their hashed file names only exist after
 * bundling, so the <link rel="preload"> tags are injected from the final bundle.
 */
function preloadCriticalFonts(patterns: RegExp[]): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return []
        return Object.keys(ctx.bundle)
          .filter((file) => patterns.some((p) => p.test(file)))
          .map((file) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: `/${file}`,
              crossorigin: '',
            },
            injectTo: 'head-prepend' as const,
          }))
      },
    },
  }
}

/**
 * `vite preview` behaves like the production host: prerendered directories are served as-is
 * and unknown paths get dist/404.html with a real 404 status (no SPA fallback).
 */
function previewLikeHost(): Plugin {
  return {
    name: 'preview-like-host',
    configurePreviewServer(server) {
      const dist = resolve('dist')
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? '/').split('?')[0]!)
        if (req.method !== 'GET' || /\.[a-z0-9]+$/i.test(path)) return next()
        const candidates = [
          join(dist, path, 'index.html'),
          join(dist, `${path.replace(/\/$/, '')}.html`),
        ]
        const hit = candidates.find((f) => f.startsWith(dist) && existsSync(f))
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        if (hit) return res.end(readFileSync(hit))
        res.statusCode = 404
        res.end(readFileSync(join(dist, '404.html')))
      })
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    previewLikeHost(),
    react(),
    preloadCriticalFonts([
      /instrument-serif-latin-400-normal.*\.woff2$/,
      /hanken-grotesk-latin-wght-normal.*\.woff2$/,
    ]),
    process.env.ANALYZE && !isSsrBuild
      ? visualizer({
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true,
          template: process.env.ANALYZE === 'json' ? 'raw-data' : 'treemap',
        })
      : null,
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    sourcemap: false,
    reportCompressedSize: true,
  },
  ssr: {
    // Browser-only libraries are always dynamically imported inside effects, so SSR never runs
    // them. Bundling these keeps CSS-in-package imports working during prerender.
    noExternal: ['swiper', 'leaflet', 'react-helmet-async'],
  },
  server: { port: 5173 },
}))
