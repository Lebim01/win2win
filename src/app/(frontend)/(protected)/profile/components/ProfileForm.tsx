import { PasswordValues } from './PasswordForm'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button, Card, CardBody, CardFooter, CardHeader, Input } from '@heroui/react'
import { Mail, Phone } from 'lucide-react'

// --------- Tipos ---------
export type Profile = {
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
}

export type ProfilePageProps = {
  profile: Profile
  onSaveProfile?: (values: Profile) => Promise<void> | void
  onChangePassword?: (values: PasswordValues) => Promise<void> | void
}

// --------- Validaciones ---------
const phoneRegex = /^\+?[0-9\s()-]{7,20}$/

const ProfileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), {
      message: 'Formato de teléfono inválido',
    }),
})

type ProfileValues = z.infer<typeof ProfileSchema>

export function ProfileForm({
  defaultValues,
  onSave,
}: {
  defaultValues: Profile
  onSave?: (v: Profile) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: defaultValues.name,
      email: defaultValues.email,
      phone: defaultValues.phone ?? undefined,
    },
  })

  const onSubmit = async (values: ProfileValues) => {
    await onSave?.(values)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Editar información</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu nombre" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Correo</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-9"
                placeholder="tucorreo@dominio.com"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="phone">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-9"
                placeholder="+52 55 1234 5678"
                {...register('phone')}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          color={isDirty ? 'primary' : 'default'}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </Card>
  )
}
