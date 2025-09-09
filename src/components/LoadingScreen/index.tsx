'use client'
import canUseDOM from '@/utilities/canUseDOM'
import React from 'react'
import { createPortal } from 'react-dom'

/**
 * LoadingScreen: Pantalla de carga a pantalla completa (splash) con spinner, barra de progreso y tips.
 * WalletSkeleton: Skeleton específico para la pantalla de Wallet (cards, gráfica y tablas).
 *
 * Uso rápido:
 * - <LoadingScreen visible message="Sincronizando datos..." progress={42} onCancel={() => {}}/>
 * - <WalletSkeleton/>
 */

// -------------- Utilidades --------------
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={classNames('animate-spin', className)} viewBox="0 0 24 24" aria-hidden>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        strokeWidth="4"
        stroke="currentColor"
        fill="none"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8"
        strokeWidth="4"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={classNames('relative overflow-hidden rounded-xl bg-muted/60', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

// -------------- Splash a pantalla completa --------------
export type LoadingScreenProps = {
  visible?: boolean
  /** Mensaje principal bajo el logo */
  message?: string
  /** 0–100 para barra de progreso opcional */
  progress?: number
  /** CTA opcional de cancelar */
  onCancel?: () => void
  /** Tips que rotan debajo del progreso */
  tips?: string[]
  /** Logo/Marca opcional (string = url) */
  logoUrl?: string
  /** Nombre del producto para texto alternativo */
  productName?: string
  /** Montar como overlay via portal */
  portal?: boolean
}

export function LoadingScreen({
  visible = true,
  message = 'Cargando...',
  progress,
  onCancel,
  tips = [
    'Tus comisiones se están calculando',
    'Sincronizando cortes del mes',
    'Verificando retiros recientes',
  ],
  logoUrl,
  productName = 'Win2Win',
  portal = true,
}: LoadingScreenProps) {
  if (!visible) return null
  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de carga"
      className="fixed inset-0 z-[100] grid place-items-center bg-background/70 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={productName} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Spinner className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-base font-semibold leading-none">{productName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        {/* Progreso opcional */}
        {typeof progress === 'number' && (
          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                role="progressbar"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Tips */}
        {tips?.length ? (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground">Sugerencia</div>
            <div className="mt-1 text-sm">
              <TipRotator items={tips} intervalMs={2400} />
            </div>
          </div>
        ) : null}

        {/* Acciones */}
        {onCancel && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return portal && canUseDOM ? createPortal(content, document.body) : content
}

function TipRotator({ items, intervalMs = 2500 }: { items: string[]; intervalMs?: number }) {
  const [index, setIndex] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs)
    return () => clearInterval(id)
  }, [items.length, intervalMs])
  return (
    <div className="relative min-h-5">
      {items.map((t, i) => (
        <div
          key={i}
          className={classNames(
            'absolute inset-0 transition-opacity duration-500',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        >
          {t}
        </div>
      ))}
    </div>
  )
}

// -------------- Skeletons para Wallet --------------
export function WalletSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-8" />
          <Shimmer className="h-6 w-40" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-10 w-32" />
          <Shimmer className="h-10 w-40" />
        </div>
      </div>

      {/* Cards resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-4">
          <Shimmer className="h-4 w-32" />
          <div className="mt-4 flex items-end justify-between">
            <Shimmer className="h-8 w-40" />
            <Shimmer className="h-6 w-20" />
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <Shimmer className="h-4 w-40" />
          <div className="mt-4 flex items-end justify-between">
            <Shimmer className="h-8 w-40" />
            <Shimmer className="h-6 w-20" />
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <Shimmer className="h-4 w-40" />
          <div className="mt-4 space-y-2">
            <Shimmer className="h-8 w-40" />
            <Shimmer className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-56" />
          <Shimmer className="h-9 w-20" />
        </div>
        <div className="mt-4 h-60 w-full">
          <Shimmer className="h-full w-full" />
        </div>
      </div>

      {/* Tabs y tablas */}
      <div>
        <div className="mb-3 flex gap-2">
          <Shimmer className="h-9 w-28" />
          <Shimmer className="h-9 w-28" />
          <Shimmer className="h-9 w-40" />
        </div>
        <div className="rounded-2xl border p-4">
          <Shimmer className="h-5 w-64" />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Shimmer className="h-10 w-full" />
            <Shimmer className="h-10 w-full" />
            <Shimmer className="h-10 w-full" />
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="mt-3 space-y-3">
              {Array.from({ length: 6 }).map((_, r) => (
                <div key={r} className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, c) => (
                    <Shimmer key={c} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// -------------- Demo --------------
export function DemoLoading() {
  return (
    <>
      <LoadingScreen progress={36} message="Preparando tu Wallet" productName="Win2Win" />
      <WalletSkeleton />
    </>
  )
}
