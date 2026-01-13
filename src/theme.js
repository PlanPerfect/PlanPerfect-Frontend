import { createSystem, defaultConfig } from "@chakra-ui/react"

const customConfig = {
  theme: {
    tokens: {
        fonts: {
            heading: { value: "Montserrat, system-ui, sans-serif" },
            body: { value: "Montserrat, system-ui, sans-serif" },
          },
    },
  },
}

export const system = createSystem(defaultConfig, customConfig)