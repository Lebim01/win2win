'use client'
import { Button, Input } from '@heroui/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEventHandler, useEffect, useState } from 'react'

const SignIn = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const verify = searchParams.get('verify') as string
  const [verified, setVerified] = useState<null | boolean>(null)

  useEffect(() => {
    if (verify) {
      setVerified(verify == 'true')
    }
  }, [verify])

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)

    const response = await fetch(`/api/customers/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
      credentials: 'include',
    })

    if (!response.ok) {
      alert('login failed')
      return
    }

    router.refresh()
  }

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white border border-[var(--color-border)] rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              Inicia sesión en tu cuenta
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
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                variant="faded"
              />

              {verified !== null &&
                (verified ? (
                  <span className="text-green-400">Verificado correctamente</span>
                ) : (
                  <span className="text-red-400">La verificación falló</span>
                ))}

              <Button type="submit" color="primary" fullWidth>
                Entrar
              </Button>
              <p className="text-sm font-light text-right">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  ¿Olvidaste tu contraseña?
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
