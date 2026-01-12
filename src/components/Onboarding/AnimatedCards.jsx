import { SimpleGrid, VStack, Flex, Icon, Heading, Text, Card } from '@chakra-ui/react'
import { Key, Home } from 'lucide-react'

function AnimatedCards() {
    return (
        <SimpleGrid
            columns={{ base: 1, md: 2 }}
            maxW="800px"
            gap={8}
            w="full"
        >
            <Card.Root
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: '2xl',
                }}
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                border="2px solid"
                borderColor="transparent"
                style={{ animation: 'fadeInUp 0.8s ease-out 0.5s backwards' }}
                _active={{
                    transform: 'translateY(-4px)',
                }}
            >
                <Card.Body>
                    <VStack spacing={4} align="center" py={6}>
                        <Flex
                            bg="blue.500"
                            p={4}
                            borderRadius="full"
                            boxShadow="lg"
                        >
                            <Icon as={Key} boxSize={12} color="white" />
                        </Flex>
                        <Heading size="lg" color="gray.800" textAlign={"center"}>
                            New Homeowner
                        </Heading>
                        <Text
                            textAlign="center"
                            color="gray.600"
                            fontSize="md"
                            px={4}
                        >
                            Let us help you design your perfect home with our AI-powered tools
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>

            <Card.Root
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                    transform: 'translateY(-8px)',
                    boxShadow: '2xl',
                }}
                bg="whiteAlpha.900"
                backdropFilter="blur(10px)"
                border="2px solid"
                borderColor="transparent"
                style={{ animation: 'fadeInUp 0.8s ease-out 1s backwards' }}
                _active={{
                    transform: 'translateY(-4px)',
                }}
            >
                <Card.Body>
                    <VStack spacing={4} align="center" py={6}>
                        <Flex
                            bg="green.500"
                            p={4}
                            borderRadius="full"
                            boxShadow="lg"
                        >
                            <Icon as={Home} boxSize={12} color="white" />
                        </Flex>
                        <Heading size="lg" color="gray.800" textAlign={"center"}>
                            Existing Homeowner
                        </Heading>
                        <Text
                            textAlign="center"
                            color="gray.600"
                            fontSize="md"
                            px={4}
                        >
                            Explore intelligent design solutions that breathe new life into your home
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>
        </SimpleGrid>
    )
}

export default AnimatedCards