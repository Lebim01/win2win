import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload, Where } from 'payload'
import { getLoggedUser } from '../../utils'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const query: any = await payload.db.drizzle.execute(`
      WITH tz_now AS (
        SELECT (now() AT TIME ZONE 'America/Mexico_City')::timestamp AS now_mx
      ),
      months AS (
        SELECT
          generate_series(
            date_trunc('month', (SELECT now_mx FROM tz_now)) - interval '11 months',
            date_trunc('month', (SELECT now_mx FROM tz_now)),
            interval '1 month'
          )::date AS month_start
      ),
      agg AS (
        SELECT
          date_trunc('month', (c.created_at AT TIME ZONE 'America/Mexico_City'))::date AS month_start,
          SUM(c.amount)::numeric(12,2) AS monthly_commissions
        FROM referral_payouts c
        WHERE c.created_at >= (SELECT min(month_start) FROM months)
          AND c.created_at <  (SELECT max(month_start) FROM months) + interval '1 month'
          AND c.payee_id = ${user!.id}
        GROUP BY 1
      ),
      filled AS (
        SELECT
          m.month_start,
          COALESCE(a.monthly_commissions, 0)::numeric(12,2) AS monthly_commissions
        FROM months m
        LEFT JOIN agg a USING (month_start)
      )
      SELECT
        f.month_start                                         AS month_date,
        to_char(f.month_start, 'YYYY-MM')                     AS month_label,
        f.monthly_commissions,
        SUM(f.monthly_commissions) OVER (
          ORDER BY f.month_start
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        )::numeric(12,2)                                      AS cumulative_commissions,
        -- Variación vs mes anterior (%)
        CASE
          WHEN LAG(f.monthly_commissions) OVER (ORDER BY f.month_start) = 0 THEN NULL
          ELSE ROUND(
            100.0 * (f.monthly_commissions
              - LAG(f.monthly_commissions) OVER (ORDER BY f.month_start))
              / NULLIF(LAG(f.monthly_commissions) OVER (ORDER BY f.month_start), 0)
          , 2)
        END                                                   AS mom_change_pct
      FROM filled f
      ORDER BY f.month_start;
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
