import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { HeroUIProvider } from '@heroui/react'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <HeroUIProvider>{children}</HeroUIProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
