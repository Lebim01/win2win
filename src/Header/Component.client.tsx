'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import ProfileDropdown from './Nav/ProfileDropdown'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

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
