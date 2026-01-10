import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";

function NewHomeOwnerPage() {
	return (
		<>
			{/* Hero Section */}
			<Box
				bgImage="url('/newHomeOwnerHero.png')"
				bgRepeat="no-repeat"
				bgSize="cover"
				bgPosition="center"
				minH="100vh"
			>
				<Flex
					direction="column"
					justify="center"
					align="center"
					textAlign="center"
					h="100%"
					color="white"
					px={6}
				>
					<Heading size="6xl" mb={4}>
						Let Our AI Agent Find Your
					</Heading>
					<Heading size="6xl" mb={4}>
						Perfect Design Style!
					</Heading>
					<Text fontSize="lg" mb={6} maxW="700px">
						Complete the 5 steps below to get your personalized design style guide and mood board now!
					</Text>
				</Flex>
			</Box>

			{/* Content AFTER hero (scrolls normally) */}
			<Box py={20} px={8}>
				<Heading size="lg" mb={4}>
					What Happens Next?
				</Heading>
				<Text>
					This content appears after the hero and does NOT repeat the
					background image.
				</Text>
			</Box>
		</>
	);
}

export default NewHomeOwnerPage;
