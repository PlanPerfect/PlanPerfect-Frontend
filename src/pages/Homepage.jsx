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
                <img
                    src={Logo}
                    alt="Logo"
                    style={{ maxWidth: '200px', height: 'auto' }}
                />

                <Heading
                    size="3xl"
                    textAlign="center"
                    fontWeight="bold"
                    fontFamily="'Montserrat', sans-serif"
                    lineHeight="1.2"
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

                <Button
                    size="xl"
                    backgroundColor={"#D4AF37"}
                    color="white"
                    fontWeight="bold"
                    px={12}
                    py={7}
                    fontSize="xl"
                    borderRadius={20}
                    _hover={{
                        transform: 'scale(1.05)'
                    }}
                    transition="transform 0.2s"
                    fontFamily="'Montserrat', sans-serif"
                    textTransform="uppercase"
                >
                    Get Started
                </Button>
            </VStack>
        </>
    )
}

export default Homepage