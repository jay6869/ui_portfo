/**
 * Screenshot helper for design reviews (uses the system Chrome through playwright-core).
 *
 *   node scripts/shoot.mjs --name hero [--url http://localhost:5173/] [--widths 375,768,1440,1920]
 *        [--selector "#work"] [--full] [--wait 1500] [--theme paper] [--reduced] [--preloader]
 *        [--hover "selector"] [--scroll 1200]
 *
 * Output: .shots/<name>-<width>.png
 */
import { mkdirSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright-core'

const { values: a } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:5173/' },
    name: { type: 'string', default: 'shot' },
    widths: { type: 'string', default: '375,768,1440,1920' },
    selector: { type: 'string' },
    full: { type: 'boolean', default: false },
    wait: { type: 'string', default: '1200' },
    theme: { type: 'string' },
    reduced: { type: 'boolean', default: false },
    preloader: { type: 'boolean', default: false },
    hover: { type: 'string' },
    scroll: { type: 'string' },
    height: { type: 'string' },
  },
})

const executablePath = process.env.CHROME_PATH || '/usr/bin/google-chrome-stable'
const browser = await chromium.launch({ executablePath, args: ['--enable-webgl', '--ignore-gpu-blocklist'] })
mkdirSync('.shots', { recursive: true })
const heights = { 375: 812, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 }
const errors = []

for (const w of a.widths.split(',').map(Number)) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: Number(a.height) || heights[w] || 900 },
    deviceScaleFactor: 1,
    reducedMotion: a.reduced ? 'reduce' : 'no-preference',
    colorScheme: a.theme === 'paper' ? 'light' : 'dark',
    hasTouch: w < 768,
    isMobile: w < 768,
  })
  await ctx.addInitScript(
    ({ preloader, theme }) => {
      if (!preloader) sessionStorage.setItem('jg:seen', '1')
      if (theme) localStorage.setItem('jg:theme', theme)
    },
    { preloader: a.preloader, theme: a.theme ?? null },
  )
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${w}] ${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${w}] pageerror: ${e.message}`))
  await page.goto(a.url, { waitUntil: 'networkidle' })
  if (a.selector) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel)
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
    }, a.selector)
  }
  if (a.scroll) await page.evaluate((y) => window.scrollTo(0, y), Number(a.scroll))
  if (a.hover) await page.hover(a.hover).catch(() => {})
  await page.waitForTimeout(Number(a.wait))
  const path = `.shots/${a.name}-${w}.png`
  await page.screenshot({ path, fullPage: a.full })
  console.log(path)
  await ctx.close()
}
await browser.close()
if (errors.length) {
  console.log('\nConsole problems:')
  for (const e of [...new Set(errors)]) console.log(' ', e)
}
