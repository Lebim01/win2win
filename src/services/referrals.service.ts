import { Membership } from '@/payload-types'
import axios from 'axios'

export const getChild = async (id: number) => {
  const res = await fetch(`/api/get-child/${id}`, { credentials: 'include' })
  return await res.json()
}

export const getTree = async (): Promise<
  {
    user_id: number
    parent_id: null | number
    depth: number
    path: number[]
    display_name: string
    membership_is_active: boolean
  }[]
> => {
  const res = await fetch(`/api/referrals/referral-tree`, { credentials: 'include' })
  return await res.json()
}

export type ResponseDirects = {
  totalPages: 0
  totalDocs: 0
  docs: {
    id: number
    name: string
    email: string
    phone: string
    membership: {
      isActive: boolean
      currentPeriodEnd: string | null
      currentPeriodStart: string | null
      firstActivatedAt: string | null
      membership: Membership
    }
  }[]
}

export const getDirects = async (page = 1, status = '', search = ''): Promise<ResponseDirects> => {
  const res = await axios(`/api/referrals/directs`, {
    withCredentials: true,
    params: {
      page,
      status,
      search,
    },
  })
  return await res.data
}
