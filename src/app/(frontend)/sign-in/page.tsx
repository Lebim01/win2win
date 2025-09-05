'use client'
import { Button, Input } from '@heroui/react'
import Link from 'next/link'

const SignIn = () => {
  const onSubmit = () => {}

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              Sign in to your account
            </h1>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Email"
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

              <Button type="submit" color="primary" fullWidth>
                Sign in
              </Button>
              <p className="text-sm font-light text-right">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SignIn
