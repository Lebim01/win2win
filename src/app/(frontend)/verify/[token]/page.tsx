import payloadConfig from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

const Verify = async (props: { params: Promise<{ token: string }> }) => {
  const { token } = await props.params

  if (token) {
    const payload = await getPayload({
      config: payloadConfig,
    })

    try {
      const res = await payload.verifyEmail({
        collection: 'customers',
        token,
      })

      if (res) {
        return redirect('/sign-in?verify=true')
      }
    } catch (err) {
      console.error(err)
      return redirect('/sign-in')
    }
  }

  return redirect('/sign-in')
}

export default Verify
