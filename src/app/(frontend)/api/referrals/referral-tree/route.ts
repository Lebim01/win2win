import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getLoggedUser } from '../../utils'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const query: any = await payload.db.drizzle.execute(`
      WITH RECURSIVE tree AS (
        SELECT
          u.id                            AS user_id,
          NULL::integer                   AS parent_id,
          0                               AS depth,
          ARRAY[u.id]                     AS path,
          u.name                          AS display_name,
          u.membership_is_active          AS membership_is_active,
          u.membership_first_activated_at AS membership_first_activated_at
        FROM customers u
        WHERE u.id = ${user?.id}

        UNION ALL

        SELECT
          ch.id,
          ch.referred_by_id,
          t.depth + 1,
          t.path || ch.id,
          ch.name,
          ch.membership_is_active,
          ch.membership_first_activated_at
        FROM customers ch
        JOIN tree t ON ch.referred_by_id = t.user_id
        WHERE t.depth < 7
          AND NOT (ch.id = ANY(t.path))
      )
      SELECT * FROM tree ORDER BY membership_first_activated_at;
    `)

    return NextResponse.json(query.rows)
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
