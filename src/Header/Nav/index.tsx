'use client'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="gap-4 items-center hidden md:flex">
      <CMSLink label={'Inicio'} url={'/dashboard'} appearance="link" />
      <CMSLink label={'Billetera'} url={'/wallet'} appearance="link" />
      <CMSLink label={'Referidos'} url={'/referrals'} appearance="link" />
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
    </nav>
  )
}
