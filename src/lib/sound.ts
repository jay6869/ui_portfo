import { useEffect } from 'react'
import throttle from 'lodash-es/throttle'
import { useUI } from '@/stores/ui'

/**
 * Optional UI sound. Off by default, remembered, never autoplays: Tone.js is only downloaded and
 * started after the visitor turns sound on (a user gesture, as browsers require).
 */
type ToneModule = typeof import('tone')
let tone: ToneModule | null = null
let synth: import('tone').PolySynth | null = null
let loading: Promise<void> | null = null

export function loadSound(): Promise<void> {
  if (loading) return loading
  loading = import('tone').then(async (T) => {
    tone = T
    await T.start()
    const reverb = new T.Reverb({ decay: 1.6, wet: 0.25 }).toDestination()
    synth = new T.PolySynth(T.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.1 },
      volume: -30,
    }).connect(reverb)
  })
  return loading
}

export function playTick(kind: 'hover' | 'click' | 'on' = 'hover') {
  if (!useUI.getState().sound || !tone || !synth) return
  const note = kind === 'hover' ? 'E6' : kind === 'click' ? 'B5' : ['E5', 'B5']
  try {
    synth.triggerAttackRelease(note, kind === 'hover' ? 0.03 : 0.06, tone.now())
  } catch {
    /* audio context not ready — stay silent rather than noisy */
  }
}

export async function setSoundEnabled(on: boolean) {
  useUI.getState().setSound(on)
  if (on) {
    await loadSound()
    playTick('on')
  }
}

/** Delegated hover/click ticks on interactive elements, only while sound is on. */
export function useSoundLayer() {
  const on = useUI((s) => s.sound)
  useEffect(() => {
    if (!on) return
    // Preference restored from a previous visit: Tone may only start after a user gesture.
    const arm = () => void loadSound()
    window.addEventListener('pointerdown', arm, { once: true })
    window.addEventListener('keydown', arm, { once: true })

    const hover = throttle(() => playTick('hover'), 70, { trailing: false })
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const t = e.target as Element | null
      const from = e.relatedTarget as Element | null
      const el = t?.closest('a, button, [role="button"]')
      if (el && !el.contains(from)) hover()
    }
    const click = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest('a, button, [role="button"]')) playTick('click')
    }
    document.addEventListener('pointerover', over)
    document.addEventListener('click', click)
    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('keydown', arm)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('click', click)
    }
  }, [on])
}
