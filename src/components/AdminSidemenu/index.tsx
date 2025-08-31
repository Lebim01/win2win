'use client'
import { Button } from '@payloadcms/ui'
import clsx from 'clsx'
import Link from 'next/link'
import { FC, ReactNode } from 'react'
import { FaTimes } from 'react-icons/fa'

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
        <label className="font-bold text-lg line-clamp-1">Admin</label>
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="w-full no-underline">
            <Button className="flex items-center gap-2 w-full">
              <FaTimes size={16} />
              <span>Dashboard</span>
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
