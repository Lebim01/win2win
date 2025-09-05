'use client'
import { FormEventHandler, useState } from 'react'
import { FormValuesSchema } from './zod'
import Link from 'next/link'
import { Button, Input } from '@heroui/react'

const Signup = () => {
  const [error, setErrors] = useState<{
    name?: string[] | undefined
    email?: string[] | undefined
    password?: string[] | undefined
    confirmPassword?: string[] | undefined
  }>({})

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
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
      console.log(values)
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
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                variant="faded"
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                variant="faded"
              />

              <Input label="Your Name" name="name" required variant="faded" />

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
