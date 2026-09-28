/**
 * Build-time fetch of public GitHub activity for the "recently shipped" strip.
 * No token, no client-side API calls. On any failure the committed JSON is kept as-is.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const USER = 'jay6869'
const OUT = new URL('../src/content/generated/github.json', import.meta.url)

async function main() {
  const res = await fetch(
    `https://api.github.com/users/${USER}/repos?sort=pushed&per_page=12&type=owner`,
    {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'janith-portfolio-build' },
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json()
  const repos = data
    .filter((r) => !r.fork && !r.private)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      language: r.language ?? '',
      url: r.html_url,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count,
    }))
  writeFileSync(
    OUT,
    JSON.stringify({ user: USER, fetchedAt: new Date().toISOString(), repos }, null, 2) + '\n',
  )
  console.log(`github: wrote ${repos.length} repos`)
}

main().catch((e) => {
  if (!existsSync(OUT))
    writeFileSync(OUT, JSON.stringify({ user: USER, fetchedAt: null, repos: [] }, null, 2) + '\n')
  else readFileSync(OUT)
  console.warn(`github: kept existing fallback (${e.message})`)
})
