import s from './Lab.module.css'

const TICKS = Array.from({ length: 101 }, (_, i) => i)

/**
 * A ruler driven entirely by CSS scroll-driven animations: the readout counts through an
 * @property integer on a scroll() timeline, ticks swell as they pass the centre on view().
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
      <div
        className={s.ruler}
        tabIndex={0}
        role="region"
        aria-label="Tape measure, scroll horizontally"
        data-lenis-prevent
      >
        <ol className={s.ticks} role="list">
          {TICKS.map((t) => (
            <li key={t} className={s.tick} data-major={t % 10 === 0} data-mid={t % 5 === 0}>
              {t % 10 === 0 ? <span className={`${s.tickLabel} mono`}>{t}</span> : null}
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
