'use client'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import ProfileDropdown from './ProfileDropdown'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-4 items-center">
      <CMSLink label={'Inicio'} url={'/dashboard'} appearance="link" />
      <CMSLink label={'Billetera'} url={'/wallet'} appearance="link" />
      <CMSLink label={'Referidos'} url={'/referrals'} appearance="link" />
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <ProfileDropdown />
    </nav>
  )
}
