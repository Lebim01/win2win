'use client'
import Link from 'next/link'
import React from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import ProfileDropdown from './Nav/ProfileDropdown'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  return (
    <div className="w-full bg-[var(--color-primary)] dark:bg-card border-b border-[var(--color-border)] shadow">
      <header className="container relative z-20 mx-auto px-4 md:px-0">
        <div className="flex justify-between text-white py-4 items-center">
          <Link href="/dashboard">
            <Logo loading="eager" priority="high" />
          </Link>
          <div className="flex gap-4">
            <HeaderNav data={data} />
            <ProfileDropdown />
          </div>
        </div>
      </header>
    </div>
  )
}
