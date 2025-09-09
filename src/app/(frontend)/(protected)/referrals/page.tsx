'use client'
import { Tab, Tabs } from '@heroui/react'
import Graph from './graph'
import TableDirects from './table'

const Tree = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs aria-label="Options">
        <Tab title="Directos" key="directs">
          <TableDirects />
        </Tab>
        <Tab title="Grafico" key="graph">
          <Graph />
        </Tab>
      </Tabs>
    </div>
  )
}

export default Tree
