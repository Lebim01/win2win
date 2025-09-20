import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { HeroUIProvider, ToastProvider } from '@heroui/react'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <HeroUIProvider>
          <ToastProvider />
          {children}
        </HeroUIProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
