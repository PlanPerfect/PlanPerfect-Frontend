import { Box, Button, Text } from "@chakra-ui/react";

function FindRecommendationsButton({ width, delay, onClick }) {
    const width_val = width || "auto";
    const delay_val = delay || "2.2s";

    return (
        <Box
            width={width_val}
            opacity={0}
            animation={`fadeInUp 0.8s ease-out ${delay_val} forwards`}
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
                fontSize="md"
                borderRadius={20}
                _hover={{
                    backgroundPosition: "right"
                }}
                transition="background-position 0.3s ease-in-out"
                fontFamily="'Montserrat', sans-serif"
                textTransform="uppercase"
                onClick={onClick}
            >
                <Text>
                    Search
                </Text>
            </Button>
        </Box>
    );
}

export default FindRecommendationsButton;