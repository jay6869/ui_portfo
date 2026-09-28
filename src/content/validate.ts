/**
 * Runtime validation of every content file. Imported dynamically in dev (main.tsx) and by the
 * prerender step at build time, so Zod never lands in the production client bundle.
 */
import { z } from 'zod'
import {
  aboutSchema,
  labSchema,
  projectSchema,
  serviceSchema,
  siteSchema,
  stackSchema,
} from './schema'
import { site } from './site'
import { projects } from './projects'
import { services } from './services'
import { stack } from './stack'
import { lab } from './lab'
import { about } from './about'

export function validateContent(): string[] {
  const errors: string[] = []
  const check = (file: string, schema: z.ZodType, data: unknown) => {
    const r = schema.safeParse(data)
    if (!r.success) {
      for (const issue of r.error.issues) {
        errors.push(`content/${file}: ${issue.path.join('.') || '(root)'} — ${issue.message}`)
      }
    }
  }
  check('site.ts', siteSchema, site)
  check('projects.ts', z.array(projectSchema).min(1), projects)
  check('services.ts', z.array(serviceSchema).min(1), services)
  check('stack.ts', stackSchema, stack)
  check('lab.ts', z.array(labSchema), lab)
  check('about.ts', aboutSchema, about)

  // Cross-file integrity checks
  const slugs = new Set<string>()
  for (const p of projects) {
    if (slugs.has(p.slug)) errors.push(`content/projects.ts: duplicate slug "${p.slug}"`)
    slugs.add(p.slug)
  }
  const known = new Set(stack.layers.flatMap((l) => l.tools))
  for (const p of projects) {
    for (const t of p.stack) {
      if (!known.has(t))
        errors.push(`content/projects.ts: "${p.slug}" uses "${t}", which is not in stack.ts layers`)
    }
  }
  for (const s of services) {
    if (!s.title.includes(s.emphasis))
      errors.push(`content/services.ts: "${s.id}" emphasis "${s.emphasis}" is not in its title`)
  }
  return errors
}
