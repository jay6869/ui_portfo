import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { about } from '@/content/about'
import { QUERIES, matches } from '@/engine/media'
import s from './About.module.css'

/**
 * A very quiet map: no tile server, no third-party requests — just the Natural Earth outline
 * (public domain, served locally), a faint graticule and one clay marker. Wheel zoom is off so
 * the map never traps page scrolling; +/- buttons and the keyboard still work.
 */
export default function SriLankaMap() {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!el.current) return
    const { lat, lng, zoom, label } = about.map
    const coarse = matches('(pointer: coarse)')
    const island = L.latLngBounds([5.9, 79.55], [9.85, 81.9])
    const map = L.map(el.current, {
      zoomSnap: 0.25,
      maxZoom: zoom + 2,
      maxBounds: L.latLngBounds([4.5, 77.5], [11.2, 83.8]),
      scrollWheelZoom: false,
      dragging: !coarse,
      tapHold: false,
      attributionControl: false,
      zoomAnimation: !matches(QUERIES.reducedMotion),
    })
    // Frame the whole island at any container size; don't allow zooming out past that
    map.fitBounds(island, { padding: [18, 18] })
    map.setMinZoom(map.getZoom() - 0.5)

    for (let la = 5; la <= 10; la++)
      L.polyline(
        [
          [la, 77],
          [la, 84.5],
        ],
        { className: s.graticule, interactive: false },
      ).addTo(map)
    for (let lo = 78; lo <= 84; lo++)
      L.polyline(
        [
          [4, lo],
          [11.5, lo],
        ],
        { className: s.graticule, interactive: false },
      ).addTo(map)

    const controller = new AbortController()
    void fetch('/geo/lka.json', { signal: controller.signal })
      .then((r) => r.json())
      .then((geo: GeoJSON.Feature) => {
        L.geoJSON(geo, { style: () => ({ className: s.land }), interactive: false }).addTo(map)
      })
      .catch(() => {})

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ className: s.pin, html: '<span></span>', iconSize: [18, 18] }),
      keyboard: false,
      interactive: false,
    }).addTo(map)
    marker.bindTooltip(label, {
      permanent: true,
      direction: 'top',
      offset: [0, -14],
      className: s.tip,
    })

    return () => {
      controller.abort()
      map.remove()
    }
  }, [])

  return (
    <div
      ref={el}
      className={s.map}
      role="application"
      aria-label={`Map of Sri Lanka. Marker: ${about.map.label}. Use the arrow keys to pan and plus or minus to zoom.`}
      data-lenis-prevent-touch
    />
  )
}
