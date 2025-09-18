'use client'
import React, { FormEventHandler, useMemo, useState } from 'react'
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
  Modal,
  useDisclosure,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { diffNow } from '@/utilities/diffNow'
import useMe from '@/hooks/useMe'
import LoadingDashboard from './LoadingPage'
import useAxios from '@/hooks/useAxios'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

// --- Utility functions ---
function formatCurrency(v: number | undefined, currency = 'USD') {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(v ?? 0)
}

export default function Dashboard() {
  const router = useRouter()

  const { data: me, loading, error } = useMe()

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

  const { data, loading: loadingCoupons } = useAxios<{
    expires_at: string
    total: number
    used: number
  }>({
    url: '/api/coupons/summary',
  })

  const remainingCoupons = useMemo(() => diffNow(data?.expires_at), [data?.expires_at])

  const [errorCoupon, setErrorsCoupon] = useState<{
    coupon?: string[] | undefined
    form?: string[] | undefined
  }>({})
  const [loadingActive, setLoadingActivate] = useState(false)

  const memberships = useAxios({
    url: '/api/memberships',
  })

  const [selectedMembership, setSelectedMembership] = useState<any>(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  if (loading || loadingCoupons) return <LoadingDashboard />
  if (error || !me) return <div className="p-6">Error: {error || 'No data'}</div>

  const onSubmitCoupon: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorsCoupon({})

    const form = e.currentTarget
    const formData = new FormData(form)

    const formValues = {
      coupon: formData.get('coupon') as string,
    }

    try {
      setLoadingActivate(true)
      const response = await axios.post(
        '/api/coupons/use',
        {
          coupon: formValues.coupon,
        },
        {
          withCredentials: true,
        },
      )
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err: any) {
      if (err.response?.data?.details) {
        setErrorsCoupon({
          form: ['Error: ' + err.response.data.details],
        })
      } else {
        setErrorsCoupon({
          form: ['Error inesperado, intenta mas tarde'],
        })
      }
    } finally {
      setLoadingActivate(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 md:px-0 md:py-12 grid gap-4">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Pagar {selectedMembership.name}
              </ModalHeader>
              <ModalBody className="flex flex-col items-center">
                <p>$ {selectedMembership.planAmount} USD</p>

                <img
                  src={selectedMembership.qr.image.url}
                  height={150}
                  width={150}
                  className="object-cover object-top"
                />

                <p>Red: {selectedMembership.qr.network} (POLYGON)</p>
                <p>{selectedMembership.qr.address}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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
              Plan:{' '}
              {formatCurrency(
                me.membership?.membership?.planAmount,
                me.membership?.membership?.currency,
              )}
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
                <form onSubmit={onSubmitCoupon} className="w-full flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      name="coupon"
                      label="Cupón"
                      placeholder="ABC123"
                      className="max-w-xs"
                      isInvalid={errorCoupon?.coupon && errorCoupon?.coupon?.length > 0}
                      errorMessage={errorCoupon.coupon ? errorCoupon.coupon[0] : null}
                    />
                    <Button
                      color={'primary'}
                      isLoading={loadingActive}
                      className="w-full"
                      type="submit"
                    >
                      Activar membresía
                    </Button>
                  </div>
                  {errorCoupon?.form && errorCoupon?.form?.length > 0 && (
                    <span className="text-red-400">
                      {errorCoupon.form ? errorCoupon.form[0] : null}
                    </span>
                  )}
                </form>
              </>
            )}
            {isActive && (
              <>
                <Button color="primary">¡Todo al día!</Button>
              </>
            )}
          </CardFooter>
        </Card>

        {me.membership?.firstActivatedAt && (
          <>
            <Card shadow="sm">
              <CardHeader className="justify-between">
                <div className="font-semibold">Tu enlace de referidos</div>
                <Chip variant="flat" color="secondary">
                  Código: {me.referralCode || '—'}
                </Chip>
              </CardHeader>
              <CardBody className="gap-3">
                <Snippet
                  symbol=""
                  codeString={referralLink}
                  className="w-full"
                  classNames={{
                    pre: 'line-clamp-1 overflow-auto',
                  }}
                >
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
                <div className="text-sm opacity-80">
                  Niveles pagados: {me?.membership?.membership?.maxLevels || 3}
                </div>
              </CardBody>
              <CardFooter>
                <Button as={Link} href="/wallet" variant="flat">
                  Ir a billetera
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {!me.membership?.firstActivatedAt && (
          <Card
            className={clsx(
              'p-4 flex flex-col gap-4',
              me.membership?.firstActivatedAt && 'md:col-span-3',
              !me.membership?.firstActivatedAt && 'md:col-span-2',
            )}
          >
            <span className="font-bold">Elige tu membresia</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              {(memberships?.data as any[]).map((m) => (
                <div
                  key={m.id}
                  className="p-2 flex flex-col items-center justify-center bg-neutral-300 dark:bg-neutral-600 h-full rounded-md hover:bg-amber-200 hover:text-black transition-all hover:cursor-pointer"
                  onClick={() => {
                    setSelectedMembership(m)
                    onOpenChange()
                  }}
                >
                  <span className="text-lg font-bold">{m.name}</span>
                  <span className="text-xs">${m.planAmount} USD</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Promotions & activity */}
      {data!.total > 0 && (
        <Card shadow="sm">
          <CardHeader>
            <div className="font-semibold">Cupones</div>
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-col text-sm">
            <div className="grid grid-cols-2 gap-2 w-max">
              <div>
                <span className="whitespace-nowrap">Total de cupones:</span>
              </div>
              <div>
                <span>{data?.total}</span>
              </div>
              <div>
                <span className="whitespace-nowrap">Cupones usados:</span>
              </div>
              <div>
                <span>{data?.used}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs mt-1 opacity-70">Usalos antes de:</span>
              <Progress
                aria-label="Tiempo restante"
                value={remainingCoupons.pct}
                className="max-w-full mt-1"
              />
              <div className="text-xs mt-1 opacity-70">
                {remainingCoupons.expired
                  ? 'Expirada'
                  : `${remainingCoupons.days}d ${remainingCoupons.hours}h ${remainingCoupons.minutes}m restantes`}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tabs: Activity / Details */}
      <Card shadow="sm">
        <CardBody>
          <Tabs aria-label="Detalles">
            <Tab key="membership" title="Detalles de membresía">
              <div className="grid gap-2 text-sm">
                <div>
                  Periodo actual:{' '}
                  <Snippet symbol="" hideCopyButton size="sm">
                    {me.membership?.currentPeriodStart
                      ? new Date(me.membership.currentPeriodStart).toLocaleString()
                      : '—'}
                  </Snippet>{' '}
                  →{' '}
                  <Snippet symbol="" hideCopyButton size="sm">
                    {me.membership?.currentPeriodEnd
                      ? new Date(me.membership.currentPeriodEnd).toLocaleString()
                      : '—'}
                  </Snippet>
                </div>
                <div>
                  Monto del plan:{' '}
                  {formatCurrency(
                    me.membership?.membership?.planAmount,
                    me.membership?.membership?.currency,
                  )}
                </div>
              </div>
            </Tab>
            <Tab key="referrals" title="Cómo ganar">
              <div className="text-sm leading-6">
                Ganas <b>$2</b> por activación/renovación de cada referido en tu red hasta{' '}
                <b>7 niveles</b>. Comparte tu enlace y gana.
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  )
}
