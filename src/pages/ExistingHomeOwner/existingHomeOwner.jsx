import { Box, Flex, Heading, Text, Button, Steps, useSteps, Container, Stack, } from "@chakra-ui/react";
import { BsPalette2 } from "react-icons/bs";
import { RiFileUploadFill } from "react-icons/ri";
import { FaCheck } from "react-icons/fa6";
import PropertyPreferences from "@/components/existingHomeOwner/propertyPreference";
import UploadRoomImage from "@/components/existingHomeOwner/uploadRoomImage";
import StyleAnalysis from "@/components/existingHomeOwner/styleAnalysis";
import StyleResults from "@/components/existingHomeOwner/styleResults";
import { useState } from "react";

function ExistingHomeOwner() {
	const [preferences, setPreferences] = useState(null);
	const [uploadedRoomImage, setUploadedRoomImage] = useState(null);
	const [analysisResults, setAnalysisResults] = useState(null);
	
	const steps = useSteps({
		defaultStep: 0,
		count: 2,
	});

	const handleAnalysisComplete = (results) => {
		setAnalysisResults(results);
	};

	const items = [
		{
			title: "Preferences",
			icon: <BsPalette2 />,
			content: <PropertyPreferences onPreferencesChange={setPreferences} />,
		},
		{
			title: "Upload a Photo",
			icon: <RiFileUploadFill />,
			content: analysisResults ? (
				<StyleResults 
					analysisResults={analysisResults}
					roomImage={uploadedRoomImage?.preview}
				/>
			) : uploadedRoomImage ? (
				<StyleAnalysis file={uploadedRoomImage} onComplete={handleAnalysisComplete} />
			) : (
				<UploadRoomImage onFileChange={setUploadedRoomImage} />
			),
		},
	];

	// Disable next button if:
	// Step 0: No preferences selected
	// Step 1: No room image uploaded
	const isNextDisabled = 
		(steps.value === 0 && !preferences) ||
		(steps.value === 1 && !uploadedRoomImage);

	// Hide navigation buttons during AI analysis
	const showNavigationButtons = 
		!(steps.value === 1 && uploadedRoomImage && !analysisResults);

	return (
		<>
			{/* Hero Section */}
			<Box h="45vh" bgImage="url('/ExistingHeroSection.png')" bgSize="cover" bgPos="center">
				<Box h="100%" bg="blackAlpha.600">
				<Container maxW="6xl" py={24}>
					<Stack spacing={4} color="white">
					<Heading size="5xl">Design Your Dream Room <br /> With Our Smart Assistant</Heading>
					<Text fontSize="md" color="yellow.400">Upload your space. Tell us your style. Get personalized renovation ideas in minutes.</Text>
					</Stack>
				</Container>
				</Box>
			</Box>

			{/* Action Steps */}
			<Box pb={20} px={8}>
				<Steps.RootProvider value={steps} colorPalette="yellow">
					<Box
						w="75%"
						h="150px"
						mb={-12}
						mt={-20}
						mx="auto"
						textAlign="center"
						boxShadow="0 4px 10px rgba(0, 0, 0, 0.15)"
						borderRadius="10px"
						bgColor="#F0F0F0"
						zIndex={1}
						position="relative"
						display="flex"
						alignItems="center"
						justifyContent="center"
						px={8}
					>
						<Steps.List
							display="flex"
							gap={0}
							alignItems="center"
							justifyContent="space-between"
							w="100%"
						>
							{items.map((item, index) => (
								<Steps.Item
									key={index}
									index={index}
									display="flex"
									alignItems="center"
								>
									<Flex
										direction="column"
										align="center"
										mb={2}
									>
										<Flex
											direction="column"
											align="center"
											gap={1}
										>
											<Steps.Trigger cursor="pointer">
												<Steps.Indicator
													borderRadius="full"
													width="56px"
													height="56px"
													fontSize="24px"
												>
													<Steps.Status
														complete={<FaCheck />}
														incomplete={item.icon}
													/>
												</Steps.Indicator>
											</Steps.Trigger>
										</Flex>
										<Text
											fontWeight="600"
											fontSize="16px"
											mt={2}
										>
											{item.title}
										</Text>
									</Flex>
									{index < items.length - 1 && (
										<Steps.Separator mb={8} height="2px" />
									)}
								</Steps.Item>
							))}
						</Steps.List>
					</Box>
					<Box
						w="80%"
						mx="auto"
						textAlign="center"
						borderRadius="10px"
						zIndex={0}
						position="relative"
						p={6}
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						boxShadow="2px 2px 1px 1px rgba(0, 0, 0, 0.10), 0px 0px 2px 1px rgba(0, 0, 0, 0.10)"
						minH="600px"
					>
						<Box
							flex="1"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							{items.map((item, index) => (
								<Steps.Content key={index} index={index} mt={8} w="100%">
									{item.content}
								</Steps.Content>
							))}
							<Steps.CompletedContent>
								All steps are complete!
							</Steps.CompletedContent>
						</Box>

						{showNavigationButtons && (
							<Flex justify="center" gap={4} mt={6}>
								{steps.value > 0 && (
									<Steps.PrevTrigger asChild>
										<Button
											size="xl"
											borderRadius="md"
											bg="gray.300"
											color="black"
											_hover={{ bg: "gray.400" }}
										>
											Back
										</Button>
									</Steps.PrevTrigger>
								)}
								{steps.value < 1 && (
									<Steps.NextTrigger asChild>
										<Button
											size="xl"
											borderRadius="md"
											bg="#D4AF37"
											color="white"
											disabled={isNextDisabled}
											opacity={isNextDisabled ? 0.5 : 1}
											cursor={isNextDisabled ? "not-allowed" : "pointer"}
											_hover={{ bg: isNextDisabled ? "#D4AF37" : "#C9A961" }}
										>
											Next
										</Button>
									</Steps.NextTrigger>
								)}
							</Flex>
						)}
					</Box>
				</Steps.RootProvider>
			</Box>
		</>
	);
}

export default ExistingHomeOwner;