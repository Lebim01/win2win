'use client'
import {
  CardHeader,
  Tab,
  Tabs,
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Snippet,
} from '@heroui/react'
import Graph from './graph'
import { Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAxios } from 'use-axios-client'

const Label = ({ children }: any) => <p className="font-medium mb-1">{children}</p>

const Tree = () => {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  const { data: directs } = useAxios<{
    docs: any[]
    totalDocs: number
    totalPages: number
  }>({
    url: '/api/referrals/directs',
    params: {
      page,
      status,
      search,
    },
  })

  useEffect(() => {
    setPage(1)
  }, [search, status])

  return (
    <div className="container mx-auto py-6" suppressHydrationWarning>
      <Tabs aria-label="Options">
        <Tab title="Directos" key="directs">
          <Card radius="sm">
            <CardHeader className="pb-2">
              <span className="text-base font-medium">Base de datos de directos</span>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3 px-4">
                <div className="space-y-1">
                  <Label>Búsqueda</Label>
                  <Input
                    placeholder="Buscar por usuario"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Estado</Label>
                  <Select
                    placeholder="Seleccionar"
                    onSelectionChange={(keys) => setStatus(keys.currentKey as string)}
                  >
                    <SelectItem key="">Todos</SelectItem>
                    <SelectItem key="active">Activo</SelectItem>
                    <SelectItem key="inactive">Inactivo</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 mt-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" /> {0} resultados
                </div>
              </div>

              <div>
                <Table
                  radius="sm"
                  shadow="none"
                  bottomContent={
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        color="secondary"
                        page={page}
                        total={directs?.totalPages || 1}
                        onChange={(page) => setPage(page)}
                      />
                    </div>
                  }
                >
                  <TableHeader>
                    <TableColumn>Nombre</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Fin del periodo</TableColumn>
                    <TableColumn>Estado</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={'Sin registros.'}>
                    {(directs?.docs || []).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>
                          {c.membership.firstActivatedAt && (
                            <>
                              <Snippet symbol="" hideCopyButton size="sm">
                                {c.membership?.currentPeriodStart
                                  ? new Date(c.membership.currentPeriodStart).toLocaleString()
                                  : '—'}
                              </Snippet>{' '}
                              →{' '}
                              <Snippet symbol="" hideCopyButton size="sm">
                                {c.membership?.currentPeriodEnd
                                  ? new Date(c.membership.currentPeriodEnd).toLocaleString()
                                  : '—'}
                              </Snippet>
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.membership?.isActive ? (
                            <Chip color="success">Activo</Chip>
                          ) : (
                            <Chip color="danger">Inactivo</Chip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="Grafico" key="graph">
          <Graph />
        </Tab>
      </Tabs>
    </div>
  )
}

export default Tree
