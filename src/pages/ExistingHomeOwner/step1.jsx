import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Circle,
} from "@chakra-ui/react"
import { useState } from "react"

export default function PreferencesStep() {
  const [propertyType, setPropertyType] = useState(null)
  const [unitType, setUnitType] = useState(null)
  const [budget, setBudget] = useState(null)

  const propertyTypes = ["HDB", "Condo", "Landed"]
  const unitTypes = ["1-Room", "2-Room", "3-Room", "4-Room", "5-Room", "Executive", "3gen"]
  const budgets = ["Below SGD $10k", "SGD $10k - $20k", "SGD $20k - $40k", "Above SGD $40k"]

  const SelectButton = ({ value, selected, onClick }) => (
    <Button variant="outline" size="md" fontSize="sm" h="44px" borderColor="yellow.400" bg={selected ? "yellow.100" : "white"} onClick={onClick}>
      {value}
    </Button>
  )

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Hero */}
      <Box h="45vh" bgImage="url('/ExistingHeroSection.png')" bgSize="cover" bgPos="center">
        <Box h="100%" bg="blackAlpha.600">
          <Container maxW="6xl" py={24}>
            <Stack spacing={4} color="white">
              <Heading size="5xl">Design Your Dream Room <br /> With Our Smart Assistant</Heading>
              <Text fontSize="md" color="yellow.400">Upload your space. Tell us your style. Get personalized renovation ideas in minutes.</Text>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Floating Stepper */}
      <Container maxW="4xl" mt={-16}>
        <Box bg="white" rounded="xl" shadow="md" px={8} py={6}>
            <HStack spacing={6} justify="center" textAlign="center">
                <HStack>
                <Circle size="32px" bg="yellow.500" color="white" fontWeight={"bold"} fontSize="lg">1</Circle>
                <Text fontSize="sm" fontWeight="semibold">Preferences</Text>
                </HStack>

                <Box w="64px" h="1px" bg="gray.400" />
                <HStack>
                <Circle size="32px" bg="gray.200" color="gray.600" fontSize="lg">2</Circle>
                <Text fontSize="sm" fontWeight="semibold">Upload a Photo</Text>
                </HStack>

                <Box w="64px" h="1px" bg="gray.300" />
                <HStack color="gray.400">
                <Circle size="32px" bg="gray.200" color="gray.600" fontSize="lg">3</Circle>
                <Text fontSize="sm">Customization</Text>
                </HStack>
            </HStack>
        </Box>
      </Container>

      {/* Content Card */}
      <Container maxW="4xl" mt={10} pb={20}>
        <Box bg="white" rounded="xl" shadow="lg" p={{ base: 6, md: 10 }}>
          <VStack spacing={12} align="stretch">
            <Box>
              <Heading size="sm" mb={4}>What is your property type?</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                {propertyTypes.map((type) => (
                  <SelectButton key={type} value={type} selected={propertyType === type} onClick={() => setPropertyType(type)} />
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="sm" mb={4}>What’s your unit type?</Heading>
              <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
                {unitTypes.map((type) => (
                  <SelectButton key={type} value={type} selected={unitType === type} onClick={() => setUnitType(type)} />
                ))}
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="sm" mb={4}>What’s your estimated budget?</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {budgets.map((b) => (
                  <SelectButton key={b} value={b} selected={budget === b} onClick={() => setBudget(b)} />
                ))}
              </SimpleGrid>
            </Box>

            <Button size="md" h="44px" colorScheme="yellow" alignSelf="center" px={12} isDisabled={!propertyType || !unitType || !budget}>
              Next
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
