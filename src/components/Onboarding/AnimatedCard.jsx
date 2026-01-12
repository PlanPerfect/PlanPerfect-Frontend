import { VStack, Flex, Icon, Heading, Text, Card } from '@chakra-ui/react'
import { Home } from 'lucide-react'

function AnimatedCards({ icon, iconColor, title, description, delay }) {
    var icon  = icon || Home;
    var iconColor = iconColor || "blue.500";
    var title = title || "Homeowner";
    var description = description || "Explore intelligent design solutions that breathe new life into your home";
    var delay = delay || 0.5;

    return (
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
            style={{ animation: `fadeInUp 0.8s ease-out ${delay}s backwards` }}
            _active={{
                transform: 'translateY(-4px)',
            }}
        >
            <Card.Body>
                <VStack spacing={4} align="center" py={6}>
                    <Flex
                        bg={iconColor}
                        p={4}
                        borderRadius="full"
                        boxShadow="lg"
                    >
                        <Icon as={icon} boxSize={12} color="white" />
                    </Flex>
                    <Heading size="lg" color="gray.800" textAlign={"center"}>
                        {title}
                    </Heading>
                    <Text
                        textAlign="center"
                        color="gray.600"
                        fontSize="md"
                        px={4}
                    >
                        {description}
                    </Text>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}

export default AnimatedCards