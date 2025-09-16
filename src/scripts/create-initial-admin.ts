// bootstrap/ensureRootAdmin.ts
import type { Payload } from 'payload'

export async function ensureRootAdmin(payload: Payload) {
  const email = process.env.INIT_ADMIN_EMAIL?.trim().toLowerCase() || 'admin@admin.com'
  const password = process.env.INIT_ADMIN_PASSWORD || '123987xd'
  const name = process.env.INIT_ADMIN_NAME || 'Root Admin'

  // 1) Si ya existe algún admin, no hacemos nada
  const anyAdmin = await payload.find({
    collection: 'admins',
    limit: 1,
    depth: 0,
  })

  if (anyAdmin.totalDocs > 0) {
    payload.logger.info('✓ Admin existente detectado, no se crea uno nuevo.')
    return anyAdmin.docs[0]
  }

  // 2) Intentar crear el primer admin
  try {
    const doc = await payload.create({
      collection: 'admins',
      data: {
        id: 1,
        email,
        password,
        name,
        role: 'admin',
      },
      user: {
        collection: 'admins',
        roles: 'admins',
      },
      disableVerificationEmail: true,
    })

    payload.logger.info(`✓ Admin inicial creado: ${email}`)
    if (
      process.env.INIT_ADMIN_PASSWORD === undefined ||
      process.env.INIT_ADMIN_PASSWORD === 'ChangeMe!123'
    ) {
      payload.logger.warn('⚠️ Usa INIT_ADMIN_PASSWORD en el entorno y cámbialo cuanto antes.')
    }
    return doc
  } catch (err: any) {
    // Evita crash si se inicializan varias réplicas a la vez y ya se creó
    const msg = String(err?.message || err)
    const isUnique =
      msg.includes('duplicate key') ||
      msg.includes('unique constraint') ||
      msg.includes('already exists')

    if (isUnique) {
      payload.logger.info('Otro proceso creó el admin primero; continuando.')
      return
    }

    throw err
  }
}
