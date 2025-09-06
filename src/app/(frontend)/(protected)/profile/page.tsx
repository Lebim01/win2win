'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, Divider, Progress } from '@heroui/react'
import { Mail, Phone, User as UserIcon, KeyRound, Eye, EyeOff } from 'lucide-react'
import { changePassword } from '@/services/profile.service'

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

// --------- Componente principal ---------
export function ProfilePage({ profile, onSaveProfile, onChangePassword }: ProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <UserIcon className="h-6 w-6" /> Perfil
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: avatar + datos básicos */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Información básica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar
                className="h-16 w-16"
                src={profile.avatarUrl ?? undefined}
                name={profile.name}
              />
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> {profile.name}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {profile.email}
                </div>
                {profile.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <Phone className="h-4 w-4" /> Sin teléfono
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Mantén tus datos actualizados para recibir notificaciones sobre comisiones, retiros y
              cortes mensuales.
            </p>
          </CardContent>
        </Card>

        {/* Columna derecha: formularios */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm defaultValues={profile} onSave={onSaveProfile} />
          <Divider />
          <PasswordForm onChangePassword={onChangePassword} />
        </div>
      </div>
    </div>
  )
}

// --------- Formulario de perfil ---------
function ProfileForm({
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
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting || !isDirty} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// --------- Formulario de contraseña ---------
function PasswordForm({
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

  const [show, setShow] = React.useState<{ current: boolean; next: boolean; confirm: boolean }>({
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

function PasswordInput({
  label,
  id,
  placeholder,
  register,
  error,
  visible,
  onToggle,
}: {
  label: string
  id: string
  placeholder?: string
  register: ReturnType<typeof useForm>['register'] extends (name: any) => infer R ? R : any
  error?: string
  visible?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          {...(register as any)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function PasswordStrength({ value = '' }: { value?: string }) {
  const score = getPasswordScore(value)
  const label = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'][score]
  const pct = ((score + 1) / 5) * 100
  return (
    <div className="space-y-1">
      <Progress
        aria-label="Loading..."
        value={pct}
        color={pct < 40 ? 'danger' : pct < 80 ? 'warning' : 'success'}
      />
      <div className="text-xs text-muted-foreground">Seguridad: {label}</div>
    </div>
  )
}

// --------- Utilidades ---------
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getPasswordScore(pw: string) {
  // 0..4: heurística simple
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(4, score - 1)
}

// --------- Demo para previsualizar ---------
export default function DemoProfile() {
  const profile: Profile = {
    name: 'Kevin Alvarez',
    email: 'kevin@example.com',
    phone: '+52 669 214 2246',
    avatarUrl: undefined,
  }

  return (
    <ProfilePage
      profile={profile}
      onSaveProfile={async (v) => {
        console.log('save profile', v)
        // TODO: Llama a tu API Payload/Nest
      }}
      onChangePassword={async (v) => {
        console.log('change password', v)
        // TODO: Llama a tu endpoint de cambio de contraseña
        await changePassword(v.current, v.next)
      }}
    />
  )
}
