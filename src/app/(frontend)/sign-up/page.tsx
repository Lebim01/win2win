'use client'
import { FormEventHandler, useEffect, useState } from 'react'
import { FormValuesSchema } from './zod'
import { Button, Input } from '@heroui/react'
import { useSearchParams } from 'next/navigation'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import axios from 'axios'

type FieldKey =
  | 'name'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'coupon'
  | 'username'
  | 'phone'
  | 'form'

type Errors = Partial<Record<FieldKey, string[]>>

const Signup = () => {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') as string
  const [success, setSuccess] = useState(false)

  const [error, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [root, setRoot] = useState('')

  // estado controlado del formulario
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    coupon: '',
    username: '',
    phone: '',
  })

  // dirty: marca si el usuario ya interactuó con el campo
  const [dirty, setDirty] = useState<Partial<Record<FieldKey, boolean>>>({})

  useEffect(() => {
    if (refCode) {
      axios.get(`/api/referrals/${refCode}`).then((r) => {
        if (r.data.name) setRoot(r.data.name)
      })
    }
  }, [refCode])

  // helpers para limpiar errores por campo cuando se modifica
  const clearFieldError = (key: FieldKey) => {
    setErrors((prev) => {
      const { [key]: _omit, ...rest } = prev
      return rest
    })
  }

  // onChange genérico: marca dirty, limpia error del campo (y dependientes si aplica) y setea el valor
  const handleChange = (key: Exclude<FieldKey, 'form'>) => (val: string) => {
    setValues((v) => ({ ...v, [key]: val }))
    if (!dirty[key]) setDirty((d) => ({ ...d, [key]: true }))

    // limpiar error del propio campo
    clearFieldError(key)

    // si cambia password, también conviene limpiar el error de confirmPassword
    if (key === 'password') {
      clearFieldError('confirmPassword')
    }
  }

  // también marcamos dirty en blur (por si el usuario pega y sale del campo)
  const handleBlur = (key: Exclude<FieldKey, 'form'>) => {
    if (!dirty[key]) setDirty((d) => ({ ...d, [key]: true }))
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrors({})

    const parsed = FormValuesSchema.safeParse(values)
    if (!parsed.success) {
      // errores por campo (solo mostramos si el campo ya es dirty o al enviar)
      const fieldErrors = parsed.error.flatten().fieldErrors as Errors

      // Si quieres ocultar errores de campos que no están dirty, filtra aquí:
      const filtered: Errors = {}
      ;(Object.keys(fieldErrors) as FieldKey[]).forEach((k) => {
        const msgs = fieldErrors[k]
        if (!msgs || msgs.length === 0) return
        // mostrar siempre en submit:
        filtered[k] = msgs
      })

      setErrors(filtered)
      return
    }

    const valuesOk = parsed.data

    try {
      setLoading(true)
      const response = await axios.post(
        '/api/sign-up',
        {
          ...valuesOk,
          refCode,
        },
        { withCredentials: true },
      )

      if (response.data.ok) setSuccess(true)
    } catch (err: any) {
      if (err.response?.data?.details) {
        setErrors({ form: ['Error: ' + err.response.data.details] })
      } else {
        setErrors({ form: ['Error inesperado, intenta más tarde'] })
      }
    } finally {
      setLoading(false)
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
              <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <Input
                  label="Correo"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  isRequired
                  required
                  variant="faded"
                  value={values.email}
                  onValueChange={handleChange('email')}
                  onBlur={() => handleBlur('email')}
                  isInvalid={!!error.email && error.email.length > 0}
                  errorMessage={error.email ? error.email[0] : null}
                  isDisabled={loading}
                  autoComplete="off"
                />

                <Input
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  isRequired
                  required
                  variant="faded"
                  value={values.password}
                  onValueChange={handleChange('password')}
                  onBlur={() => handleBlur('password')}
                  isInvalid={!!error.password && error.password.length > 0}
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
                  autoComplete="off"
                />

                <Input
                  label="Confirmar Contraseña"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  isRequired
                  required
                  variant="faded"
                  value={values.confirmPassword}
                  onValueChange={handleChange('confirmPassword')}
                  onBlur={() => handleBlur('confirmPassword')}
                  isInvalid={!!error.confirmPassword && error.confirmPassword.length > 0}
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
                  value={values.name}
                  onValueChange={handleChange('name')}
                  onBlur={() => handleBlur('name')}
                  isInvalid={!!error.name && error.name.length > 0}
                  errorMessage={error.name ? error.name[0] : null}
                  isDisabled={loading}
                />

                <Input
                  label="Usuario"
                  name="username"
                  isRequired
                  required
                  variant="faded"
                  value={values.username}
                  onValueChange={handleChange('username')}
                  onBlur={() => handleBlur('username')}
                  isInvalid={!!error.username && error.username.length > 0}
                  errorMessage={error.username ? error.username[0] : null}
                  isDisabled={loading}
                  autoComplete="off"
                />

                <Input
                  label="Celular"
                  name="phone"
                  isRequired
                  required
                  variant="faded"
                  value={values.phone}
                  onValueChange={handleChange('phone')}
                  onBlur={() => handleBlur('phone')}
                  isInvalid={!!error.phone && error.phone.length > 0}
                  errorMessage={error.phone ? error.phone[0] : null}
                  isDisabled={loading}
                />

                {/* Si usas cupón cuando haya root, descomenta y deja controlado:
                {root && (
                  <Input
                    label="Cupón"
                    name="coupon"
                    variant="faded"
                    value={values.coupon}
                    onValueChange={handleChange('coupon')}
                    onBlur={() => handleBlur('coupon')}
                    isInvalid={!!error.coupon && error.coupon.length > 0}
                    errorMessage={error.coupon ? error.coupon[0] : null}
                    isDisabled={loading}
                  />
                )}*/}

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
