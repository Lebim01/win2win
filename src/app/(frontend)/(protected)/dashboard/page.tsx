'use client'
import React, { useMemo, useState } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Progress,
  Divider,
  Input,
  Link,
  Tooltip,
  Snippet,
  Avatar,
  Tabs,
  Tab,
} from '@heroui/react'
import { diffNow } from '@/utilities/diffNow'
import useMe from '@/hooks/useMe'
import useCoupons from '@/hooks/useCoupons'

// Coupons
type Coupon = {
  id: string
  code: string
  amountOff: number
  currency: string
  redeemed: boolean
  redeemedBy?: string | null
  owner: string
  expiresAt?: string | null // todos expiran a la misma fecha (global)
  payoutEligible?: boolean
}

// --- Utility functions ---
function formatCurrency(v: number | undefined, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(v ?? 0)
}

export default function Dashboard() {
  const { data: me, loading, error, refresh } = useMe()
  const [coupon, setCoupon] = useState('')
  const [busy, setBusy] = useState(false)

  const remaining = useMemo(
    () => diffNow(me?.membership?.currentPeriodEnd),
    [me?.membership?.currentPeriodEnd],
  )
  const isActive = !!me?.membership?.isActive && !remaining.expired

  const referralLink = useMemo(() => {
    if (!me?.referralCode) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://win2win.app'
    return `${base}/sign-up?ref=${me.referralCode}`
  }, [me?.referralCode])

  if (loading) return <div className="p-6">Cargando…</div>
  if (error || !me) return <div className="p-6">Error: {error || 'No data'}</div>

  return (
    <div className="container mx-auto p-6 md:px-0 md:py-12 grid gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={me.name || me.email} />
        <div>
          <h1 className="text-xl font-semibold">Hola, {me.name || me.email}</h1>
          <div className="text-sm opacity-70">
            Nivel: {me.level ?? 0} · Referidos directos: {me.childrenCount ?? 0}
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card shadow="sm">
          <CardHeader className="justify-between">
            <div className="font-semibold">Membresía</div>
            {isActive ? (
              <Chip color="success" variant="flat">
                Activa
              </Chip>
            ) : (
              <Chip color="danger" variant="flat">
                Inactiva
              </Chip>
            )}
          </CardHeader>
          <CardBody className="gap-2">
            <div className="text-sm opacity-80">
              Plan: {formatCurrency(me.membership?.planAmount ?? 24.99, me.membership?.currency)}
            </div>
            <div className="text-sm opacity-80">
              Vence:{' '}
              {me.membership?.currentPeriodEnd
                ? new Date(me.membership.currentPeriodEnd).toLocaleString()
                : '—'}
            </div>
            <div className="mt-2">
              <Progress aria-label="Tiempo restante" value={remaining.pct} className="max-w-full" />
              <div className="text-xs mt-1 opacity-70">
                {remaining.expired
                  ? 'Expirada'
                  : `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m restantes`}
              </div>
            </div>
          </CardBody>

          <CardFooter className="justify-between gap-2">
            {!isActive && !me.membership?.firstActivatedAt && (
              <>
                <Input
                  size="sm"
                  label="Cupón (opcional)"
                  value={coupon}
                  onValueChange={setCoupon}
                  placeholder="ABC123"
                  className="max-w-xs"
                />
                <Button color={isActive ? 'warning' : 'primary'} isLoading={busy}>
                  {isActive ? 'Renovar' : 'Activar membresía'}
                </Button>
              </>
            )}
            {isActive && (
              <>
                <Button color="primary">¡Todo al día!</Button>
              </>
            )}
          </CardFooter>
        </Card>

        <Card shadow="sm">
          <CardHeader className="justify-between">
            <div className="font-semibold">Tu enlace de referidos</div>
            <Chip variant="flat" color="secondary">
              Código: {me.referralCode || '—'}
            </Chip>
          </CardHeader>
          <CardBody className="gap-3">
            <Snippet symbol="" codeString={referralLink} className="w-full">
              {referralLink || 'Genera tu código'}
            </Snippet>
            <div className="text-sm opacity-70">
              Comparte este enlace para invitar y ganar $2 por nivel hasta 7 niveles.
            </div>
          </CardBody>
          <CardFooter>
            <Button as={Link} href="/referrals" variant="flat">
              Ver árbol de referidos
            </Button>
          </CardFooter>
        </Card>

        <Card shadow="sm">
          <CardHeader className="justify-between">
            <div className="font-semibold">Resumen de referidos</div>
            <Tooltip content="Total de personas referidas directamente">
              <Chip color="primary" variant="flat">
                {me.referredCount ?? me.childrenCount ?? 0} directos
              </Chip>
            </Tooltip>
          </CardHeader>
          <CardBody className="gap-2">
            <div className="text-sm opacity-80">
              Ganancias por referidos: <b>ver billetera</b>
            </div>
            <div className="text-sm opacity-80">Niveles pagados: 7</div>
          </CardBody>
          <CardFooter>
            <Button as={Link} href="/wallet" variant="flat">
              Ir a billetera
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Promotions & activity */}
      <Card shadow="sm">
        <CardHeader>
          <div className="font-semibold">Promociones</div>
        </CardHeader>
        <Divider />
        <CardBody className="grid gap-3 md:grid-cols-2"></CardBody>
      </Card>

      {/* Tabs: Activity / Details */}
      <Card shadow="sm">
        <CardBody>
          <Tabs aria-label="Detalles">
            <Tab key="membership" title="Detalles de membresía">
              <div className="grid gap-2 text-sm">
                <div>
                  Primer activación:{' '}
                  {me.membership?.firstActivatedAt
                    ? new Date(me.membership.firstActivatedAt).toLocaleString()
                    : '—'}
                </div>
                <div>
                  Periodo actual:{' '}
                  {me.membership?.currentPeriodStart
                    ? new Date(me.membership.currentPeriodStart).toLocaleString()
                    : '—'}{' '}
                  →{' '}
                  {me.membership?.currentPeriodEnd
                    ? new Date(me.membership.currentPeriodEnd).toLocaleString()
                    : '—'}
                </div>
                <div>
                  Monto del plan:{' '}
                  {formatCurrency(me.membership?.planAmount ?? 24.99, me.membership?.currency)}
                </div>
              </div>
            </Tab>
            <Tab key="referrals" title="Cómo ganar">
              <div className="text-sm leading-6">
                Ganas <b>$2</b> por activación/renovación de cada referido en tu red hasta{' '}
                <b>7 niveles</b>. Comparte tu enlace y usa cupones de un solo uso para incentivar la
                primera compra.
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}
