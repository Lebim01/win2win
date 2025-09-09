import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  return (
    <footer className="w-full bg-[var(--color-primary)] dark:bg-card border-t border-[var(--color-border)] ">
      <div className="container py-4 gap-8 flex flex-row justify-between mx-auto px-4 md:px-0">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
