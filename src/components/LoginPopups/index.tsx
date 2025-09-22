'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Media = {
  id: string
  url?: string
  sizes?: Record<string, { url: string }>
}

type PopupItem = {
  id?: string
  active: boolean
  title?: string
  media: Media | string
  link?: { url?: string; newTab?: boolean }
  delayMs?: number
  durationMs?: number
  order?: number
  frequency?: 'oncePerSession' | 'oncePerDay' | 'always'
  validity?: { startAt?: string; endAt?: string }
}

type DashboardPopups = {
  items?: PopupItem[]
}

const STORAGE_KEY_PREFIX = 'dashboardPopup:lastShown:'

function canShowByFrequency(itemId: string, frequency: PopupItem['frequency'] = 'oncePerSession') {
  if (frequency === 'always') return true
  const key = STORAGE_KEY_PREFIX + itemId
  const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (!raw) return true
  const last = new Date(raw)
  if (frequency === 'oncePerSession') {
    // se resetea cuando cierra la pestaña; simple: guardamos flag de sesión
    const sessionKey = key + ':session'
    const sessionSeen = sessionStorage.getItem(sessionKey)
    return !sessionSeen
  }
  if (frequency === 'oncePerDay') {
    const now = new Date()
    const sameDay = now.toDateString() === last.toDateString()
    return !sameDay
  }
  return true
}

function markShown(itemId: string, frequency: PopupItem['frequency'] = 'oncePerSession') {
  const key = STORAGE_KEY_PREFIX + itemId
  const nowStr = new Date().toISOString()
  localStorage.setItem(key, nowStr)
  if (frequency === 'oncePerSession') {
    const sessionKey = key + ':session'
    sessionStorage.setItem(sessionKey, '1')
  }
}

function inWindow(start?: string, end?: string) {
  const now = new Date().getTime()
  const okStart = !start || new Date(start).getTime() <= now
  const okEnd = !end || new Date(end).getTime() >= now
  return okStart && okEnd
}

const LoginPopups = ({
  userRole,
  apiBase = '/api',
  trigger = 'onLogin',
}: {
  userRole?: string
  apiBase?: string
  trigger?: 'onLogin' | 'always'
}) => {
  const [queue, setQueue] = useState<PopupItem[]>([])
  const [current, setCurrent] = useState<PopupItem | null>(null)
  const [canClose, setCanClose] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/dashboard`, { cache: 'no-store' })
      if (!res.ok) return
      const cfg: DashboardPopups = await res.json()

      const items = (cfg.items || [])
        .filter((i) => i.active)
        .filter((i) => inWindow(i.validity?.startAt, i.validity?.endAt))
        .sort((a, b) => (b.order || 0) - (a.order || 0))
        .filter((i, idx) => {
          const id = String(i.id ?? idx)
          return canShowByFrequency(id, i.frequency)
        })

      setQueue(items)
    } catch (e) {
      console.error('LoginPopups fetch error', e)
    }
  }, [apiBase, trigger, userRole])

  const openNext = useCallback(() => {
    setCanClose(true)
    setCurrent(null)
    setQueue((prev) => {
      const next = prev[0]
      if (next) {
        // respeta retardos
        if (timerRef.current) clearTimeout(timerRef.current)
        const delay = next.delayMs || 0
        timerRef.current = setTimeout(() => {
          setCurrent(next)
          // controla durationMs
          if (next.durationMs && next.durationMs > 0) {
            setCanClose(false)
            setTimeout(() => setCanClose(true), next.durationMs)
          }
          //const id = String(next.id ?? Math.random())
          //markShown(id, next.frequency)
        }, delay)
      }
      console.log(prev)
      if (prev.length == 1) return []
      return prev.slice(1, prev.length)
    })
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  useEffect(() => {
    if (!current && queue.length > 0) {
      openNext()
    }
  }, [queue, openNext])

  const imageUrl = useMemo(() => {
    const m = current?.media as Media
    if (!m) return undefined
    return (
      m?.sizes?.['1280']?.url ||
      m?.url ||
      (typeof current?.media === 'string' ? (current?.media as string) : undefined)
    )
  }, [current])

  if (!current) return null

  return (
    <div aria-live="polite">
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/60" />
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] grid place-items-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Imagen clickable opcional */}
          {imageUrl ? (
            current?.link?.url ? (
              <a
                href={current.link.url}
                target={current.link.newTab ? '_blank' : '_self'}
                rel="noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={current?.title || 'popup'}
                  className="w-full h-auto block"
                />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={current?.title || 'popup'} className="w-full h-auto block" />
            )
          ) : (
            <div className="p-8">
              <h3 className="text-xl font-semibold">{current?.title || 'Anuncio'}</h3>
              <p className="text-sm text-gray-600 mt-2">
                Configura una imagen en el Global para mostrar aquí.
              </p>
            </div>
          )}

          {/* Barra de acciones */}
          <div className="flex items-center justify-end gap-2 p-3">
            {queue.length > 0 && (
              <button
                type="button"
                className="rounded-md px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setCurrent(null)
                }}
                disabled={!canClose}
              >
                Omitir
              </button>
            )}
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm bg-black text-white hover:bg-gray-900 disabled:opacity-50"
              onClick={() => {
                setCurrent(null)
                // abrir siguiente inmediatamente
                openNext()
              }}
              disabled={!canClose}
            >
              {queue.length > 0 ? 'Siguiente' : 'Cerrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(LoginPopups)
