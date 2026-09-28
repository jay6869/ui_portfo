import type { SVGProps } from 'react'

/** A handful of hand-drawn line icons. 1.25px strokes, currentColor, no icon library. */
type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
})

export const ArrowUpRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
  </svg>
)
export const ArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2.5 8h11M9.5 4l4 4-4 4" />
  </svg>
)
export const ArrowDown = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 2.5v11M4 9.5l4 4 4-4" />
  </svg>
)
export const ArrowUp = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 13.5v-11M4 6.5l4-4 4 4" />
  </svg>
)
export const ArrowLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13.5 8h-11M6.5 4l-4 4 4 4" />
  </svg>
)
/** Half-filled disc: the theme toggle. */
export const ThemeIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 2.5a5.5 5.5 0 0 1 0 11Z" fill="currentColor" stroke="none" />
  </svg>
)
export const SoundIcon = ({ size, on = false, ...p }: P & { on?: boolean }) => (
  <svg {...base(size)} {...p}>
    <path d="M2.5 6.2h2.2L8 3.5v9L4.7 9.8H2.5Z" />
    {on ? (
      <path d="M10.5 6a2.8 2.8 0 0 1 0 4M12.3 4.3a5.2 5.2 0 0 1 0 7.4" />
    ) : (
      <path d="M10.5 6.2l3 3.6M13.5 6.2l-3 3.6" />
    )}
  </svg>
)
export const CopyIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
    <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </svg>
)
export const CheckIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
)
export const CloseIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
)
export const SearchIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5l3 3" />
  </svg>
)
export const DownloadIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" />
  </svg>
)
