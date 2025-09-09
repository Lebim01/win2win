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
