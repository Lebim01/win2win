import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@heroui/react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordInput({
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
