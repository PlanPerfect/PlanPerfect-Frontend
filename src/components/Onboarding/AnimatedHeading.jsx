import { VStack, Heading, Text } from "@chakra-ui/react";

function AnimatedHeading() {
	return (
		<VStack gap={2} opacity={0} style={{ animation: "fadeInUp 0.8s ease-out 0.6s forwards" }}>
			<Heading as="h1" size={{ base: "2xl", md: "3xl", lg: "4xl" }} textAlign="center" color="white" fontWeight="bold">
				Our Services
			</Heading>
			<Text fontSize={{ base: "md", md: "lg", lg: "xl" }} textAlign="center" color="#F4E5B2" fontWeight={"bold"}>
				Are you a new or existing homeowner?
			</Text>
		</VStack>
	);
}

export default AnimatedHeading;
