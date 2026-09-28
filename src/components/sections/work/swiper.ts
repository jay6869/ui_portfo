import Swiper from 'swiper'
import { A11y, Keyboard } from 'swiper/modules'
import 'swiper/css'

/** Vanilla Swiper over server-rendered markup (progressive enhancement of a scroll-snap track). */
export function initSwiper(el: HTMLElement, onProgress: (index: number) => void) {
  return new Swiper(el, {
    modules: [A11y, Keyboard],
    slidesPerView: 1.14,
    spaceBetween: 14,
    speed: 650,
    grabCursor: true,
    watchSlidesProgress: true,
    breakpoints: {
      560: { slidesPerView: 1.5, spaceBetween: 20 },
      820: { slidesPerView: 2.2, spaceBetween: 24 },
    },
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: {
      enabled: true,
      containerMessage: 'Projects',
      slideLabelMessage: 'Project {{index}} of {{slidesLength}}',
    },
    on: {
      slideChange: (sw) => onProgress(sw.activeIndex),
    },
  })
}
