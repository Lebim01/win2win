export type Money = number // en USD u otra moneda; adapta según tu configuración

export type BalanceSummary = {
  available: Money
  pending: Money
  lifetimeEarned: Money
  lastPayoutAt?: string // ISO date
  currency: string // "USD", "MXN", etc.
}

export type WithdrawalRow = {
  id: string
  date: string // ISO
  amount: Money
  method: 'USDT' | 'Bank' | 'PayPal' | 'Other'
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  reference?: string // txid, folio
}

export type WalletProps = {
  balance: BalanceSummary
  trend?: { date: string; amount: Money }[] // para la gráfica (últimos 12 meses)
  commissions: { docs: CommissionRow[]; totalDocs: number; totalPages: number }
  withdrawals: WithdrawalRow[]
  onRequestWithdraw?: () => void // hook al flujo de retiro
  onRefresh?: () => void // recargar datos
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  level: string | null
  setLevel: React.Dispatch<React.SetStateAction<string | null>>
}

export type CommissionRow = {
  id: string
  date: string // ISO
  level: number // nivel 1..7
  sourceUser: string // displayName o email parcial
  amount: Money
  period: string // AAAA-MM
  status: 'accrued' | 'paid' | 'reversed'
  description: string
}
