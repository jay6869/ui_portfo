/**
 * Lighthouse (mobile, simulated throttling) against the local production server.
 *   node scripts/lh.mjs [/path ...]   → .lighthouse/<name>.json + summary
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/work/flagship-one']
mkdirSync('.lighthouse', { recursive: true })
for (const p of paths) {
  const name = p === '/' ? 'home' : p.replace(/\W+/g, '-').replace(/^-|-$/g, '')
  const out = `.lighthouse/${name}.json`
  execFileSync(
    'npx',
    [
      '-y',
      'lighthouse@13.5.0',
      `http://localhost:4173${p}`,
      '--chrome-flags=--headless=new',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      },
    },
  )
  const r = JSON.parse(readFileSync(out, 'utf8'))
  const s = (k) => Math.round(r.categories[k].score * 100)
  const a = (id) => r.audits[id].displayValue
  console.log(
    `${p.padEnd(22)} perf ${s('performance')} · a11y ${s('accessibility')} · bp ${s('best-practices')} · seo ${s('seo')} | ` +
      `FCP ${a('first-contentful-paint')} · LCP ${a('largest-contentful-paint')} · TBT ${a('total-blocking-time')} · CLS ${a('cumulative-layout-shift')} · SI ${a('speed-index')}`,
  )
}
