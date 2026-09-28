import type { LabItem } from './schema'

/** Lab experiments. `source` is a path inside the site repo (see site.repo). */
export const lab = [
  {
    id: 'loom',
    title: 'Loom',
    blurb:
      'A flow field that weaves threads in the site palette. Move the pointer to pull them around; click for a new pattern.',
    tags: ['p5.js', 'generative'],
    source: 'src/components/lab/P5Loom.tsx',
    action: 'Start sketch',
  },
  {
    id: 'specimen',
    title: 'Type specimen',
    blurb: 'Drag the letters back into order. There is no prize. I checked.',
    tags: ['Sortable.js', 'drag'],
    source: 'src/components/lab/SortSpecimen.tsx',
    action: 'Shuffle',
  },
  {
    id: 'keys',
    title: 'Pentatonic keys',
    blurb: 'Eight notes that cannot sound wrong together. Silent until you press something.',
    tags: ['Tone.js', 'sound'],
    source: 'src/components/lab/ToneKeys.tsx',
    action: 'Turn on',
  },
  {
    id: 'tape',
    title: 'Tape measure',
    blurb:
      'Scroll inside the card. A ruler driven entirely by CSS scroll-driven animations — zero JavaScript.',
    tags: ['CSS', 'scroll-timeline'],
    source: 'src/components/lab/TapeMeasure.tsx',
    action: 'Scroll it',
  },
] satisfies LabItem[]
