import { Box, VStack } from '@chakra-ui/react'
import ServicesBackground from "../../assets/ServicesBackground.png"
import AnimatedHeading from '@/components/Onboarding/AnimatedHeading'
import AnimatedCards from '@/components/Onboarding/AnimatedCards'

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

                <AnimatedCards />
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