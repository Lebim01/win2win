import type { BasePayload, PayloadRequest } from 'payload'

export type CustomerLite = {
  id: number
  level?: number
  referredBy?: string | null
  root?: string | null
  ancestors?: string[]
  childrenCount?: number
  placementLocked?: boolean
  referralCode?: string
}

async function getChildren(req: PayloadRequest, parentId: number) {
  const res = await req.payload.find({
    collection: 'customers',
    where: { referredBy: { equals: parentId } },
    limit: 1000,
    depth: 0,
    select: { id: true, childrenCount: true, level: true },
    sort: 'id',
  })
  return res.docs as Array<Pick<CustomerLite, 'id' | 'childrenCount' | 'level'>>
}

async function findPlacementBFS(req: PayloadRequest, rootId: number) {
  const rootDoc = await req.payload.findByID({
    collection: 'customers',
    id: rootId,
    depth: 0,
    select: { id: true, level: true, childrenCount: true },
  })

  const queue: Array<Pick<CustomerLite, 'id' | 'level' | 'childrenCount'>> = [
    { id: rootDoc.id, level: rootDoc.level ?? 0, childrenCount: rootDoc.childrenCount ?? 0 },
  ]

  while (queue.length) {
    const node = queue.shift()!
    const nextLevel = (node.level ?? 0) + 1

    if ((node.childrenCount ?? 0) < 5 && nextLevel <= 7) {
      return { parentId: node.id, level: nextLevel }
    }

    const kids = await getChildren(req, node.id)
    for (const k of kids)
      queue.push({ id: k.id, level: k.level ?? 0, childrenCount: k.childrenCount ?? 0 })
  }

  // Fallback raro: cuelga directo del root a nivel 1
  return { parentId: rootId, level: 1 }
}

async function buildAncestors(req: PayloadRequest, parentId: number) {
  const p = await req.payload.findByID({
    collection: 'customers',
    id: parentId,
    depth: 0,
    select: { id: true, ancestors: true },
  })
  const pa = (p.ancestors as number[] | undefined) ?? []
  return [...pa, p.id]
}

async function tryAttachChildAtomically(req: PayloadRequest, parentId: number, childId: number) {
  const parent = await req.payload
    .find({
      collection: 'customers',
      where: {
        id: {
          equals: parentId,
        },
        childrenCount: {
          less_than: 5,
        },
      },
      limit: 1,
      sort: 'id',
    })
    .then((r) => (r.totalDocs > 0 ? r.docs[0] : null))

  if (!parent) return null

  const children = parent.children ?? []
  const newChildren = children.includes(childId) ? children : [...children, childId]

  const newCount = typeof parent.childrenCount === 'number' ? parent.childrenCount + 1 : 1

  const updated = await req.payload.update({
    collection: 'customers',
    where: {
      id: {
        equals: parentId,
      },
    },
    data: {
      children: newChildren,
      childrenCount: newCount,
    },
    user: req.user,
  })

  return updated?.docs?.[0] ?? null
}

/**
 * Asigna la posición del usuario `childId` bajo el árbol de `rootId`
 * cumpliendo matriz 5×7 con derrame por BFS. Es idempotente y con reintentos.
 *
 * @param req PayloadRequest
 * @param childId ID del cliente a colocar
 * @param rootId  ID del root (sponsor cuyo código se usó)
 * @param maxRetries reintentos ante colisiones de concurrencia
 */
export async function assign(req: PayloadRequest, childId: number, rootId: number, maxRetries = 5) {
  // si el doc ya está bloqueado o sin root, no hacemos nada
  const child = await req.payload.findByID({
    collection: 'customers',
    id: childId,
    depth: 0,
    select: { id: true, referredBy: true, placementLocked: true, root: true },
  })

  if (!rootId) return { ok: false, reason: 'NO_ROOT' }
  if (child.placementLocked) return { ok: true, reason: 'ALREADY_LOCKED' }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // 1) Buscar siguiente hueco por BFS
    const { parentId, level } = await findPlacementBFS(req, rootId)
    const ancestors = await buildAncestors(req, parentId)

    // 2) Actualizar al niño con parent/level/ancestors antes del attach
    await req.payload.update({
      collection: 'customers',
      id: childId,
      data: {
        referredBy: parentId,
        root: rootId,
        level,
        ancestors,
      },
      depth: 0,
      user: req.user,
    })

    // 3) Intento atómico de attach
    const ok = await tryAttachChildAtomically(req, parentId, childId)
    if (ok) {
      await req.payload.update({
        collection: 'customers',
        id: childId,
        data: { placementLocked: true },
        depth: 0,
        user: req.user,
      })
      return { ok: true, reason: 'ATTACHED' }
    }
    // si falló, otra iteración recalculará BFS y reintentará
  }

  return { ok: false, reason: 'MAX_RETRIES' }
}
