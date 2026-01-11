import { Box, Heading, Text } from "@chakra-ui/react"

function AnimatedHeading() {
    return (
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
                <Text>
                    Transform Your Floor Plans Into
                </Text>
            </Box>
            <Box
                as="span"
                bgGradient="to-r"
                gradientFrom="#F4E5B2"
                gradientTo="#D4AF37"
                bgClip="text"
                display="block"
            >
                <Text>
                    Dream Designs
                </Text>
            </Box>
        </Heading>
    )
}

export default AnimatedHeading