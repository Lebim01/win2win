'use client'
import React, { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaOptionsType } from 'embla-carousel'
import AutoScroll from 'embla-carousel-auto-scroll'
import { Media } from '@/payload-types'

export type SectionCarouselProps = {
  items: Media[]
}

const defaultOptions: EmblaOptionsType = { loop: true, align: 'center', skipSnaps: false }

export function SectionCarousel({ items }: SectionCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...defaultOptions }, [])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div
      className={[
        'relative z-40 w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70',
        'shadow-md ring-1 ring-black/5',
      ].join(' ')}
      style={{ height: 400 }}
    >
      <div className="h-full px-3 sm:px-0">
        <div ref={emblaRef} className="embla h-full overflow-hidden">
          <div className="embla__container flex h-full -ml-3 sm:-ml-4">
            {items.map((it) => {
              return (
                <div
                  key={it.id}
                  className={[
                    'embla__slide h-full w-full pl-3 sm:pl-4 flex items-center justify-center relative',
                  ].join(' ')}
                  style={{ minWidth: 0 }}
                >
                  <img
                    src={it.url as string}
                    alt={it.alt as string}
                    className="h-full w-full object-cover blur-lg  brightness-50 transition-opacity inset-1 top-0 left-0"
                    loading="lazy"
                  />

                  <img
                    src={it.url as string}
                    alt={it.alt as string}
                    className="h-full w-full object-contain opacity-80 hover:opacity-100 transition-opacity absolute z-10"
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>

          <button className="embla__prev" onClick={scrollPrev}>
            Prev
          </button>
          <button className="embla__next" onClick={scrollNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
