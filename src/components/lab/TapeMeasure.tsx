import s from './Lab.module.css'

const MAJORS = Array.from({ length: 11 }, (_, i) => i * 10)

/**
 * A ruler driven entirely by CSS scroll-driven animations: the readout counts through an
 * @property integer on a scroll() timeline, major ticks swell as they pass the centre (view()).
 * No JavaScript runs here at all. Unsupported browsers get a plain scrolling ruler.
 */
export default function TapeMeasure() {
  return (
    <div className={s.tape}>
      <p className={s.readout} aria-hidden="true">
        <span className={s.readoutNum} />
        <span className="mono dim">cm</span>
      </p>
      <div className={s.needle} aria-hidden="true" />
      {/* Focusable so keyboard users can scroll it (axe: scrollable-region-focusable) */}
      <div
        className={s.ruler}
        tabIndex={0}
        role="region"
        aria-label="Tape measure, scroll horizontally"
        data-lenis-prevent
      >
        {/* Minor ticks are a repeating gradient; only the 11 labelled majors are elements */}
        <ol className={s.ticks} role="list">
          {MAJORS.map((t) => (
            <li key={t} className={s.tick}>
              <span className={`${s.tickLabel} mono`}>{t}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className={`${s.tapeNote} mono dim`}>
        <span className={s.unsupported}>
          Your browser skips scroll-driven animations. The ruler still scrolls.
        </span>
      </p>
    </div>
  )
}
