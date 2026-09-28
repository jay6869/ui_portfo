/** Last known pointer position (viewport coords), tracked with one passive listener. */
export const pointer = { x: -1, y: -1, known: false }

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.known = true
    },
    { passive: true, capture: true },
  )
}
