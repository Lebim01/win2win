'use client'
import React, { useMemo, useState } from 'react'

import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableColumn,
  TableRow,
  Tab,
  Tabs,
  Chip,
  Input,
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Pagination,
} from '@heroui/react'
import {
  Download,
  Filter,
  Plus,
  RefreshCcw,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CommissionRow, Money, WalletProps } from './types'
import { StatusBadge } from './components/StatusBadge'
import { WithdrawalBadge } from './components/WithdrawalBadge'
import { DemoLoading } from '@/components/LoadingScreen'
import { CardTitle } from '@/components/ui/card'
import useMe from '@/hooks/useMe'
import { PaginatedDocs } from 'payload'
import { Customer, ReferralPayout } from '@/payload-types'
import useAxios from '@/hooks/useAxios'

const fmtCurrency = (n: Money, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '—')

const toCSV = <T,>(rows: T[]) => {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0] as object)
  const csv = [headers.join(',')]
    .concat(
      rows.map((r) =>
        headers
          .map((h) => {
            const v = (r as any)[h]
            if (v == null) return ''
            const s = typeof v === 'string' ? v : JSON.stringify(v)
            // escapar comillas dobles
            return `"${s.replace(/"/g, '""')}"`
          })
          .join(','),
      ),
    )
    .join('\n')
  return csv
}

