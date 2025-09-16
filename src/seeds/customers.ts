import { type Payload } from 'payload'
import crypto from 'crypto'

function genCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase() // 6 chars
}

export const seedCustomers = async (payload: Payload) => {
  console.log('🌱 Seeding demo customers...')

  // 1) Crear ROOT (nivel 0)
  const rootReferralCode = 'A4A123'
  const root = await payload.create({
    collection: 'customers',
    data: {
      email: 'root@example.com',
      password: '11111111',
      name: 'Root User',
      referralCode: rootReferralCode,
      level: 0,
      placementLocked: true,
      root: null, // él mismo no tiene root
      referredBy: null, // nadie lo invitó
      inviterCode: null, // nadie lo invitó
      _verified: true,
      role: 'customer',
    },
    disableVerificationEmail: true,
  })

  // Helper recursivo BFS para crear hasta profundidad N
  async function createChildren(parent: any, level: number, maxDepth: number) {
    if (level > maxDepth) return

    for (let i = 0; i < 5; i++) {
      const referralCode = genCode()

      const child = await payload.create({
        collection: 'customers',
        data: {
          email: `demo-${level}-${i}-${crypto.randomBytes(2).toString('hex')}@mail.com`,
          password: '11111111',
          name: `Demo L${level} #${i + 1}`,
          referralCode,

          // 🔑 campos importantes
          inviterCode: rootReferralCode,
          root: root.id,
          ancestors: [...(parent.ancestors ?? []), parent.id],

          _verified: true,
          role: 'customer',
        },
        disableVerificationEmail: true,
      })

      await createChildren(child, level + 1, maxDepth)
    }
  }

  // 2) Poblar hasta nivel 3 (ejemplo). Cambia maxDepth hasta 7 si quieres full.
  // await createChildren(root, 1, 3)

  console.log('✅ Customers demo creados.')
}
