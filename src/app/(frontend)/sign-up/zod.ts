import { z } from 'zod'

export const FormValuesSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nombre muy corto')
      .max(80, 'Nombre muy largo')
      .nonoptional({ error: 'El nombre es requerido' }),

    username: z
      .string()
      .min(3, { message: 'El usuario debe tener al menos 3 caracteres' })
      .max(20, { message: 'El usuario no puede superar los 20 caracteres' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'El usuario solo puede contener letras, números y guiones bajos',
      }),

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

    phone: z.string().regex(/^\+?[0-9]{10,15}$/, {
      message:
        'El teléfono debe tener entre 10 y 15 dígitos, con prefijo internacional opcional (+)',
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
