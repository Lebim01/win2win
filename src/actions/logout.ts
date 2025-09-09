'use server'
import { cookies } from 'next/headers'

export async function logout() {
  const _ = await cookies()
  _.delete('payload-token')
}
