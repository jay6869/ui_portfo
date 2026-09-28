/**
 * axe-core accessibility audit against the local production server (npm run preview).
 * Covers both themes, lazy sections (scrolled into view), and every dialog open.
 *   node scripts/axe.mjs
 */
import { chromium } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
})
let failures = 0

async function audit(label, { path = '/', width = 1440, theme = 'charcoal', setup } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: theme === 'paper' ? 'light' : 'dark',
  })
  await ctx.addInitScript((t) => {
    sessionStorage.setItem('jg:seen', '1')
    localStorage.setItem('jg:theme', t)
  }, theme)
  const page = await ctx.newPage()
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // Walk the page so lazy sections (viz, lab, map, form) mount and reveals finish
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
  if (setup) await setup(page)
  const res = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  const v = res.violations
  failures += v.length
  console.log(
    `${v.length ? '✖' : '✔'} ${label.padEnd(34)} ${v.length} violations, ${res.passes.length} rules passed`,
  )
  for (const x of v) {
    console.log(`   - [${x.impact}] ${x.id}: ${x.help}`)
    for (const n of x.nodes.slice(0, 3))
      console.log(`       ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1] ?? ''}`)
  }
  await ctx.close()
}

await audit('home · charcoal · desktop')
await audit('home · paper · desktop', { theme: 'paper' })
await audit('home · charcoal · mobile', { width: 375 })
await audit('home · paper · mobile', { width: 375, theme: 'paper' })
await audit('case study · charcoal', { path: '/work/flagship-one' })
await audit('case study · paper', { path: '/work/flagship-two', theme: 'paper' })
await audit('404', { path: '/nope' })
await audit('command palette open', {
  setup: async (p) => (await p.keyboard.press('Control+k'), p.waitForTimeout(500)),
})
await audit('shortcuts sheet open', {
  setup: async (p) => (await p.keyboard.press('Shift+Slash'), p.waitForTimeout(500)),
})
await audit('mobile menu open', {
  width: 375,
  setup: async (p) => (await p.click('button[aria-haspopup="dialog"]'), p.waitForTimeout(700)),
})
await audit('form errors shown', {
  setup: async (p) => {
    await p.evaluate(() => document.getElementById('contact-form')?.scrollIntoView())
    await p.waitForTimeout(800)
    await p.click('#contact-form button[type=submit]')
    await p.waitForTimeout(400)
  },
})
await browser.close()
console.log(failures ? `\n${failures} violation groups` : '\nNo axe violations.')
process.exit(failures ? 1 : 0)
