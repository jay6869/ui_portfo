/**
 * Keyboard-only + reduced-motion walkthroughs against the production server.
 *   node scripts/walkthrough.mjs
 */
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
})
let problems = 0

// ── Keyboard: tab through everything ─────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => sessionStorage.setItem('jg:seen', '1'))
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const seen = []
  const issues = []
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const labelled =
        'labels' in el && el.labels && el.labels.length ? el.labels[0].textContent : ''
      const visual = el.querySelector?.('.sr-only')
        ? el.querySelector('.sr-only').textContent
        : el.textContent
      const name = (
        el.getAttribute('aria-label') ||
        labelled ||
        visual ||
        el.getAttribute('title') ||
        ''
      )
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 40)
      const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0
      const shadow = cs.boxShadow && cs.boxShadow !== 'none'
      return {
        tag: el.tagName.toLowerCase(),
        name,
        ring: ring || shadow,
        w: r.width,
        h: r.height,
        id: el.id,
      }
    })
    if (!info) break
    const key = `${info.tag}:${info.name}:${info.id}`
    if (seen.length && seen[0] === key) break // wrapped around
    seen.push(key)
    if (!info.ring) issues.push(`no visible focus: ${key}`)
    if (info.w < 1 || info.h < 1) issues.push(`zero-size focus target: ${key}`)
    if (!info.name) issues.push(`no accessible text: ${key}`)
  }
  console.log(`Keyboard: ${seen.length} tab stops on the home page`)
  console.log(
    '  first stops:',
    seen
      .slice(0, 8)
      .map((s) => s.split(':').slice(0, 2).join(' '))
      .join(' → '),
  )
  for (const x of issues) console.log('  ✖', x)
  problems += issues.length
  // Escape closes palette and returns focus
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(400)
  const opened = await page.locator('[role=dialog]').count()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const closed = await page.locator('[role=dialog]').count()
  console.log(`  palette opens with Ctrl+K (${opened === 1}) and closes with Esc (${closed === 0})`)
  if (opened !== 1 || closed !== 0) problems++
  await page.close()
}

// ── Reduced motion ───────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  const t0 = Date.now()
  await page.goto(BASE + '/', { waitUntil: 'commit' })
  const mode = await page.evaluate(() => document.documentElement.getAttribute('data-preloader'))
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-preloader'), null, {
    timeout: 3000,
  })
  const preloaderMs = Date.now() - t0
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  const state = await page.evaluate(() => ({
    smooth: document.documentElement.classList.contains('lenis'),
    webgl:
      !!document.querySelector('[class*="HeroBlob"] canvas, canvas[data-engine]') ||
      !!document.querySelector('#top canvas'),
    marqueeTransform: getComputedStyle(
      document.querySelector('#top ~ * [class*="track"]') || document.body,
    ).transform,
  }))
  const ok =
    mode === 'short' &&
    !state.smooth &&
    !state.webgl &&
    (state.marqueeTransform === 'none' ||
      state.marqueeTransform.startsWith('matrix(1, 0, 0, 1, 0, 0)'))
  console.log(
    `Reduced motion: preloader=${mode} (gone after ~${preloaderMs}ms incl. load), smooth scroll=${state.smooth}, WebGL=${state.webgl}, marquee transform=${state.marqueeTransform}`,
  )
  if (!ok) problems++
  await ctx.close()
}

await browser.close()
console.log(problems ? `\n${problems} problem(s)` : '\nWalkthroughs clean.')
process.exit(problems ? 1 : 0)
