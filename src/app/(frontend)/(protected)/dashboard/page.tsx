import { headers as getHeaders } from 'next/headers'
import config from '@/payload.config'
import { getPayload } from 'payload'

const DashboardPage = async () => {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return <div>llegaste al dashboard {user?.name}</div>
}

export default DashboardPage
