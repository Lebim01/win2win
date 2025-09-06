import { Admin } from '@/payload-types'
import type { AccessArgs } from 'payload'

type isAuthenticated = (args: AccessArgs<Admin>) => boolean

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return Boolean(user)
}
