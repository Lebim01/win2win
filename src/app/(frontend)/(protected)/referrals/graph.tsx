'use client'
import useMe, { CustomerMe } from '@/hooks/useMe'
import { getChild, getTree } from '@/services/referrals.service'
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
          backgroundColor: 'rgb(62 62 62)',
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
      getTree().then((response) => {
        setNodes(
          response.reduce((a, b, index, arr) => {
            a[b.user_id.toString()] = {
              _key: b.user_id.toString(),
              father: b.parent_id?.toString() || '',
              name: b.display_name || '',
              sortList: arr
                .filter((dd) => dd.parent_id == b.user_id)
                .map((dd) => dd.user_id.toString()),
              contract: b.depth > 1,
              childNum: arr.filter((dd) => dd.path.includes(b.user_id) && dd.user_id != b.user_id)
                .length,
              showCheckbox: false,
              showStatus: false,
              ...(b.depth > 0
                ? b.membership_is_active
                  ? {
                      backgroundColor: '#5a8555',
                      color: '#fff',
                    }
                  : {
                      backgroundColor: '#8a5e5e',
                      color: '#fff',
                    }
                : {
                    backgroundColor: 'rgb(62 62 62)',
                  }),
            }
            return a
          }, {} as NodeMap),
        )
      })
    }
  }, [user?.id])

  return <Tree nodes={nodes} startId={user?.id.toString() || ''} disableShortcut disabled />
}

export default Graph
