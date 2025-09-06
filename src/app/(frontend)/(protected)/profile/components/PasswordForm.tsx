import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'
import { PasswordInput } from './PasswordInput'
import { PasswordStrength } from './PasswordStrength'
import { Button } from '@heroui/react'

const PasswordSchema = z
  .object({
    current: z.string().min(8, 'Mínimo 8 caracteres'),
    next: z.string().min(8, 'Mínimo 8 caracteres'),
    confirm: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })
  .refine((d) => d.current !== d.next, {
    message: 'La nueva contraseña debe ser diferente',
    path: ['next'],
  })

export type PasswordValues = z.infer<typeof PasswordSchema>

export function PasswordForm({
  onChangePassword,
}: {
  onChangePassword?: (v: PasswordValues) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<PasswordValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { current: '', next: '', confirm: '' },
  })

  const [show, setShow] = useState<{ current: boolean; next: boolean; confirm: boolean }>({
    current: false,
    next: false,
    confirm: false,
  })
  const nextValue = watch('next')

  const onSubmit = async (values: PasswordValues) => {
    await onChangePassword?.(values)
    reset({ current: '', next: '', confirm: '' })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordInput
            label="Contraseña actual"
            id="current"
            placeholder="••••••••"
            register={register('current')}
            error={errors.current?.message}
            visible={show.current}
            onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          />
          <PasswordInput
            label="Nueva contraseña"
            id="next"
            placeholder="••••••••"
            register={register('next')}
            error={errors.next?.message}
            visible={show.next}
            onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
          />
          <div className="md:col-span-2">
            <PasswordInput
              label="Confirmar nueva contraseña"
              id="confirm"
              placeholder="••••••••"
              register={register('confirm')}
              error={errors.confirm?.message}
              visible={show.confirm}
              onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            />
          </div>
        </div>
        <PasswordStrength value={nextValue} />
        <p className="text-xs text-muted-foreground">
          Recomendación: usa al menos 8 caracteres, combinando mayúsculas, minúsculas, números y
          símbolos.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </CardFooter>
    </Card>
  )
}
