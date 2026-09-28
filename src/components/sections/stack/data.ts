import groupBy from 'lodash-es/groupBy'
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
  const byTool = groupBy(
    projects.flatMap((p) =>
      p.stack.map((tool) => ({ tool, slug: p.slug, title: stripTokens(p.title), stack: p.stack })),
    ),
    'tool',
  )
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
