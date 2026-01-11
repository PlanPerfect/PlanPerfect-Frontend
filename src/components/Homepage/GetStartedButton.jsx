import { Box, Button, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

function GetStartedButton({ width, destination, delay }) {
    var width = width || "auto"
    var destination = destination || "/onboarding"
    var delay = delay || "2.2s"

    const navigate = useNavigate();

    return (
        <Box
            width={width}
            opacity={0}
            animation={`fadeInUp 0.8s ease-out ${delay} forwards`}
        >
            <Button
                width="100%"
                background="linear-gradient(to right, #F4E5B2, #D4AF37, #F4E5B2)"
                backgroundSize="200% 100%"
                backgroundPosition="left"
                color="white"
                fontWeight="bold"
                px={12}
                py={7}
                fontSize="xl"
                borderRadius={23}
                _hover={{
                    backgroundPosition: "right"
                }}
                transition="background-position 0.3s ease-in-out"
                fontFamily="'Montserrat', sans-serif"
                textTransform="uppercase"
                onClick={() => navigate(destination)}
            >
                <Text>
                    Get Started
                </Text>
            </Button>
        </Box>
    )
}

export default GetStartedButton