import s from './BlobFallback.module.css'

/**
 * Static stand-in for the WebGL blob (and the poster it fades in over): a grain-shaded sphere,
 * charcoal body, bone highlight, clay rim-light. Pure SVG, ~1KB.
 */
export function BlobFallback() {
  return (
    <svg className={s.blob} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="blob-body" cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#6b665d" />
          <stop offset="28%" stopColor="#3a3733" />
          <stop offset="62%" stopColor="#201f1d" />
          <stop offset="100%" stopColor="#141312" />
        </radialGradient>
        <radialGradient id="blob-rim" cx="30%" cy="26%" r="78%">
          <stop offset="78%" stopColor="#e8956a" stopOpacity="0" />
          <stop offset="94%" stopColor="#e8956a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8956a" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="blob-spec" cx="34%" cy="27%" r="22%">
          <stop offset="0%" stopColor="#ece6da" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ece6da" stopOpacity="0" />
        </radialGradient>
        <filter id="blob-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.22" />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#blob-body)" />
      <circle cx="200" cy="200" r="170" fill="url(#blob-rim)" />
      <circle cx="200" cy="200" r="170" fill="url(#blob-spec)" />
      <circle cx="200" cy="200" r="170" fill="#fff" filter="url(#blob-grain)" />
    </svg>
  )
}
