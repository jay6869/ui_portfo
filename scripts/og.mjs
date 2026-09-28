/**
 * Build-time brand assets, in the site style, from the real fonts:
 *   public/og.png (1200×630), public/favicon.svg, favicon-32.png, apple-touch-icon.png,
 *   icon-192.png, icon-512.png, site.webmanifest
 * Run with `npm run assets` after changing the name or palette.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const font = (p) => readFileSync(new URL(`../node_modules/${p}`, import.meta.url))
const fonts = [
  {
    name: 'Serif',
    data: font('@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff'),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Serif',
    data: font('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff'),
    weight: 400,
    style: 'italic',
  },
  {
    name: 'Mono',
    data: font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Sans',
    data: font('@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff'),
    weight: 400,
    style: 'normal',
  },
]
const C = {
  ink: '#1d1c1a',
  deep: '#131211',
  raised: '#262523',
  bone: '#ECE6DA',
  dim: '#A39E93',
  clay: '#E8956A',
  sage: '#A8B5A0',
  line: 'rgba(236,230,218,0.12)',
}
const h = (type, style, ...children) => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
})
const png = (svg, width, out) =>
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng())

// ── OG image ─────────────────────────────────────────────────────────────────
const mono = {
  fontFamily: 'Mono',
  fontSize: 20,
  letterSpacing: 3,
  color: C.dim,
  textTransform: 'uppercase',
}
const og = h(
  'div',
  {
    width: 1200,
    height: 630,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '56px 64px',
    background: C.ink,
    backgroundImage: `radial-gradient(circle at 12% 0%, rgba(232,149,106,0.16), rgba(29,28,26,0) 55%)`,
    color: C.bone,
    position: 'relative',
  },
  h(
    'div',
    { display: 'flex', justifyContent: 'space-between', ...mono },
    h('span', {}, 'Web developer · Front-end & creative'),
    h('span', { color: C.clay }, 'JG'),
  ),
  h('div', {
    position: 'absolute',
    right: 70,
    top: 120,
    width: 300,
    height: 300,
    borderRadius: 300,
    display: 'flex',
    backgroundImage:
      'radial-gradient(circle at 35% 30%, #6b665d 0%, #3a3733 28%, #201f1d 62%, #141312 100%)',
    boxShadow: '18px 10px 40px rgba(232,149,106,0.28)',
  }),
  h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Serif',
      fontSize: 190,
      lineHeight: 0.84,
      letterSpacing: -5,
    },
    h(
      'div',
      { display: 'flex' },
      h('span', { fontStyle: 'italic', color: C.clay }, 'J'),
      h('span', {}, 'anith'),
    ),
    h('div', { display: 'flex', paddingLeft: 190 }, 'Godage'),
  ),
  h(
    'div',
    {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: `1px solid ${C.line}`,
      paddingTop: 22,
      ...mono,
    },
    h(
      'span',
      { display: 'flex', alignItems: 'center' },
      h('span', { width: 10, height: 10, borderRadius: 10, background: C.sage, marginRight: 14 }),
      'Sri Lanka · GMT+5:30',
    ),
    h('span', {}, 'Fast, careful websites'),
  ),
)
const ogSvg = await satori(og, { width: 1200, height: 630, fonts })
png(ogSvg, 1200, 'public/og.png')

// ── Favicons: italic clay J + bone G on charcoal ─────────────────────────────
const mark = (size) =>
  h(
    'div',
    {
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: C.ink,
      borderRadius: size * 0.22,
      fontFamily: 'Serif',
      fontSize: size * 0.62,
      letterSpacing: -size * 0.02,
      color: C.bone,
      paddingBottom: size * 0.04,
    },
    h('span', { fontStyle: 'italic', color: C.clay, marginRight: -size * 0.02 }, 'J'),
    h('span', {}, 'G'),
  )
const favSvg = await satori(mark(64), { width: 64, height: 64, fonts })
writeFileSync('public/favicon.svg', favSvg)
png(favSvg, 32, 'public/favicon-32.png')
const bigSvg = await satori(mark(512), { width: 512, height: 512, fonts })
png(bigSvg, 180, 'public/apple-touch-icon.png')
png(bigSvg, 192, 'public/icon-192.png')
png(bigSvg, 512, 'public/icon-512.png')

writeFileSync(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Janith Godage',
      short_name: 'JG',
      description: 'Web developer — front-end & creative development',
      start_url: '/',
      display: 'browser',
      background_color: C.ink,
      theme_color: C.ink,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ) + '\n',
)
console.log('og.png, favicons and manifest written to public/')
