'use client'
import { Button } from '@payloadcms/ui'
import clsx from 'clsx'
import Link from 'next/link'
import { FC, ReactNode } from 'react'
import { MdSpaceDashboard } from 'react-icons/md'

const ListboxWrapper: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={clsx(
      className,
      'w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100',
    )}
  >
    {children}
  </div>
)

const AdminSidemenu = (props: any) => {
  return (
    <div className="h-full pt-20 px-4">
      <ListboxWrapper className="mb-2 px-4">
        <label className="font-bold text-lg line-clamp-1 mb-2">Admin</label>
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/collections/customers" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Usuarios</span>
            </Button>
          </Link>
          <Link href="/admin" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Transacciones</span>
            </Button>
          </Link>
          <Link href="/admin" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Cupones</span>
            </Button>
          </Link>
          <Link href="/admin" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Retiros</span>
            </Button>
          </Link>
          <Link href="/admin" className="w-full no-underline">
            <Button
              className="flex w-full m-0"
              buttonStyle="primary"
              icon={<MdSpaceDashboard size={16} />}
              iconPosition="left"
            >
              <span>Reportes</span>
            </Button>
          </Link>
        </div>
      </ListboxWrapper>

      <div className="px-4 mt-4">
        <Link href="/admin/logout" className="hover:cursor-pointer hover:underline">
          Cerrar sesión
        </Link>
      </div>
    </div>
  )
}

export default AdminSidemenu
