import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function GenerateDesignDocument({ floorPlanFile, preferences, budget, extractionResults }) {
	const navigate = useNavigate();

	const handleNavigateToChatbot = () => {
		navigate("/lumen/chat", {
			// state: { floorPlanFile, preferences, budget, extractionResults }
		});
	};

	const handleNavigateToDesignDocument = () => {
		// Pass state to design document page
		navigate("/designDocument", {
			state: {
				floorPlanFile,
				preferences,
				budget,
				extractionResults
			}
		});
	};

	return (
		<Box w="100%" pt={10}>
			<VStack gap={6} align="stretch">
				<Box textAlign="center">
					<Heading fontSize="2xl" mb={2}>
						Generate Your Design Document
					</Heading>

					<Text color="gray.600" mb={6} fontSize="sm">
						Choose how you'd like to proceed with your interior design documentation.
					</Text>
				</Box>

				{/* Document Preview Info */}
				<Box
					p={6}
					bg="gray.50"
					borderRadius="lg"
					border="1px solid"
					borderColor="gray.200"
				>
					<Heading fontSize="md" mb={3}>
						Your document will include:
					</Heading>
					<VStack align="start" gap={2}>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Executive summary and design philosophy
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Room-by-room space analysis
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Color palette and material recommendations
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Furniture suggestions with cost estimates
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">Detailed budget breakdown</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">Implementation timeline</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">Maintenance Guide</Text>
						</Flex>
					</VStack>
				</Box>

				{/* Chatbot CTA Button - PRIMARY */}
				<Button
					size="xl"
					bg="#D4AF37"
					color="white"
					_hover={{ bg: "#C9A961" }}
					w="100%"
					h="60px"
					fontSize="lg"
					leftIcon={<IoSparkles />}
					onClick={handleNavigateToChatbot}
				>
					Chat with our chatbot to get a more cohesive report
				</Button>

				{/* Skip & Generate Button - SECONDARY */}
				<Button
					size="xl"
					variant="outline"
					borderColor="#D4AF37"
					color="#D4AF37"
					bg="transparent"
					_hover={{ bg: "yellow.50" }}
					onClick={handleNavigateToDesignDocument}
					disabled={!floorPlanFile}
					leftIcon={<IoSparkles />}
					w="100%"
					h="60px"
					fontSize="lg"
				>
					Skip and generate design document now
				</Button>

				<Text fontSize="xs" color="gray.500" textAlign="center">
					You can preview and download your document on the next page.
				</Text>
			</VStack>
		</Box>
	);
}

export default GenerateDesignDocument;