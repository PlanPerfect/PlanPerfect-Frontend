'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'

export function Provider(props) {
  const { value = defaultSystem, children, ...rest } = props
  
  return (
    <ChakraProvider value={value}>
      <ColorModeProvider {...rest}>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  )
}