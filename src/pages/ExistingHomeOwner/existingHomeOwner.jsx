import { Box, Flex, Heading, Text, Button, Steps, useSteps, Container, Stack } from "@chakra-ui/react";
import { BsPalette2 } from "react-icons/bs";
import { RiFileUploadFill } from "react-icons/ri";
import { FaCheck, FaEye, FaMagnifyingGlass } from "react-icons/fa6";
import { FaPalette } from "react-icons/fa";
import PropertyPreferences from "@/components/existingHomeOwner/propertyPreference";
import UploadRoomImage from "@/components/existingHomeOwner/uploadRoomImage";
import StyleAnalysis from "@/components/existingHomeOwner/styleAnalysis";
import StyleResults from "@/components/existingHomeOwner/styleResults";
import StyleSelector from "@/components/existingHomeOwner/styleSelector";
import PreviewSelections from "@/components/existingHomeOwner/previewSelections";
import { useState } from "react";

function ExistingHomeOwner() {
	const [preferences, setPreferences] = useState(null);
	const [uploadedRoomImage, setUploadedRoomImage] = useState(null);
	const [analysisResults, setAnalysisResults] = useState(null);
	const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
	const [selectedStyles, setSelectedStyles] = useState([]);
	const [fileSelected, setFileSelected] = useState(false); // NEW

	const steps = useSteps({
		defaultStep: 0,
		count: 5
	});

	const handleAnalysisComplete = (results) => {
		setAnalysisResults(results);
		setUploadedImageUrl(results.image_url);
		steps.setStep(2);
	};

	const handleStylesChange = (styles) => {
		setSelectedStyles(styles);
	};

	const handleFileChange = (file) => { // NEW
		setUploadedRoomImage(file);
		setFileSelected(!!file);
	};

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
				<Box w="100%" maxW="800px" mx="auto" p={8} textAlign="center">
					<Heading size="2xl" mb={4} color="#D4AF37">
						✓ Upload Complete
					</Heading>
					<Text fontSize="lg" color="gray.600">
						Your image has been uploaded and analyzed successfully. Click Next to see the results.
					</Text>
					<Box mt={4} p={4} bg="gray.100" borderRadius="md" fontSize="sm" textAlign="left">
						<Text fontWeight="bold">Debug Info:</Text>
						<Text>Image URL: {uploadedImageUrl}</Text>
						<Text>File ID: {analysisResults?.file_id}</Text>
					</Box>
				</Box>
			) : uploadedRoomImage ? (
				<StyleAnalysis file={uploadedRoomImage} onComplete={handleAnalysisComplete} />
			) : (
				<UploadRoomImage onFileChange={handleFileChange} onFileSelected={setFileSelected} />
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
			icon: <FaPalette />,
			content: (
				<StyleSelector
					detectedStyle={analysisResults?.detected_style}
					onStylesChange={handleStylesChange}
					value={selectedStyles}
					preferences={preferences}
					analysisResults={analysisResults}
				/>
			),
		},
		{
			title: "Preview",
			icon: <FaMagnifyingGlass />,
			content: (
				<PreviewSelections
					preferences={preferences}
					analysisResults={analysisResults}
					selectedStyles={selectedStyles}
					uploadedImageUrl={uploadedImageUrl}
					onStylesChange={handleStylesChange}
					onBack={() => steps.setStep(3)}
				/>
			),
		}
	];

	const isNextDisabled =
		(steps.value === 0 && !preferences) ||
		(steps.value === 1 && !analysisResults) ||
		(steps.value === 3 && selectedStyles.length === 0);

	const hideButtons = steps.value === 1 && fileSelected && !analysisResults;
	const showNextButton = !hideButtons && steps.value !== 4;
	const showBackButton = !hideButtons && steps.value !== 4;

	return (
		<>
			<Box style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
					backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
					backgroundSize: "cover", backgroundPosition: "center",
					backgroundRepeat: "no-repeat", zIndex: -1
				}}
			/>

			<Box h="100vh" position="relative" overflow="visible">
				<Box h="100%">
					<Container maxW="6xl" py={24}>
						<Stack spacing={4} color="white">
							<Heading fontSize="80px" lineHeight={1.5}>
								Design Your Dream Room
							</Heading>
							<Heading fontSize="80px" mb={4} lineHeight="1.5" bgGradient="to-r"
								gradientFrom="#F4E5B2" gradientTo="#D4AF37" bgClip="text"
								color="transparent"
							>
								With Our Smart Assistant
							</Heading>
							<Text fontSize="2xl" bgClip="text" color="white">
								Upload your space. Tell us your style. <br/>
								Get personalized renovation ideas in minutes.
							</Text>
						</Stack>
					</Container>
				</Box>
			</Box>

			<Box pb={20} px={8}>
				<Steps.RootProvider value={steps} colorPalette="yellow">
					<Box w="75%" h="150px" mb={-12} mt={-20} mx="auto"
						textAlign="center" boxShadow="0 4px 10px rgba(0, 0, 0, 0.15)"
						borderRadius="10px" bgColor="#F0F0F0"
						zIndex={1} position="relative" display="flex"
						alignItems="center" justifyContent="center" px={8}
					>
						<Steps.List display="flex" gap={0} alignItems="center" justifyContent="space-between" w="100%">
							{items.map((item, index) => (
								<Steps.Item key={index} index={index} display="flex" alignItems="center">
									<Flex direction="column" align="center" mb={2}>
										<Flex direction="column" align="center" gap={1}>
											<Steps.Trigger cursor="default" pointerEvents="none">
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
					<Box w="80%" mx="auto" textAlign="center" borderRadius="10px" zIndex={0}
						position="relative" px={6} py={12} mt={-11} display="flex"
						flexDirection="column" alignItems="center" justifyContent="center"
						boxShadow="2px 2px 1px 1px rgba(0, 0, 0, 0.10), 0px 0px 2px 1px rgba(0, 0, 0, 0.10)"
						minH="600px" bg="white"
					>
						<Box flex="1" display="flex" alignItems="center" justifyContent="center" w="100%">
							{items.map((item, index) => (
								<Steps.Content key={index} index={index} mt={8} w="100%">
									{item.content}
								</Steps.Content>
							))}
							<Steps.CompletedContent>All steps are complete!</Steps.CompletedContent>
						</Box>

						{(showBackButton || showNextButton) && steps.value < 4 && (
							<Flex justify="center" gap={4} mt={6}>
								{showBackButton && steps.value > 0 && (
									<Steps.PrevTrigger asChild>
										<Button size="xl" borderRadius="md" bg="gray.300"
											color="black"
											_hover={{ bg: "gray.400" }}
										>
											Back
										</Button>
									</Steps.PrevTrigger>
								)}
								{showNextButton && steps.value < 4 && (
									<Steps.NextTrigger asChild>
										<Button size="xl" borderRadius="md" bg="#D4AF37" color="white" 
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