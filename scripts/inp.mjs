/**
 * Interaction latency (Event Timing, what INP is computed from) under a 4× CPU throttle.
 *   node scripts/inp.mjs
 */
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addInitScript(() => {
  sessionStorage.setItem('jg:seen', '1')
  window.__events = []
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) if (e.interactionId) window.__events.push({ name: e.name, d: Math.round(e.duration), target: e.target?.tagName })
  }).observe({ type: 'event', durationThreshold: 16, buffered: true })
})
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__jgHydrated === true)
await page.waitForTimeout(1500)

const steps = {
  'theme toggle (View Transition)': async () => page.click('header button[aria-label^="Paper theme"]'),
  'open ⌘K palette': async () => page.keyboard.press('Control+k'),
  'type in palette': async () => page.keyboard.type('lab'),
  'Enter → scroll to Lab': async () => page.keyboard.press('Enter'),
  'stack viz: pin a tool': async () => {
    await page.evaluate(() => document.getElementById('stack')?.scrollIntoView())
    await page.waitForTimeout(1200)
    await page.click('#stack button:has-text("GSAP")')
  },
  'contact: type name': async () => {
    await page.evaluate(() => document.getElementById('contact-form')?.scrollIntoView())
    await page.waitForTimeout(1500)
    await page.click('#cf-name')
    await page.keyboard.type('Ada')
  },
  'contact: submit (validation)': async () => page.click('#contact-form button[type=submit]'),
  'lab: specimen keyboard reorder': async () => {
    await page.evaluate(() => document.getElementById('lab')?.scrollIntoView())
    await page.waitForTimeout(1000)
    await page.focus('#lab [data-id="specimen"] li:first-child button')
    await page.keyboard.press('ArrowRight')
  },
}
const results = []
for (const [label, run] of Object.entries(steps)) {
  const before = await page.evaluate(() => window.__events.length)
  await run()
  await page.waitForTimeout(700)
  const evs = await page.evaluate((n) => window.__events.slice(n), before)
  const worst = evs.reduce((m, e) => Math.max(m, e.d), 0)
  results.push([label, worst])
  console.log(`${label.padEnd(34)} worst event ${String(worst).padStart(4)} ms`)
}
const all = await page.evaluate(() => window.__events.map((e) => e.d).sort((a, b) => b - a))
console.log(`\nINP-style (p98 of all interactions, 4× CPU): ${all[Math.floor(all.length * 0.02)] ?? 0} ms · max ${all[0] ?? 0} ms · ${all.length} events ≥16ms`)
await browser.close()
