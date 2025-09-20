'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  SelectItem,
  Select,
  addToast,
} from '@heroui/react'
import { newWithdraw } from '@/services/withdrawals.service'

type Props = {
  isOpen: boolean
  setIsOpen: (opened: boolean) => void
  balance: number
}

export default function WithdrawModal({ balance, isOpen, setIsOpen }: Props) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('crypto')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    if (value > balance) {
      setError('No puedes retirar más de tu balance disponible')
      return
    }
    if (!reference.trim()) {
      setError('Debes ingresar la referencia para el retiro')
      return
    }
    setError('')

    try {
      setLoading(true)
      await newWithdraw(Number(amount), method, reference)

      addToast({
        title: '✅ Retiro solicitado',
        description: `Tu solicitud de retiro por $${value.toFixed(2)} ha sido enviada correctamente.`,
        color: 'success',
      })

      setIsOpen(false)
      setAmount('')
      setReference('')
    } catch (err) {
      console.error(err)
      addToast({
        title: '❌ Error en el retiro',
        description: 'Ocurrió un problema al procesar tu solicitud. Intenta nuevamente.',
        color: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Solicitar retiro</ModalHeader>
              <ModalBody>
                <p>
                  Tu balance disponible es: <b>${balance.toFixed(2)}</b>
                </p>

                <Input
                  type="number"
                  label="Monto a retirar"
                  placeholder="Ej. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <Select
                  label="Método de retiro"
                  selectedKeys={[method]}
                  onSelectionChange={(keys) => setMethod(Array.from(keys)[0] as string)}
                >
                  <SelectItem key="crypto">Crypto</SelectItem>
                  <SelectItem key="bank">Banco</SelectItem>
                  <SelectItem key="paypal">PayPal</SelectItem>
                </Select>

                <Input
                  type="text"
                  label="Referencia"
                  placeholder={
                    method === 'crypto'
                      ? 'Dirección de wallet (POLYGON)'
                      : method === 'bank'
                        ? 'Número de cuenta CLABE'
                        : 'Correo de PayPal'
                  }
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />

                {error && <span className="text-red-500 text-sm">{error}</span>}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={loading}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleWithdraw} isLoading={loading}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
