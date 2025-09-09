'use client'
import {
  CardHeader,
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
  Button,
} from '@heroui/react'
import { Filter, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDirects, ResponseDirects } from '@/services/referrals.service'

const Label = ({ children }: any) => <p className="font-medium mb-1">{children}</p>

const TableDirects = () => {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [directs, setDirects] = useState<ResponseDirects>({
    totalPages: 0,
    totalDocs: 0,
    docs: [],
  })

  const refetch = async () => {
    setLoading(true)
    const response = await getDirects(page, status, search)
    setDirects(response)
    setLoading(false)
  }

  useEffect(() => {
    refetch()
  }, [search, page, status])

  return (
    <Card radius="sm">
      <CardHeader className="pb-2 flex justify-between">
        <span className="text-base font-medium">Base de datos de directos</span>
        <Button onPress={refetch} isLoading={loading} size="sm">
          {!loading && <RefreshCcw className="h-4 w-4 mr-2" />}
          Actualizar
        </Button>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3 px-4">
          <div className="space-y-1">
            <Label>Búsqueda</Label>
            <Input
              placeholder="Buscar por usuario"
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Estado</Label>
            <Select
              placeholder="Seleccionar"
              onSelectionChange={(keys) => {
                setPage(1)
                setStatus(keys.currentKey as string)
              }}
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
            aria-label="Directos"
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
              {directs.docs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    {c.membership?.firstActivatedAt && (
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
  )
}
export default TableDirects
