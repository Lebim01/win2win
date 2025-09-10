'use client'
import { FormEventHandler, useState } from 'react'
import { FormValuesSchema } from './zod'
import { Button, Input } from '@heroui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import axios from 'axios'

const Signup = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('refCode') as string

  const [error, setErrors] = useState<{
    name?: string[] | undefined
    email?: string[] | undefined
    password?: string[] | undefined
    confirmPassword?: string[] | undefined
    form?: string[] | undefined
  }>({})

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const formValues = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const parsed = FormValuesSchema.safeParse(formValues)
    if (!parsed.success) {
      // errores por campo
      console.log(parsed.error.flatten().fieldErrors)
      setErrors(parsed.error.flatten().fieldErrors)
    } else {
      const values = parsed.data

      try {
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
          await fetch(`/api/customers/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.get('email'),
              password: formData.get('password'),
            }),
            credentials: 'include',
          })
          router.refresh()
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
      }
    }
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight">Create an account</h1>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Your email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                variant="faded"
                isInvalid={error?.name && error?.name?.length > 0}
                errorMessage={error.name ? error.name[0] : null}
              />

              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                required
                variant="faded"
                isInvalid={error?.password && error?.password?.length > 0}
                errorMessage={error.password ? error.password[0] : null}
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
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder=""
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
              />

              <Input
                label="Your Name"
                name="name"
                required
                variant="faded"
                isInvalid={error?.name && error?.name?.length > 0}
                errorMessage={error.name ? error.name[0] : null}
              />

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    aria-describedby="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                    required
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

              <Button type="submit" color="primary" fullWidth>
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
        </div>
      </div>
    </section>
  )
}

export default Signup
