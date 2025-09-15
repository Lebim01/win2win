import { z } from 'zod'

export const FormValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nombre muy corto')
      .max(80, 'Nombre muy largo')
      .nonoptional({ error: 'El nombre es requerido' }),

    email: z
      .email({ error: 'Email no valido' })
      .trim()
      .transform((v) => v.toLowerCase())
      .nonoptional({ error: 'El email es requerido' }),

    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no debe exceder 72 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
        'Debe incluir mayúsculas, minúsculas, número y símbolo',
      )
      .nonoptional({ error: 'La contraseña es requerida' }),

    confirmPassword: z.string().nonoptional({
      error: 'Confirma tu contraseña',
    }),

    //coupon: z.string().min(6).max(6),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
      })
    }
  })

export type FormValues = z.infer<typeof FormValuesSchema>
