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

      console.log({ res })
      return redirect('/sign-in?verify=true')
    } catch (err) {
      return redirect('/sign-in?verify=false')
    }
  }

  return redirect('/sign-in?verify=false')
}

export default Verify
