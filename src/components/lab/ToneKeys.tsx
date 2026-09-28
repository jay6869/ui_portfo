import { useCallback, useEffect, useRef, useState } from 'react'
import type * as ToneNS from 'tone'
import s from './Lab.module.css'

const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'] as const
const KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'] as const

/**
 * Eight pentatonic keys. Completely silent until the visitor presses something (Tone.js is
 * downloaded and started inside that gesture). Keyboard: A–K while the instrument has focus.
 */
export default function ToneKeys({ onSignal }: { onSignal: number }) {
  const synth = useRef<ToneNS.PolySynth | null>(null)
  const tone = useRef<typeof ToneNS | null>(null)
  const [state, setState] = useState<'off' | 'loading' | 'on'>('off')
  const [down, setDown] = useState<number | null>(null)

  const start = useCallback(async () => {
    if (tone.current) return
    setState('loading')
    const T = await import('tone')
    await T.start()
    const reverb = new T.Reverb({ decay: 3.2, wet: 0.35 }).toDestination()
    const delay = new T.FeedbackDelay({ delayTime: '8n.', feedback: 0.22, wet: 0.18 }).connect(
      reverb,
    )
    synth.current = new T.PolySynth(T.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.15, release: 1.4 },
      volume: -14,
    }).connect(delay)
    tone.current = T
    setState('on')
  }, [])

  useEffect(() => {
    if (onSignal) void start()
  }, [onSignal, start])

  useEffect(
    () => () => {
      synth.current?.dispose()
    },
    [],
  )

  const play = async (i: number) => {
    if (!tone.current) await start()
    synth.current?.triggerAttackRelease(NOTES[i]!, '8n', tone.current!.now())
    setDown(i)
    window.setTimeout(() => setDown((d) => (d === i ? null : d)), 220)
  }

  return (
    // Keydown bubbles up from the focused key buttons; the group just maps A–K to notes.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className={s.keys}
      role="group"
      aria-label="Pentatonic keys. Press a key, or use A to K on your keyboard."
      onKeyDown={(e) => {
        const i = KEYS.indexOf(e.key.toLowerCase() as (typeof KEYS)[number])
        if (i >= 0 && !e.repeat && !e.metaKey && !e.ctrlKey) void play(i)
      }}
    >
      <div className={s.keyRow}>
        {NOTES.map((n, i) => (
          <button
            key={n}
            type="button"
            className={s.key}
            data-down={down === i}
            style={{ ['--h' as string]: `${46 + i * 6}%` }}
            aria-label={`${n.replace(/\d/, '')} (${KEYS[i]!.toUpperCase()})`}
            onPointerDown={(e) => {
              e.preventDefault()
              void play(i)
            }}
            onClick={(e) => e.detail === 0 && void play(i)}
          >
            <span className={s.keyBar} />
            <span className={`${s.keyLabel} mono`}>{KEYS[i]}</span>
          </button>
        ))}
      </div>
      <p className={`${s.keysNote} mono dim`} aria-live="polite">
        {state === 'off'
          ? 'Silent until you press a key'
          : state === 'loading'
            ? 'Waking the synth…'
            : 'On · keys A–K'}
      </p>
    </div>
  )
}
