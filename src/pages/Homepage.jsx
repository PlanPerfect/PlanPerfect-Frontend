import LandingBackground from '../assets/LandingBackground.png'
import Logo from '../assets/Logo.svg'
import { Box, Heading, Button, VStack } from '@chakra-ui/react'

function Homepage() {
    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${LandingBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            }} />

            <VStack
                position="relative"
                justify="center"
                align="center"
                height="80vh"
                gap={8}
            >
                <Box
                    opacity={0}
                    animation="fadeInDown 0.8s ease-out 0.2s forwards"
                >
                    <img
                        src={Logo}
                        alt="Logo"
                        style={{ maxWidth: '200px', height: 'auto' }}
                    />
                </Box>

                <Heading
                    size="3xl"
                    textAlign="center"
                    fontWeight="bold"
                    fontFamily="'Montserrat', sans-serif"
                    lineHeight="1.2"
                    opacity={0}
                    animation="fadeInUp 0.8s ease-out 0.8s forwards"
                >
                    <Box
                        as="span"
                        color="white"
                        display="block"
                    >
                        Transform Your Floor Plans Into
                    </Box>
                    <Box
                        as="span"
                        bgGradient="to-r"
                        gradientFrom="#F4E5B2"
                        gradientTo="#D4AF37"
                        bgClip="text"
                        display="block"
                    >
                        Dream Designs
                    </Box>
                </Heading>

                <Box
                    opacity={0}
                    animation="fadeInUp 1s ease-out 2.2s forwards"
                >
                    <Button
                        size="xl"
                        background="linear-gradient(to right, #F4E5B2, #D4AF37, #F4E5B2)"
                        backgroundSize="200% 100%"
                        backgroundPosition="left"
                        color="white"
                        fontWeight="bold"
                        px={12}
                        py={7}
                        fontSize="xl"
                        borderRadius={20}
                        _hover={{
                            backgroundPosition: "right"
                        }}
                        transition="background-position 0.3s ease-in-out"
                        fontFamily="'Montserrat', sans-serif"
                        textTransform="uppercase"
                    >
                        Get Started
                    </Button>
                </Box>
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

export default Homepage