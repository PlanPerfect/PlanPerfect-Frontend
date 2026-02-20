import { VStack, Flex, Icon, Heading, Text, Box } from '@chakra-ui/react'
import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AnimatedCard({ icon, iconColor, title, description, delay, destination }) {
    icon = icon || Home;
    iconColor = iconColor || "#D4AF37";
    title = title || "Homeowner";
    description = description || "Explore intelligent design solutions that breathe new life into your home";
    delay = delay || 0.5;
    destination = destination || null;
    const navigate = useNavigate();

    return (
        <Box
            opacity={0}
            style={{ animation: `fadeInUp 0.8s ease-out ${delay}s forwards` }}
            role="group"
            cursor="pointer"
            onClick={destination ? () => navigate(destination) : undefined}
            position="relative"
            isolation="isolate"
            borderRadius={24}
            bg="rgba(255, 255, 255, 0.14)"
			border="1px solid rgba(255, 255, 255, 0.28)"
			backdropFilter="blur(10px) saturate(170%)"
			WebkitBackdropFilter="blur(10px) saturate(170%)"
            transition="all 0.35s ease"
            overflow="hidden"
            _hover={{
                transform: 'translateY(-8px)',
                border: "1px solid rgba(212, 175, 55, 0.5)",
                boxShadow: "0 16px 48px rgba(212, 175, 55, 0.2), 0 0 0 1px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
                bg: "rgba(255, 255, 255, 0.12)",
            }}
            _active={{
                transform: 'translateY(-4px)',
            }}
            _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: "inherit",
                zIndex: 0,
            }}
        >
            {/* Subtle top shine */}
            <Box
                position="absolute"
                top={0}
                left="10%"
                right="10%"
                h="1px"
                bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                zIndex={1}
            />

            <Box position="relative" zIndex={1} p={{ base: 8, md: 10 }}>
                <VStack gap={5} align="center">
                    {/* Icon container */}
                    <Box position="relative">
                        {/* Glow blob behind icon */}
                        <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            width="140%"
                            height="140%"
                            bg={iconColor}
                            opacity={0.4}
                            filter="blur(24px)"
                            borderRadius="full"
                            transition="opacity 0.3s"
                            _groupHover={{ opacity: 0.3 }}
                        />
                        <Flex
                            bg="linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(255, 215, 0, 0.2))"
                            border="1px solid rgba(212, 175, 55, 0.4)"
                            p={5}
                            borderRadius="2xl"
                            position="relative"
                            transition="all 0.35s ease"
                            boxShadow="0 4px 20px rgba(212, 175, 55, 0.15)"
                            _groupHover={{
                                transform: 'scale(1.1) rotate(5deg)',
                                bg: "linear-gradient(135deg, rgba(212, 175, 55, 0.4), rgba(255, 215, 0, 0.35))",
                                boxShadow: "0 8px 28px rgba(212, 175, 55, 0.35)",
                                border: "1px solid rgba(255, 215, 0, 0.6)",
                            }}
                        >
                            <Icon as={icon} boxSize={10} color="#fff0bd" />
                        </Flex>
                    </Box>

                    <VStack gap={2} align="center">
                        <Heading
                            size="2xl"
                            color="white"
                            textAlign="center"
                            textShadow="0 2px 4px rgba(0,0,0,0.3)"
                            letterSpacing="-0.02em"
                        >
                            {title}
                        </Heading>
                        <Text
                            textAlign="center"
                            color="rgba(255, 255, 255, 0.65)"
                            fontSize="md"
                            lineHeight="1.6"
                            px={2}
                        >
                            {description}
                        </Text>
                    </VStack>

                    {/* CTA hint */}
                    <Box
                        mt={1}
                        px={4}
                        py={1.5}
                        borderRadius="full"
                        bg="rgba(212, 175, 55, 0.12)"
                        border="1px solid rgba(212, 175, 55, 0.25)"
                        transition="all 0.3s"
                        _groupHover={{
                            bg: "rgba(212, 175, 55, 0.25)",
                            border: "1px solid rgba(212, 175, 55, 0.5)",
                        }}
                    >
                        <Text fontSize="md" color="#fff0bd" fontWeight="600" letterSpacing="0.05em">
                            Get Started →
                        </Text>
                    </Box>
                </VStack>
            </Box>
        </Box>
    )
}

export default AnimatedCard