import { site } from './site'
import { projects } from './projects'
import { services } from './services'
import { lab } from './lab'
import { about } from './about'

export const PLACEHOLDER_RE = /\[(PLACEHOLDER|EDIT ME)(?::\s*([^\]]*))?\]/g

function countStrings(value: unknown): number {
  if (typeof value === 'string') return value.match(PLACEHOLDER_RE)?.length ?? 0
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + countStrings(v), 0)
  if (value && typeof value === 'object')
    return Object.values(value).reduce<number>((n, v) => n + countStrings(v), 0)
  return 0
}

export interface PlaceholderReport {
  file: string
  count: number
  notes: string[]
}

/** Everything still waiting for real content. Shown by the dev-only banner. */
export function placeholderReport(): PlaceholderReport[] {
  const siteNotes: string[] = []
  if (site.cv.placeholder) siteNotes.push('CV PDF is a placeholder')
  if (site.repo.placeholder) siteNotes.push('Repo URL for Lab "view source" links is a guess')
  if (!import.meta.env.VITE_FORM_ENDPOINT)
    siteNotes.push('VITE_FORM_ENDPOINT unset → form falls back to mailto:')

  const projectNotes: string[] = []
  const placeholderProjects = projects.filter((p) => p.status === 'placeholder').length
  if (placeholderProjects) projectNotes.push(`${placeholderProjects} placeholder projects`)
  const artCovers = projects.filter((p) => p.cover.type === 'art').length
  if (artCovers) projectNotes.push(`${artCovers} generative covers (no screenshots yet)`)
  const noLinks = projects.filter((p) => !p.links.live && !p.links.repo).length
  if (noLinks) projectNotes.push(`${noLinks} projects without live/repo links`)

  const aboutNotes: string[] = []
  if (about.portrait.type === 'placeholder') aboutNotes.push('Portrait is a placeholder')

  return [
    { file: 'site.ts', count: countStrings(site), notes: siteNotes },
    { file: 'projects.ts', count: countStrings(projects), notes: projectNotes },
    { file: 'services.ts', count: countStrings(services), notes: [] },
    { file: 'lab.ts', count: countStrings(lab), notes: [] },
    { file: 'about.ts', count: countStrings(about), notes: aboutNotes },
  ].filter((r) => r.count > 0 || r.notes.length > 0)
}
