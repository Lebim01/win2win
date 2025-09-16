'use client'
import { Button, toast } from '@payloadcms/ui'
import AutoComplete from '../ui/autocompleteFromCollection'
import { useState } from 'react'

import { FaSpinner } from 'react-icons/fa'
import activateMembership from '@/actions/activateMembership'

const ActivateUser = () => {
  const [membership, setMembership] = useState(1)
  const [owner, setOwner] = useState(0)
  const [result, setResult] = useState<{ id: number; code: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (confirm('seguro')) {
        setLoading(true)
        await activateMembership({
          userId: owner,
          membershipId: membership,
        })
        ;(e.target as HTMLFormElement).reset()
        toast.success('Activado!')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gutter gutter--left gutter--right grid grid-cols-2 pb-4">
      <form className="card" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <span className="font-medium">Activar un usuario</span>
          <span className="font-bold underline">Está activación reparté bonos</span>

          {result.length > 0 && (
            <span className="text-green-400">{result.length} cupones generados</span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span>Membersia</span>
            <AutoComplete
              collection="membership"
              id="id"
              label="name"
              onChange={(id) => setMembership(id)}
            />
          </div>
          <div>
            <span>Dueño</span>
            <AutoComplete
              collection="customers"
              id="id"
              label="name"
              onChange={(owner) => setOwner(owner)}
            />
          </div>
          <Button className="m-0 h-min" type="submit" disabled={loading}>
            <div className="flex justify-center items-center gap-2">
              {loading && <FaSpinner className="animate-spin" />}
              <span>Generar</span>
            </div>
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ActivateUser
