import { logout } from '@/services/auth.service'
import { useEffect, useState } from 'react'

// --- Types aligned with your Payload Customers schema ---
type Membership = {
  isActive?: boolean
  currentPeriodStart?: string
  currentPeriodEnd?: string
  firstActivatedAt?: string
  membership?: {
    id: number
    maxLevels: number
    planAmount: number
    currency: string
  }
}

export type CustomerMe = {
  id: string
  name?: string
  email: string
  referralCode?: string
  inviterCode?: string
  level?: number
  childrenCount?: number
  membership?: Membership
  referredCount?: number
  children: number[]
  referredBy: number
  wallet: {
    balance: number
    totalEarned: number
  }
}

// --- Data hooks (replace with your real fetchers) ---
async function fetchMe(): Promise<CustomerMe> {
  const res = await fetch(`/api/me`, { credentials: 'include' })
  if (res.status == 401 || res.status == 500) await logout()
  if (!res.ok) throw new Error('Failed to load user')
  return res.json()
}

export default function useMe() {
  const [data, setData] = useState<CustomerMe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetchMe()
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])
  return { data, loading, error, refresh: () => fetchMe().then(setData) }
}
