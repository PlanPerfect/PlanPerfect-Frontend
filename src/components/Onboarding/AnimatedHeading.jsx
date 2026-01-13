import { VStack, Heading, Text } from "@chakra-ui/react"

function AnimatedHeading() {
    return (
        <VStack gap={2} style={{ animation: 'fadeInDown 0.8s ease-out' }}>
            <Heading
                as="h1"
                size={{ base: "2xl", md: "3xl", lg: "4xl" }}
                textAlign="center"
                color="white"
                fontWeight="bold"
            >
                Our Services
            </Heading>
            <Text
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                textAlign="center"
                color="#F4E5B2"
                fontWeight={"bold"}
            >
                Are you a new or existing homeowner?
            </Text>
        </VStack>
    )
}

export default AnimatedHeading