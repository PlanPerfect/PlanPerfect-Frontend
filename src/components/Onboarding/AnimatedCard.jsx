import { VStack, Flex, Icon, Heading, Text, Card, Box } from '@chakra-ui/react'
import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AnimatedCard({ icon, iconColor, title, description, delay, destination, shouldAnimate }) {
    icon = icon || Home;
    iconColor = iconColor || "blue.500";
    title = title || "Homeowner";
    description = description || "Explore intelligent design solutions that breathe new life into your home";
    delay = delay || 0.5;
    destination = destination || null;
    const navigate = useNavigate();

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
            borderRadius={20}
            borderColor="transparent"
            animation={shouldAnimate ? `fadeInUp 0.8s ease-out ${delay}s backwards` : 'none'}
            _active={{
                transform: 'translateY(-4px)',
            }}
            onClick={destination ? () => navigate(destination) : undefined}
        >
            <Card.Body>
                <VStack spacing={4} align="center" py={6}>
                    <Flex
                        bg={`linear-gradient(135deg, ${iconColor} 0%, ${iconColor.replace('.500', '.600')} 100%)`}
                        p={5}
                        borderRadius="2xl"
                        boxShadow="0 8px 20px rgba(0, 0, 0, 0.12)"
                        position="relative"
                        transition="all 0.3s"
                        _groupHover={{
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
                        }}
                    >
                        <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            width="120%"
                            height="120%"
                            bg={iconColor}
                            opacity={0.2}
                            filter="blur(20px)"
                            borderRadius="full"
                            transition="opacity 0.3s"
                            _groupHover={{ opacity: 0.4 }}
                        />
                        <Icon as={icon} boxSize={14} color="white" position="relative" zIndex={1} />
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

export default AnimatedCard