'use client'
import { FormEventHandler, useEffect, useState } from 'react'
import { FormValuesSchema } from './zod'
import { Button, Input } from '@heroui/react'
import { useSearchParams } from 'next/navigation'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import axios from 'axios'

const Signup = () => {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') as string
  const [success, setSuccess] = useState(false)

  const [error, setErrors] = useState<{
    name?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    coupon?: string[]
    form?: string[]
    username?: string[]
    phone?: string[]
  }>({})
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [root, setRoot] = useState('')

  useEffect(() => {
    if (refCode) {
      axios.get(`/api/referrals/${refCode}`).then((r) => {
        if (r.data.name) {
          setRoot(r.data.name)
        }
      })
    }
  }, [refCode])

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrors({})

    const form = e.currentTarget
    const formData = new FormData(form)

    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      coupon: formData.get('coupon') as string,
      username: formData.get('username') as string,
      phone: formData.get('phone') as string,
    }

    const parsed = FormValuesSchema.safeParse(formValues)
    if (!parsed.success) {
      // errores por campo
      console.log(parsed.error.flatten().fieldErrors)
      setErrors(parsed.error.flatten().fieldErrors)
    } else {
      const values = parsed.data

      try {
        setLoading(true)
        const response = await axios.post(
          '/api/sign-up',
          {
            ...values,
            refCode,
          },
          {
            withCredentials: true,
          },
        )

        if (response.data.ok) {
          setSuccess(true)
        }
      } catch (err: any) {
        if (err.response?.data?.details) {
          setErrors({
            form: ['Error: ' + err.response.data.details],
          })
        } else {
          setErrors({
            form: ['Error inesperado, intenta mas tarde'],
          })
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          {!success && (
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {refCode && root && (
                <span className="text-blue-300 font-light">Patrocinador: {root}</span>
              )}
              <h1 className="text-xl font-bold leading-tight tracking-tight">Create an account</h1>
              <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                  label="Correo"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.name && error?.name?.length > 0}
                  errorMessage={error.name ? error.name[0] : null}
                  isDisabled={loading}
                />

                <Input
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.password && error?.password?.length > 0}
                  errorMessage={error.password ? error.password[0] : null}
                  description="Debe incluir mayúsculas, minúsculas, número y símbolo"
                  endContent={
                    showPassword ? (
                      <FaRegEye
                        onClick={() => setShowPassword(false)}
                        className="hover:cursor-pointer"
                      />
                    ) : (
                      <FaRegEyeSlash
                        onClick={() => setShowPassword(true)}
                        className="hover:cursor-pointer hover:text-blue-300"
                      />
                    )
                  }
                  isDisabled={loading}
                />

                <Input
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder=""
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.confirmPassword && error?.confirmPassword?.length > 0}
                  errorMessage={error.confirmPassword ? error.confirmPassword[0] : null}
                  endContent={
                    showConfirmPassword ? (
                      <FaRegEye
                        onClick={() => setShowConfirmPassword(false)}
                        className="hover:cursor-pointer"
                      />
                    ) : (
                      <FaRegEyeSlash
                        onClick={() => setShowConfirmPassword(true)}
                        className="hover:cursor-pointer hover:text-blue-300"
                      />
                    )
                  }
                  isDisabled={loading}
                />

                <Input
                  label="Nombre"
                  name="name"
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.name && error?.name?.length > 0}
                  errorMessage={error.name ? error.name[0] : null}
                  isDisabled={loading}
                />

                <Input
                  label="Usuario"
                  name="username"
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.username && error?.username?.length > 0}
                  errorMessage={error.username ? error.username[0] : null}
                  isDisabled={loading}
                />

                <Input
                  label="Celular"
                  name="phone"
                  isRequired
                  required
                  variant="faded"
                  isInvalid={error?.phone && error?.phone?.length > 0}
                  errorMessage={error.phone ? error.phone[0] : null}
                  isDisabled={loading}
                />

                {/*root && (
                  <Input
                    label="Cupón"
                    name="coupon"
                    variant="faded"
                    defaultValue=""
                    isInvalid={error?.coupon && error?.coupon?.length > 0}
                    errorMessage={error.coupon ? error.coupon[0] : null}
                    isDisabled={loading}
                  />
                )*/}

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                      I accept the{' '}
                      <a
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                {error.form && error.form.length > 0 && (
                  <div className="text-center">
                    <span className="text-red-400">{error.form[0]}</span>
                  </div>
                )}
                <Button type="submit" color="primary" fullWidth isLoading={loading}>
                  Create an account
                </Button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          )}
          {success && (
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <span className="text-green-400">
                Revisá tu correo electrónico para verificar tu cuenta
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Signup
