'use client'
import useMe, { CustomerMe } from '@/hooks/useMe'
import { getChild } from '@/services/referrals.service'
import { useEffect, useState } from 'react'
import { Tree } from 'tree-graph-react'
import NodeMap from 'tree-graph-react/dist/interfaces/NodeMap'
import 'tree-graph-react/dist/tree-graph-react.cjs.development.css'

const getUserChildrens = async (b: CustomerMe, depth: number, backObj: NodeMap) => {
  if (depth > 7) return

  backObj[b.id.toString()] = {
    _key: b.id.toString(),
    father: b.referredBy?.toString(),
    name: b.name || '',
    sortList: b.children?.map((id) => id.toString()),
    contract: depth > 1,
    childNum: b.childrenCount,
    showCheckbox: false,
    showStatus: false,
    ...(depth > 0
      ? b.membership?.isActive
        ? {
            backgroundColor: '#5a8555',
            color: '#fff',
          }
        : {
            backgroundColor: '#8a5e5e',
            color: '#fff',
          }
      : {
          backgroundColor: '#ddd',
        }),
  }
  if (b?.children?.length > 0) {
    for (const c of b?.children) {
      const child = await getChild(c)
      getUserChildrens(child, depth + 1, backObj)
    }
  }
}

const Graph = () => {
  const { data: user } = useMe()
  const [nodes, setNodes] = useState<NodeMap>({})

  useEffect(() => {
    if (user) {
      let response = {}
      getUserChildrens(user, 0, response).then(() => {
        setNodes(response)
      })
    }
  }, [user?.id])

  return <Tree nodes={nodes} startId={user?.id.toString() || ''} disableShortcut disabled />
}

export default Graph