const downloadBlob = (content: string, filename: string, type = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// -- Componente principal
function WalletPage(props: WalletProps) {
  const {
    balance,
    trend = [],
    commissions,
    withdrawals,
    onRequestWithdraw,
    onRefresh,
    page,
    setPage,
    level,
    setLevel,
  } = props
  const [periodFilter, setPeriodFilter] = useState<string>('') // AAAA-MM
  const [search, setSearch] = useState('')

  return (
    <div className="container mx-auto px-4 md:px-0 py-6 space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6" /> Wallet
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" onPress={() => onRefresh?.()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onPress={() => onRequestWithdraw?.()} color="primary">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Solicitar retiro
          </Button>
        </div>
      </div>

      {/* Resumen de balance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card shadow="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance disponible</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <div className="text-3xl font-bold">
              {fmtCurrency(balance.available, balance.currency)}
            </div>
            <Chip color="primary" className="uppercase" size="sm">
              Disponible
            </Chip>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendiente por liberar</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <div className="text-3xl font-bold">
              {fmtCurrency(balance.pending, balance.currency)}
            </div>
            <Chip color="secondary" className="uppercase" size="sm">
              Pendiente
            </Chip>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ganado de por vida</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <div className="text-3xl font-bold">
              {fmtCurrency(balance.lifetimeEarned, balance.currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              Último pago: {fmtDate(balance.lastPayoutAt)}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tendencia de ingresos */}
      <Card>
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Tendencia de comisiones (12M)
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => downloadBlob(toCSV(trend), `trend-${Date.now()}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </CardHeader>
        <CardBody className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.35} />
                  <stop offset="95%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: any) => [fmtCurrency(Number(v), balance.currency), 'Monto']}
                labelStyle={{
                  color: '#000',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                fillOpacity={1}
                strokeWidth={2}
                fill="url(#a)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs aria-label="Options">
        {/* Comisiones */}
        <Tab key="commissions" title="Comisiones">
          <Card radius="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Histórico de comisiones</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3 px-4">
                <div className="space-y-1">
                  <Label>Búsqueda</Label>
                  <Input
                    placeholder="Buscar por usuario o ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nivel</Label>
                  <Select
                    onSelectionChange={(keys) => {
                      setLevel(keys.currentKey as string)
                    }}
                    placeholder="Seleccionar"
                  >
                    <SelectItem key="">Todos</SelectItem>
                    <SelectItem key="1">Nivel 1</SelectItem>
                    <SelectItem key="2">Nivel 2</SelectItem>
                    <SelectItem key="3">Nivel 3</SelectItem>
                    <SelectItem key="4">Nivel 4</SelectItem>
                    <SelectItem key="5">Nivel 5</SelectItem>
                    <SelectItem key="6">Nivel 6</SelectItem>
                    <SelectItem key="7">Nivel 7</SelectItem>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Periodo (AAAA-MM)</Label>
                  <Input
                    type="month"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center px-4">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" /> {commissions.totalDocs} resultados
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    downloadBlob(toCSV(commissions.docs), `commissions-${Date.now()}.csv`)
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>

              <div>
                <Table
                  radius="sm"
                  shadow="none"
                  isStriped
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        color="secondary"
                        page={page}
                        total={commissions.totalPages}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn className="whitespace-nowrap">Fecha</TableColumn>
                    <TableColumn>Nivel</TableColumn>
                    <TableColumn>Usuario origen</TableColumn>
                    <TableColumn>Monto</TableColumn>
                    <TableColumn>Periodo</TableColumn>
                    <TableColumn>Estado</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={'Sin registros.'}>
                    {commissions.docs.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{fmtDate(c.date)}</TableCell>
                        <TableCell>{c.level}</TableCell>
                        <TableCell className="font-medium">{c.sourceUser}</TableCell>
                        <TableCell>{fmtCurrency(c.amount, balance.currency)}</TableCell>
                        <TableCell>{c.period}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Retiros */}
        <Tab key="withdrawals" title="Retiros">
          <Card radius="sm">
            <CardHeader className="pb-2 flex items-center justify-between px-4">
              <CardTitle className="text-base font-medium">Retiros</CardTitle>
              <Button size="sm" onPress={() => onRequestWithdraw?.()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo retiro
              </Button>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-end px-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => downloadBlob(toCSV(withdrawals), `withdrawals-${Date.now()}.csv`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table shadow="none" radius="sm" isStriped>
                  <TableHeader>
                    <TableColumn>Fecha</TableColumn>
                    <TableColumn>Método</TableColumn>
                    <TableColumn>Monto</TableColumn>
                    <TableColumn>Estado</TableColumn>
                    <TableColumn>Referencia</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={'Sin retiros aún.'}>
                    {withdrawals.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell>{fmtDate(w.date)}</TableCell>
                        <TableCell>{w.method}</TableCell>
                        <TableCell>{fmtCurrency(w.amount, balance.currency)}</TableCell>
                        <TableCell>
                          <WithdrawalBadge status={w.status} />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{w.reference ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}

export default function DemoWallet() {
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState<string | null>(null)

  const { data: user, loading: loadingUser } = useMe()

  const { data: history } = useAxios<PaginatedDocs<ReferralPayout>>(
    {
      url: '/api/comissions/history',
      params: {
        page,
        level,
      },
    },
    [page, level],
  )

  const { data: trend, loading: loadingTrend } = useAxios<
    {
      cumulative_commissions: string
      mom_change_pct: null
      month_date: string
      month_label: string
      monthly_commissions: string
    }[]
  >({
    url: '/api/comissions/trend',
  })

  const { data: withdrawals, loading: loadinWithdrawals } = useAxios<{
    pending: number
    docs: any[]
    totalPages: number
    totalDocs: number
  }>({
    url: '/api/withdrawals',
  })

  const loading = useMemo(() => {
    return loadingUser || loadingTrend || loadinWithdrawals
  }, [loadingUser, loadingTrend, loadinWithdrawals])

  const props: WalletProps = {
    page,
    setPage,
    level,
    setLevel,
    balance: {
      available: user?.wallet.balance || 0,
      pending: withdrawals?.pending || 0,
      lifetimeEarned: user?.wallet.totalEarned || 0,
      lastPayoutAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
      currency: 'USD',
    },
    trend:
      trend?.map((r) => {
        return {
          date: r.month_label,
          amount: Number(r.monthly_commissions),
        }
      }) || [],
    commissions: {
      docs:
        history?.docs.map((r) => {
          const d = new Date(r.createdAt)
          const month = d.toISOString().slice(0, 7)
          return {
            id: r.id.toString(),
            date: d.toISOString(),
            level: r.level,
            sourceUser: (r.payer as Customer).name,
            amount: r.amount,
            period: month,
            status: 'paid',
          } as CommissionRow
        }) || [],
      totalDocs: history?.totalDocs || 0,
      totalPages: history?.totalPages || 0,
    },

    withdrawals:
      withdrawals?.docs.map((r) => {
        return {
          id: r.id,
          amount: r.amount,
          method: r.method,
          status: r.status,
          reference: r.reference,
          date: r.createdAt,
        }
      }) || [],
  }

  if (loading) {
    return <DemoLoading />
  }

  return <WalletPage {...props} />
}
