import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";

function NewHomeOwnerPage() {
	return (
		<>
			{/* Hero Section */}
			<Box bgImage="url('/newHomeOwnerHero.png')" bgRepeat="no-repeat" bgSize="cover" bgPosition="center" minH="100vh" display="flex" alignItems="center" justifyContent="center">
				<Flex direction="column" justify="center" align="center" textAlign="center" h="100%" px={6}>
					<Heading fontSize="80px" mb={4} color="white">
						Let Our AI Agent Find Your
					</Heading>
                    <Heading fontSize="80px" mb={4} lineHeight="1.5" bgGradient="to-r" gradientFrom="#F4E5B2" gradientTo="#D4AF37" bgClip="text" color="transparent">
                        Perfect Design Style!
                    </Heading>
					<Text fontSize="2xl" mt={8} mb={6} maxW="700px" color="white">
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
