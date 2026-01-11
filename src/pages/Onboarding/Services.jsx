import { Box, VStack, Heading, Text, SimpleGrid, Card, Icon, Flex } from '@chakra-ui/react'
import { Home, Key } from 'lucide-react'
import ServicesBackground from "../../assets/ServicesBackground.png"

function Services() {
    return (
        <>
            <Box style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${ServicesBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            }} />

            <VStack
                position="relative"
                justify="center"
                align="center"
                maxHeight="70vh"
                padding={8}
                gap={8}
            >
                <VStack gap={2} style={{ animation: 'fadeInDown 0.8s ease-out' }}>
                    <Heading
                        as="h1"
                        size="4xl"
                        textAlign="center"
                        color="white"
                        fontWeight="bold"
                    >
                        Our Services
                    </Heading>
                    <Text
                        fontSize="xl"
                        textAlign="center"
                        color="#F4E5B2"
                        fontWeight={"bold"}
                    >
                        Are you a new or existing homeowner?
                    </Text>
                </VStack>

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
                                <Heading size="lg" color="gray.800">
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
                                <Heading size="lg" color="gray.800">
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
            </VStack>

            <style>
                {`
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </>
    )
}

export default Services