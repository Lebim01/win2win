import { useCallback, useEffect, useState } from 'react'

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

async function fetchMyCoupons(params: {
  ownerId: string
  page: number
  limit: number
  onlyUnused: boolean
  search?: string
}) {
  const q = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    unused: String(params.onlyUnused),
    search: params.search || '',
  })
  const res = await fetch(`/api/coupons/mine?${q.toString()}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to load coupons')
  return res.json() as Promise<{
    items: Coupon[]
    total: number
    totalUnused: number
    expiresAt?: string | null
  }>
}

export default function useCoupons(ownerId?: string) {
  const [items, setItems] = useState<Coupon[]>([])
  const [total, setTotal] = useState(0)
  const [totalUnused, setTotalUnused] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | undefined | null>(undefined)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(24)
  const [onlyUnused, setOnlyUnused] = useState(true)
  const [search, setSearch] = useState('')

  const reload = useCallback(() => {
    if (!ownerId) return
    setLoading(true)
    fetchMyCoupons({ ownerId, page, limit, onlyUnused, search })
      .then(({ items, total, totalUnused, expiresAt }) => {
        setItems(items)
        setTotal(total)
        setTotalUnused(totalUnused)
        setExpiresAt(expiresAt)
      })
      .finally(() => setLoading(false))
  }, [ownerId, page, limit, onlyUnused, search])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    items,
    total,
    totalUnused,
    expiresAt,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    onlyUnused,
    setOnlyUnused,
    search,
    setSearch,
    reload,
  }
}
