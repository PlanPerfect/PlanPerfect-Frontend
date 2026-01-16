import { Box, Flex, Heading, Text, Button, Steps, useSteps, Container, Stack } from "@chakra-ui/react";
import { BsPalette2 } from "react-icons/bs";
import { RiFileUploadFill } from "react-icons/ri";
import { FaCheck, FaEye } from "react-icons/fa6";
import PropertyPreferences from "@/components/existingHomeOwner/propertyPreference";
import UploadRoomImage from "@/components/existingHomeOwner/uploadRoomImage";
import StyleAnalysis from "@/components/existingHomeOwner/styleAnalysis";
import StyleResults from "@/components/existingHomeOwner/styleResults";
import StyleSelector from "@/components/existingHomeOwner/styleSelector";
import { useState, useRef } from "react";

function ExistingHomeOwner() {
	const [preferences, setPreferences] = useState(null);
	const [uploadedRoomImage, setUploadedRoomImage] = useState(null);
	const [analysisResults, setAnalysisResults] = useState(null);
	const [selectedStyles, setSelectedStyles] = useState([]);
	const hasAppliedDetectedStyle = useRef(false);

	const steps = useSteps({
		defaultStep: 0,
		count: 5  // Changed from 4 to 5
	});

	const handleAnalysisComplete = (results) => {
		setAnalysisResults(results);
		steps.setStep(2);  // Move to StyleResults step
	};

	const handleStylesChange = (styles) => {
		console.log("handleStylesChange received:", styles);
		setSelectedStyles(styles);
	};

	console.log("Current selectedStyles state:", selectedStyles);
	console.log("Current step:", steps.value);

	const items = [
		{
			title: "Preferences",
			icon: <BsPalette2 />,
			content: <PropertyPreferences onPreferencesChange={setPreferences} />
		},
		{
			title: "Upload a Photo",
			icon: <RiFileUploadFill />,
			content: analysisResults ? (
				// If analysis is complete, show a completion message
				<Box w="100%" maxW="800px" mx="auto" p={8} textAlign="center">
					<Heading size="2xl" mb={4} color="#D4AF37">
						✓ Upload Complete
					</Heading>
					<Text fontSize="lg" color="gray.600">
						Your image has been uploaded and analyzed successfully. Click Next to see the results.
					</Text>
				</Box>
			) : uploadedRoomImage ? (
				<StyleAnalysis file={uploadedRoomImage} onComplete={handleAnalysisComplete} />
			) : (
				<UploadRoomImage onFileChange={setUploadedRoomImage} />
			)
		},
		{
			title: "Style Results",
			icon: <FaEye />,
			content: (
				<StyleResults
					analysisResults={analysisResults}
					roomImage={uploadedRoomImage?.preview}
				/>
			),
		},
		{
			title: "Select Styles",
			icon: <BsPalette2 />,
			content: (
				<StyleSelector
					detectedStyle={analysisResults?.detected_style}
					onStylesChange={handleStylesChange}
					value={selectedStyles}
				/>
			),
		},
		{
			title: "Preview",
			icon: <FaEye />,
			content: (
				<Box w="100%" maxW="1000px" mx="auto" p={8}>
					<Heading size="2xl" textAlign="center" mb={8} color="#D4AF37">
						Preview Your Selections
					</Heading>

					<Flex direction="column" gap={6}>
						{/* Preferences Summary */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="sm">
							<Heading size="lg" mb={4} color="#D4AF37" textAlign="center">
								📋 Your Property Preferences
							</Heading>
							<Flex direction="column" gap={3} align="center">
								<Flex align="center" gap={2} justify="center">
									<Text fontWeight="600" color="gray.700">Property Type:</Text>
									<Text color="gray.600" fontSize="lg">{preferences?.propertyType || "Not selected"}</Text>
								</Flex>
								<Flex align="center" gap={2} justify="center">
									<Text fontWeight="600" color="gray.700">Unit Type:</Text>
									<Text color="gray.600" fontSize="lg">{preferences?.unitType || "Not selected"}</Text>
								</Flex>
								<Flex align="center" gap={2} justify="center">
									<Text fontWeight="600" color="gray.700">Budget:</Text>
									<Text color="gray.600" fontSize="lg">{preferences?.budget || "Not selected"}</Text>
								</Flex>
							</Flex>
						</Box>

						{/* Detected Style */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="sm">
							<Heading size="lg" mb={4} color="#D4AF37" textAlign="center">
								🎨 AI-Detected Style
							</Heading>
							<Flex justify="center" align="center" gap={3}>
								<Box
									bg="#D4AF37"
									color="white"
									px={6}
									py={3}
									borderRadius="full"
									fontSize="xl"
									fontWeight="700"
								>
									{analysisResults?.detected_style || "Unknown"}
								</Box>
							</Flex>
						</Box>

						{/* Selected Styles */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="sm">
							<Heading size="lg" mb={4} color="#D4AF37" textAlign="center">
								✨ Your Selected Design Themes
							</Heading>
							{selectedStyles && selectedStyles.length > 0 ? (
								<Flex gap={3} flexWrap="wrap" justify="center">
									{selectedStyles.map((style, index) => (
										<Box
											key={index}
											bg="#F4E5B2"
											color="#8B7355"
											px={5}
											py={3}
											borderRadius="full"
											fontSize="lg"
											fontWeight="600"
											border="2px solid #D4AF37"
										>
											{style}
										</Box>
									))}
								</Flex>
							) : (
								<Text color="gray.500" fontSize="md" textAlign="center">No design themes selected yet</Text>
							)}
						</Box>

						{/* Summary Card */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" textAlign="center">
							<Text fontSize="lg" color="gray.700" mb={2}>
								🎉 You're all set! Review your selections above and click below to generate your personalized design recommendations.
							</Text>
						</Box>

						{/* Submit Button */}
						<Flex justify="center" mt={4} position="relative">
							<Button
								size="xl"
								borderRadius="md"
								bg="#D4AF37"
								color="white"
								px={16}
								py={7}
								fontSize="xl"
								fontWeight="700"
								_hover={{
									bg: "#C9A961",
									transform: "translateY(-2px)",
									boxShadow: "xl",
								}}
								transition="all 0.2s"
							>
								Submit & Generate Design 🚀
							</Button>
							
							{/* Back Button - Bottom Right Corner */}
							<Steps.PrevTrigger asChild>
								<Button
									position="absolute"
									right={0}
									bottom={0}
									size="md"
									variant="ghost"
									color="gray.600"
									_hover={{
										bg: "gray.100",
										color: "gray.800"
									}}
								>
									← Back
								</Button>
							</Steps.PrevTrigger>
						</Flex>
					</Flex>
				</Box>
			)
		}
	];

	// Disable next button logic
	const isNextDisabled =
		(steps.value === 0 && !preferences) ||
		(steps.value === 1 && !analysisResults) ||  // Can only proceed after analysis is complete
		(steps.value === 3 && selectedStyles.length === 0);  // Changed from step 2 to step 3

	// Hide navigation buttons during AI analysis
	const showNavigationButtons = !(steps.value === 1 && uploadedRoomImage && !analysisResults);

	return (
		<>
			<Box
				style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
					backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			{/* Hero Section */}
			<Box h="100vh" position="relative">
				<Box h="100%">
					<Container maxW="6xl" py={24}>
						<Stack spacing={4} color="white">
							<Heading fontSize="80px" lineHeight={1.5}>
								Design Your Dream Room <br /> With Our Smart Assistant
							</Heading>
							<Text fontSize="2xl" bgGradient="to-r" gradientFrom="#F4E5B2" gradientTo="#D4AF37" bgClip="text" color="transparent">
								Upload your space. Tell us your style. Get personalized renovation ideas in minutes.
							</Text>
						</Stack>
					</Container>
				</Box>
			</Box>

			{/* Action Steps */}
			<Box pb={20} px={8}>
				<Steps.RootProvider value={steps} colorPalette="yellow">
					<Box w="75%" h="150px" mb={-12} mt={-20} mx="auto" textAlign="center" boxShadow="0 4px 10px rgba(0, 0, 0, 0.15)" borderRadius="10px"
						bgColor="#F0F0F0" zIndex={1} position="relative" display="flex" alignItems="center" justifyContent="center" px={8}
					>
						<Steps.List display="flex" gap={0} alignItems="center" justifyContent="space-between" w="100%">
							{items.map((item, index) => (
								<Steps.Item key={index} index={index} display="flex" alignItems="center">
									<Flex direction="column" align="center" mb={2}>
										<Flex direction="column" align="center" gap={1}>
											<Steps.Trigger cursor="pointer">
												<Steps.Indicator borderRadius="full" width="56px" height="56px" fontSize="24px">
													<Steps.Status complete={<FaCheck />} incomplete={item.icon} />
												</Steps.Indicator>
											</Steps.Trigger>
										</Flex>
										<Text fontWeight="600" fontSize="16px" mt={2}>
											{item.title}
										</Text>
									</Flex>
									{index < items.length - 1 && <Steps.Separator mb={8} height="2px" />}
								</Steps.Item>
							))}
						</Steps.List>
					</Box>
					<Box w="80%" mx="auto" textAlign="center" borderRadius="10px" zIndex={0} position="relative" px={6} py={12} mt={-11} display="flex" flexDirection="column" 
						alignItems="center" justifyContent="center" boxShadow="2px 2px 1px 1px rgba(0, 0, 0, 0.10), 0px 0px 2px 1px rgba(0, 0, 0, 0.10)"
						minH="600px" bg={"white"}
					>
						<Box flex="1" display="flex" alignItems="center" justifyContent="center" w="100%">
							{items.map((item, index) => (
								<Steps.Content key={index} index={index} mt={8} w="100%">
									{item.content}
								</Steps.Content>
							))}
							<Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>
						</Box>

						{showNavigationButtons && (
							<Flex justify="center" gap={4} mt={6}>
								{steps.value > 0 && steps.value < 4 && (
									<Steps.PrevTrigger asChild>
										<Button size="xl" borderRadius="md" bg="gray.300" color="black" _hover={{ bg: "gray.400" }}>
											Back
										</Button>
									</Steps.PrevTrigger>
								)}
								{steps.value < 4 && (  // Changed from 2 to 4
									<Steps.NextTrigger asChild>
										<Button
											size="xl"
											borderRadius="md"
											bg="#D4AF37"
											color="white"
											disabled={isNextDisabled}
											_hover={{
												bg: isNextDisabled ? "#D4AF37" : "#C9A961",
											}}
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