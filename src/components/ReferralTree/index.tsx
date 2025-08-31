'use client'
import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { Customer } from '@/payload-types'

type TreeNode = {
  name: string
  value?: any
  children?: TreeNode[]
  collapsed?: boolean
  itemStyle?: { color?: string }
  label?: { position?: string }
}

type Props = {
  customers: Customer[]
  // opcional: ID del root a mostrar. Si no se pasa, se infiere por registros sin referredBy (nivel 0)
  rootId?: number
  // altura del canvas
  height?: number | string
}

const LEVEL_COLORS = [
  '#4b5563', // 0
  '#2563eb', // 1
  '#0ea5e9', // 2
  '#10b981', // 3
  '#84cc16', // 4
  '#f59e0b', // 5
  '#f97316', // 6
  '#ef4444', // 7
]

function buildTree(customers: Customer[], rootId?: number): TreeNode[] {
  if (!customers?.length) return []

  // Index por id
  const byId = new Map<string, Customer>()
  customers.forEach((c) => byId.set(c.id.toString(), c))

  // Agrupar hijos por parent
  const childrenMap = new Map<string, Customer[]>()
  customers.forEach((c) => {
    const p = (c.referredBy as Customer)?.id.toString()
    const arr = childrenMap.get(p) ?? []
    arr.push(c)
    childrenMap.set(p, arr)
  })

  // Identificar raíces (nivel 0) o usar rootId
  let roots: Customer[] = []
  if (rootId) {
    const r = byId.get(rootId.toString())
    if (r) roots = [r]
  } else {
    roots = customers.filter((c) => !c.referredBy) // sin padre => nivel 0
  }

  const toNode = (c: Customer): TreeNode => {
    const level = Math.max(0, Math.min(7, c.level ?? 0))
    const kids = (childrenMap.get(c.id.toString()) ?? []).sort((a, b) =>
      (a.createdAt ?? '').localeCompare((b as any).createdAt ?? ''),
    )
    return {
      name: c.name || c.email || c.referralCode || c.id?.toString(),
      value: {
        id: c.id,
        email: c.email,
        name: c.name ?? '',
        level,
        childrenCount: c.childrenCount ?? kids.length,
        referralCode: c.referralCode ?? '',
      },
      itemStyle: { color: LEVEL_COLORS[level] || LEVEL_COLORS[LEVEL_COLORS.length - 1] },
      // Colapsar por defecto a partir de nivel 4 para árboles grandes
      collapsed: level >= 4,
      children: kids
        .filter((k) => (k.level ?? 0) <= 7) // seguridad: no mostrar >7
        .map(toNode),
    }
  }

  return roots.map(toNode)
}

export default function ReferralTree({ customers, rootId, height = 520 }: Props) {
  const data = useMemo(() => buildTree(customers, rootId), [customers, rootId])

  const option: echarts.EChartsOption = useMemo(
    () =>
      ({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: (params: any) => {
            const v = params?.data?.value || {}
            return `
          <div style="min-width:220px">
            <div><strong>${v.name || params?.name}</strong></div>
            <div>${v.email || ''}</div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0"/>
            <div><b>Nivel:</b> ${v.level ?? '-'}</div>
            <div><b>Hijos:</b> ${v.childrenCount ?? 0} / 5</div>
            ${v.referralCode ? `<div><b>Código:</b> ${v.referralCode}</div>` : ''}
          </div>
        `
          },
          confine: true,
          padding: 10,
          borderWidth: 0,
          className: 'echarts-tooltip',
        },
        series: [
          {
            type: 'tree',
            data,
            top: '2%',
            left: '2%',
            bottom: '2%',
            right: '20%',
            orient: 'LR', // Left-to-Right (puedes usar 'TB' para top-to-bottom)
            initialTreeDepth: 3, // profundidad visible inicial
            symbol: 'circle',
            symbolSize: 12,
            roam: true, // zoom y paneo
            expandAndCollapse: true,
            animationDuration: 400,
            animationDurationUpdate: 300,
            label: {
              show: true,
              color: '#e5e7eb',
              fontSize: 12,
              verticalAlign: 'middle',
              align: 'left',
              distance: 8,
              formatter: (p: any) => {
                const v = p?.data?.value || {}
                return v.name || p.name
              },
            },
            leaves: {
              label: {
                show: true,
                color: '#e5e7eb',
                fontSize: 12,
                align: 'left',
              },
            },
            lineStyle: {
              width: 1.2,
              curveness: 0.2,
              opacity: 0.9,
            },
          },
        ],
        toolbox: {
          show: true,
          right: 10,
          feature: {
            restore: { show: true },
            saveAsImage: { show: true, pixelRatio: 2 },
          },
        },
      }) as any,
    [data],
  )

  return (
    <div style={{ width: '100%', height }}>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%' }}
        notMerge
        lazyUpdate
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
