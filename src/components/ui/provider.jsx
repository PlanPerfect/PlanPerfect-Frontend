'use client'

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { ColorModeProvider } from './color-mode'

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Montserrat, sans-serif' },
        body: { value: 'Montserrat, sans-serif' },
      },
    },
  },
})

export function Provider(props) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
