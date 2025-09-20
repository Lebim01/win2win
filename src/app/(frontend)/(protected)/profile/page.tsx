'use client'
import React from 'react'

import { Avatar, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { Mail, Phone, User as UserIcon } from 'lucide-react'
import { changePassword } from '@/services/profile.service'
import { Profile, ProfileForm, ProfilePageProps } from './components/ProfileForm'
import { PasswordForm } from './components/PasswordForm'
import { CardTitle } from '@/components/ui/card'
import useMe from '@/hooks/useMe'

function ProfilePage({ profile, onSaveProfile, onChangePassword }: ProfilePageProps) {
  return (
    <div className="container mx-auto px-4 md:px-0 py-6 space-y-6">
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
          <CardBody>
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
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Mantén tus datos actualizados para recibir notificaciones sobre comisiones, retiros y
              cortes mensuales.
            </p>
          </CardBody>
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

// --------- Demo para previsualizar ---------
function DemoProfile() {
  const { data, loading } = useMe()

  if (loading || !data) return null

  return (
    <ProfilePage
      profile={{
        name: data.name as string,
        email: data.email as string,
        phone: data.phone,
      }}
      onSaveProfile={async (v) => {
        console.log('save profile', v)
        // TODO: Llama a tu API Payload/Nest
      }}
      onChangePassword={async (v) => {
        await changePassword(v.current, v.next)
      }}
    />
  )
}

export default DemoProfile
