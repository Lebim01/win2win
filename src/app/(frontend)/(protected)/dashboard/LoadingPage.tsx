'use client'
import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * LoadingDashboard
 * — Pantalla de carga elegante para dashboards (Next.js + Tailwind)
 *
 * Características:
 *  - Skeletons con shimmer (tarjetas, tabla y gráficos)
 *  - Indicador de progreso indeterminado
 *  - Soporte dark/light automático
 *  - Accesible (aria-busy, reduce motion)
 *  - Fácil de tematizar con la prop accentColor
 *
 * Uso (App Router):
 *  export default function Loading() { return <LoadingDashboard /> }
 *  // en src/app/(frontend)/dashboard/loading.tsx
 */
export default function LoadingDashboard({
  title = 'Cargando tu panel…',
  subtitle = 'Preparando tus métricas y configuraciones',
  accentColor = '#7C3AED', // violeta por defecto; cambia por tu color de marca
}: {
  title?: string
  subtitle?: string
  accentColor?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="min-h-dvh bg-background text-foreground" aria-busy="true">
      {/* Top bar con shimmer */}
      <div className="sticky top-0 z-50 border-b border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <LogoSpinner accentColor={accentColor} size={28} />
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base/6 font-semibold">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {/* Progreso indeterminado */}
        <IndeterminateBar accentColor={accentColor} reduced={prefersReducedMotion || false} />
      </div>

      <main className="container mx-auto grid gap-6 px-4 py-8">
        {/* Fila 1: KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Fila 2: Gráfico + Lista */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartSkeleton className="lg:col-span-2" />
          <ListSkeleton />
        </div>

        {/* Fila 3: Tabla */}
        <TableSkeleton rows={6} />
      </main>
    </div>
  )
}

function LogoSpinner({ accentColor, size = 24 }: { accentColor: string; size?: number }) {
  const prefersReducedMotion = useReducedMotion()
  const spin = prefersReducedMotion ? { rotate: 0 } : { rotate: [0, 360] }

  return (
    <motion.div
      aria-hidden
      className="inline-grid place-items-center rounded-xl border border-border/60 bg-card shadow-sm"
      style={{ width: size + 8, height: size + 8 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={spin}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      </motion.svg>
    </motion.div>
  )
}

function IndeterminateBar({ accentColor, reduced }: { accentColor: string; reduced: boolean }) {
  return (
    <div className="relative h-1 w-full overflow-hidden">
      <div className="absolute inset-0 bg-border/40" />
      <motion.div
        className="absolute left-0 top-0 h-full"
        style={{ background: accentColor, width: '40%' }}
        initial={{ x: '-50%' }}
        animate={{ x: reduced ? 0 : ['-50%', '110%'] }}
        transition={{ repeat: reduced ? 0 : Infinity, duration: 1.4, ease: 'easeInOut' }}
      />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-3 h-2 w-24 animate-pulse rounded bg-muted/60" />
      <div className="mb-6 h-6 w-32 animate-pulse rounded bg-muted/50" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
    </div>
  )
}

function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-4 shadow-sm ${className}`}>
      <div className="mb-3 h-2 w-36 animate-pulse rounded bg-muted/60" />
      <div className="grid h-56 grid-cols-12 items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-t bg-muted/50"
            style={{ height: `${20 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-3 h-2 w-40 animate-pulse rounded bg-muted/60" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted/50" />
            <div className="flex-1">
              <div className="mb-2 h-2 w-1/2 animate-pulse rounded bg-muted/60" />
              <div className="h-2 w-2/3 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/60 p-4">
        <div className="h-2 w-48 animate-pulse rounded bg-muted/60" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 p-4">
            <div className="col-span-4 h-3 animate-pulse rounded bg-muted/50" />
            <div className="col-span-3 h-3 animate-pulse rounded bg-muted/40" />
            <div className="col-span-3 h-3 animate-pulse rounded bg-muted/40" />
            <div className="col-span-2 h-3 animate-pulse rounded bg-muted/30" />
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 p-4">
        <div className="mx-auto h-2 w-24 animate-pulse rounded bg-muted/50" />
      </div>
    </div>
  )
}
