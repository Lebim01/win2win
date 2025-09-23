'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input, Button, Card, CardHeader, CardBody, Progress, Tooltip } from '@heroui/react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
import axios from 'axios'

type ApiResponse = { ok: boolean; message?: string }

const MIN_LEN = 8

function scorePassword(pw: string) {
  // Regla simple: sumar puntos por variedad y longitud
  let score = 0
  if (!pw) return 0
  const rules = [
    /[a-z]/, // minúsculas
    /[A-Z]/, // mayúsculas
    /\d/, // números
    /[^A-Za-z0-9]/, // símbolos
  ]
  score += Math.min(6, Math.floor(pw.length / 2)) // premio por longitud
  rules.forEach((r) => (r.test(pw) ? (score += 2) : null)) // variedad
  return Math.min(10, score) // normaliza a 10
}

function scoreToLabel(score: number) {
  if (score >= 8) return 'Fuerte'
  if (score >= 5) return 'Media'
  return 'Débil'
}

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token inválido o faltante. Vuelve a solicitar el enlace de recuperación.')
    }
  }, [token])

  const pwScore = useMemo(() => scorePassword(password), [password])
  const pwPercent = (pwScore / 10) * 100
  const pwLabel = scoreToLabel(pwScore)

  const validate = () => {
    if (!token) return 'Token inválido.'
    if (!password || !confirm) return 'Completa ambos campos.'
    if (password.length < MIN_LEN) return `La contraseña debe tener al menos ${MIN_LEN} caracteres.`
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNum = /\d/.test(password)
    const hasSym = /[^A-Za-z0-9]/.test(password)
    if (!(hasLower && hasUpper && hasNum && hasSym))
      return 'Usa mayúsculas, minúsculas, números y un símbolo.'
    if (password !== confirm) return 'Las contraseñas no coinciden.'
    return null
  }

  const handleSubmit = async () => {
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res: ApiResponse = await axios.post('/api/reset', { token, password })
      if (!res.ok) throw new Error(res.message || 'No se pudo restablecer la contraseña.')
      setSuccess(true)
      // Opcional: redirigir al login después de unos segundos
      setTimeout(() => router.push('/login'), 2000)
    } catch (e: any) {
      setError(e?.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <h1 className="text-xl font-semibold text-white">Restablecer contraseña</h1>
          <p className="text-gray-400 text-sm">Crea una nueva contraseña segura para tu cuenta.</p>
        </CardHeader>

        <CardBody className="space-y-5">
          {success ? (
            <div className="text-center space-y-2">
              <p className="text-green-400">✅ Tu contraseña se actualizó correctamente.</p>
              <p className="text-gray-400 text-sm">Redirigiendo al inicio de sesión…</p>
              <Button className="mt-2" onPress={() => router.push('/login')} color="primary">
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              {/* Campo: Nueva contraseña */}
              <Tooltip
                content={
                  <div className="text-xs">
                    Requisitos:
                    <ul className="list-disc ml-4 mt-1">
                      <li>Mínimo {MIN_LEN} caracteres</li>
                      <li>Mayúsculas y minúsculas</li>
                      <li>Números</li>
                      <li>Símbolos</li>
                    </ul>
                  </div>
                }
                placement="top"
              >
                <div>
                  <Input
                    label="Nueva contraseña"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    endContent={
                      <button
                        type="button"
                        aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        onClick={() => setShowPw((v) => !v)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    }
                  />
                  <div className="mt-2">
                    <Progress
                      aria-label="Fortaleza de la contraseña"
                      value={pwPercent}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Fortaleza:</span>
                      <span
                        className={
                          pwScore >= 8
                            ? 'text-green-400'
                            : pwScore >= 5
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }
                      >
                        {pwLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* Campo: Confirmación */}
              <Input
                label="Confirmar contraseña"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                endContent={
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    {showConfirm ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                }
              />

              {/* Mensaje de error */}
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              {/* Botón enviar */}
              <Button
                color="primary"
                fullWidth
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!token}
              >
                Guardar nueva contraseña
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
