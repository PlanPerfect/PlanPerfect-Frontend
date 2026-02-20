import { useState, useLayoutEffect, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, VStack, SimpleGrid, Text, Heading } from '@chakra-ui/react'
import { Key, Home, Sparkles } from 'lucide-react'
import LandingBackground from "../../assets/LandingBackground.png"
import AnimatedCard from '@/components/Onboarding/AnimatedCard'
import ShowToast from '@/Extensions/ShowToast'

// Scattered background icons — same effect as before, now with golden tones
const SCATTERED_ICONS = [
    { icon: Home,     top: '8%',  left: '4%',   size: 28, opacity: 0.07, rotate: -15, delay: 0 },
    { icon: Key,      top: '15%', left: '88%',  size: 22, opacity: 0.06, rotate: 20,  delay: 0.3 },
    { icon: Sparkles, top: '30%', left: '6%',   size: 18, opacity: 0.05, rotate: 0,   delay: 0.6 },
    { icon: Home,     top: '55%', left: '92%',  size: 32, opacity: 0.07, rotate: 10,  delay: 0.2 },
    { icon: Key,      top: '70%', left: '3%',   size: 20, opacity: 0.05, rotate: -25, delay: 0.5 },
    { icon: Sparkles, top: '80%', left: '85%',  size: 26, opacity: 0.06, rotate: 15,  delay: 0.1 },
    { icon: Home,     top: '88%', left: '45%',  size: 16, opacity: 0.04, rotate: 5,   delay: 0.4 },
    { icon: Key,      top: '42%', left: '96%',  size: 14, opacity: 0.05, rotate: -10, delay: 0.7 },
    { icon: Sparkles, top: '5%',  left: '52%',  size: 20, opacity: 0.05, rotate: 30,  delay: 0.9 },
    { icon: Home,     top: '62%', left: '18%',  size: 14, opacity: 0.04, rotate: -20, delay: 0.8 },
]

function Services() {
    const [isInitialMount, setIsInitialMount] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()

    useLayoutEffect(() => {
        setIsInitialMount(false)
    }, [])

    useEffect(() => {
        if (location.state?.loginSuccess) {
            ShowToast("success", "Welcome to PlanPerfect!", "Logged in successfully.");
            navigate(location.pathname, { replace: true, state: {} })
        }
    }, [location.state, navigate, location.pathname])

    return (
        <>
            {/* Background image */}
            <Box style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${LandingBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            }} />

            {/* Scattered logo icons */}
            {SCATTERED_ICONS.map(({ icon: IconComp, top, left, size, opacity, rotate, delay }, i) => (
                <Box
                    key={i}
                    position="fixed"
                    top={top}
                    left={left}
                    opacity={0}
                    style={{
                        animation: `fadeInUp 1.2s ease-out ${delay + 0.5}s forwards`,
                        transform: `rotate(${rotate}deg)`,
                        zIndex: 0,
                        pointerEvents: 'none',
                    }}
                >
                    <IconComp size={size} color="#D4AF37" style={{ opacity }} />
                </Box>
            ))}

            <VStack
                position="relative"
                zIndex={1}
                justify="center"
                align="center"
                minHeight="calc(90vh - 100px)"
                padding={{ base: 4, md: 8 }}
                paddingTop={{ base: 4, md: 8 }}
                gap={10}
            >
                {/* Header */}
                <VStack
                    gap={3}
                    align="center"
                    opacity={0}
                    style={{ animation: 'fadeInDown 0.8s ease-out 0.2s forwards' }}
                >
                    <Heading
                        size={{ base: "2xl", md: "4xl" }}
                        color="white"
                        textAlign="center"
                        textShadow="0 2px 20px rgba(0,0,0,0.4)"
                        letterSpacing="-0.03em"
                        lineHeight="1.2"
                    >
                        How can we help you?
                    </Heading>

                    <Text
                        color="rgba(255,255,255,0.6)"
                        fontSize={{ base: "md", md: "lg" }}
                        textAlign="center"
                        maxW="600px"
                        lineHeight="1.6"
                    >
                        Choose your path and let our AI tools transform your living space
                    </Text>
                </VStack>

                {/* Cards */}
                <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    maxW="900px"
                    gap={8}
                    w="full"
                >
                    <AnimatedCard
                        icon={Key}
                        iconColor="#fff0bd"
                        title="New Homeowner"
                        description="Let us help you design your perfect home with our AI-powered tools"
                        delay={0.7}
                        destination="/newhomeowner"
                    />
                    <AnimatedCard
                        icon={Home}
                        iconColor="#fff0bd"
                        title="Existing Homeowner"
                        description="Explore intelligent design solutions that breathe new life into your home"
                        delay={1.0}
                        destination="/existinghomeowner"
                    />
                </SimpleGrid>
            </VStack>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    )
}

export default Services