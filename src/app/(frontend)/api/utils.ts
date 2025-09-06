import { NextRequest, NextResponse } from 'next/server'
import { BasePayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { Customer } from '@/payload-types'

type CustomerMe = Customer & { collection: 'customers' }

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

  return {
    user: user as CustomerMe,
  }
}
