import { useEffect, useState } from 'react'

// --- Types aligned with your Payload Customers schema ---
type Membership = {
  isActive?: boolean
  currentPeriodStart?: string
  currentPeriodEnd?: string
  firstActivatedAt?: string
  planAmount?: number
  currency?: string
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
}

// --- Data hooks (replace with your real fetchers) ---
async function fetchMe(): Promise<CustomerMe> {
  const res = await fetch(`/api/me`, { credentials: 'include' })
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
