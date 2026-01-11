import { Box, Button, Text } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

function GetStartedButton() {
    const navigate = useNavigate();

    return (
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
                onClick={() => navigate("/onboarding")}
            >
                <Text>
                    Get Started
                </Text>
            </Button>
        </Box>
    )
}

export default GetStartedButton