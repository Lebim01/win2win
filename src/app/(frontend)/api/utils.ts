import { NextRequest, NextResponse } from 'next/server'
import { BasePayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { Customer } from '@/payload-types'

type CustomerWCollection = Customer & { collection: 'customers' }

type CustomerMe = Omit<
  Customer,
  | 'ancestors'
  | 'placementLocked'
  | 'sessions'
  | 'level'
  | 'membershipHistory'
  | 'role'
  | 'updatedAt'
  | 'collection'
  | 'inviterCode'
>

const safeUser = ({
  ancestors,
  placementLocked,
  sessions,
  level,
  membershipHistory,
  role,
  updatedAt,
  collection,
  inviterCode,
  ...user
}: CustomerWCollection): CustomerMe => {
  return user
}

export const getLoggedUser = async (
  payload: BasePayload,
  req: NextRequest,
): Promise<{
  response?: NextResponse<{ error: string }>
  user: CustomerMe | null
}> => {
  const token = req.cookies.get('payload-token')?.value
  if (!token) {
    return {
      user: null,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    }
  }

  const { user } = await payload.auth({
    headers: await getHeaders(),
  })

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Token inválido' }, { status: 401 }),
    }
  }

  const loggedUser = await payload.findByID({
    collection: 'customers',
    id: user.id,
    select: {
      id: true,
      name: true,
      email: true,
      membership: true,
      createdAt: true,
      referralCode: true,
      root: true,
      wallet: true,
      membershipHistory: true,
      childrenCount: true,
    },
    depth: 3,
  })

  return {
    user: safeUser(loggedUser as CustomerWCollection),
  }
}
