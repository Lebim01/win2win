'use client'

import { useState } from 'react'
import { Input, Button, Card, CardHeader, CardBody } from '@heroui/react'
import axios from 'axios'

export default function RecoveryPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRecovery = async () => {
    if (!email) {
      setError('Por favor ingresa tu correo electrónico')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Ingresa un correo válido')
      return
    }

    setError('')
    setLoading(true)

    try {
      await axios.post('/api/forgot-password', {
        email,
      })

      setSuccess(true)
    } catch (e) {
      setError('Hubo un problema al enviar el enlace, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <h1 className="text-xl font-semibold text-white">Recuperar contraseña</h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu correo para enviarte un enlace de recuperación.
          </p>
        </CardHeader>

        <CardBody className="space-y-4">
          {success ? (
            <p className="text-green-400 text-center">
              ✅ Hemos enviado un enlace de recuperación a tu correo.
            </p>
          ) : (
            <>
              <Input
                type="email"
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!error}
                errorMessage={error}
              />

              <Button color="primary" fullWidth onPress={handleRecovery} isLoading={loading}>
                Enviar enlace
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
