import { projects } from '@/content/projects'
import { stack } from '@/content/stack'
import { stripTokens } from '@/lib/text'

export interface ToolInfo {
  name: string
  layer: string
  layerIndex: number
  projects: Array<{ slug: string; title: string }>
  /** Other tools used in the same projects */
  related: string[]
}

/** Everything the visual shows is derived from content/projects.ts + content/stack.ts. */
export function buildToolData(): ToolInfo[] {
  // Plain reduce: lodash's groupBy drags ~20KB of iteratee machinery into the initial bundle
  type Use = { tool: string; slug: string; title: string; stack: string[] }
  const byTool = projects
    .flatMap((p) =>
      p.stack.map((tool) => ({ tool, slug: p.slug, title: stripTokens(p.title), stack: p.stack })),
    )
    .reduce<Record<string, Use[]>>((acc, u) => {
      ;(acc[u.tool] ??= []).push(u)
      return acc
    }, {})
  return stack.layers.flatMap((layer, layerIndex) =>
    layer.tools.map((name) => {
      const uses = byTool[name] ?? []
      const related = new Set(uses.flatMap((u) => u.stack))
      related.delete(name)
      return {
        name,
        layer: layer.label,
        layerIndex,
        projects: uses.map((u) => ({ slug: u.slug, title: u.title })),
        related: [...related],
      }
    }),
  )
}
