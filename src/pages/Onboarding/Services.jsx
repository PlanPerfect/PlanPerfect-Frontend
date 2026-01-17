import { Box, VStack, SimpleGrid } from '@chakra-ui/react'
import { Key, Home } from 'lucide-react'
import ServicesBackground from "../../assets/ServicesBackground.png"
import AnimatedHeading from '@/components/Onboarding/AnimatedHeading'
import AnimatedCard from '@/components/Onboarding/AnimatedCard'

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
                minHeight="calc(100vh - 100px)"
                padding={{ base: 4, md: 8 }}
                paddingTop={{ base: 4, md: 8 }}
                gap={8}
            >
                <AnimatedHeading />

                <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    maxW="800px"
                    gap={8}
                    w="full"
                >
                    <AnimatedCard icon={Key} iconColor={"blue.500"} title={"New Homeowner"} description={"Let us help you design your perfect home with our AI-powered tools"} delay={0.5} />

                    <AnimatedCard icon={Home} iconColor={"green.500"} title={"Existing Homeowner"} description={"Explore intelligent design solutions that breathe new life into your home"} delay={1.0} />
                </SimpleGrid>
            </VStack>
        </>
    )
}

export default Services