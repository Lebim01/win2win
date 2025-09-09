import { logout as action } from '@/actions/logout'

export const logout = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/customers/logout?allSessions=false`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ).finally(() => {
    action()
    window.location.reload()
  })
}
