'use client'
import { Button } from '@payloadcms/ui'
import { Input } from '../ui/input'
import AutoComplete from '../ui/autocompleteFromCollection'
import { useState } from 'react'
import { createMassCoupons } from '@/actions/generateCoupons'
import { FaSpinner } from 'react-icons/fa'

const GenerateBatchCoupons = () => {
  const [quantity, setQuantity] = useState('')
  const [owner, setOwner] = useState(0)
  const [result, setResult] = useState<{ id: number; code: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const coupons = await createMassCoupons({
        quantity: Number(quantity),
        owner,
      })
      setResult(coupons)
      ;(e.target as HTMLFormElement).reset()
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
          <span className="font-medium">Generar cupones para lider</span>

          {result.length > 0 && (
            <span className="text-green-400">{result.length} cupones generados</span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span>Cantidad</span>
            <Input
              placeholder="10"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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

export default GenerateBatchCoupons
