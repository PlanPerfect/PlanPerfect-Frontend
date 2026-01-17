import { Box, Flex, Heading, Text, Button, Steps, useSteps } from "@chakra-ui/react";
import { BsPalette2 } from "react-icons/bs";
import { RiFileUploadFill } from "react-icons/ri";
import { IoSparkles } from "react-icons/io5";
import { LuFileCheck2 } from "react-icons/lu";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import PreferenceBudget from "@/components/newHomeOwners/preferenceBudget";
import UploadFloorPlan from "@/components/newHomeOwners/uploadFloorPlan";
import AiExtraction from "@/components/newHomeOwners/aiExtraction";
import CheckResult from "@/components/newHomeOwners/checkResult";
import GenerateDesignDocument from "@/components/newHomeOwners/generateDesignDocument";
import { useState, useCallback } from "react";

function NewHomeOwnerPage() {
	const [uploadedFloorPlan, setUploadedFloorPlan] = useState(null);
	const [extractionResults, setExtractionResults] = useState(null);
	const [startExtraction, setStartExtraction] = useState(false);
	const [preferences, setPreferences] = useState(null);
	const [budget, setBudget] = useState(null);

	const steps = useSteps({
		defaultStep: 0,
		count: 5,
	});

	const handleExtractionComplete = useCallback((results) => {
		setExtractionResults(results);
		steps.setStep(3); // Move to step 4 After AI extraction is completed (Check Details)
	}, [steps]);

	const handleExtractionResultUpdate = useCallback((updatedResults) => {
		setExtractionResults(updatedResults);
	}, []);
	
	const handlePreferenceChange = useCallback((preferencesData) => {
		setPreferences(preferencesData);
	}, []);
	
	const handleBudgetChange = useCallback((budgetValue) => {
		setBudget(budgetValue);
	}, []);

	const handleNextClick = () => {
		// If on upload floor plan step, trigger extraction
		if (steps.value === 1 && uploadedFloorPlan) {
			setStartExtraction(true);
			steps.setStep(2); // Move to AI extraction step
		} else {
			steps.setStep(steps.value + 1); // Normal next step
		}
	};

	const items = [
		{
			title: "Preference & Budget",
			icon: <BsPalette2 />,
			content: <PreferenceBudget onPreferenceChange={handlePreferenceChange} onBudgetChange={handleBudgetChange} />
		},
		{
			title: "Upload Floor Plan",
			icon: <RiFileUploadFill />,
			content: <UploadFloorPlan onFileChange={setUploadedFloorPlan} />,
		},
		{
			title: "AI Extraction",
			icon: <IoSparkles />,
			content: <AiExtraction file={uploadedFloorPlan} onComplete={handleExtractionComplete} startExtraction={startExtraction} />
		},
		{
			title: "Check Details",
			icon: <LuFileCheck2 />,
			content: <CheckResult extractionResults={extractionResults} onUpdateExtractionResults={handleExtractionResultUpdate} />,
		},
		{
			title: "Get Results!",
			icon: <MdOutlineSupportAgent />,
			content: <GenerateDesignDocument floorPlanFile={uploadedFloorPlan} preferences={preferences} budget={budget} extractionResults={extractionResults} />
		},
	];

	const isNextDisabled = steps.value === 1 && uploadedFloorPlan === null;
	const showNavigationButtons = steps.value !== 2 && steps.value !== 4;

	return (
		<>
			{/* Fixed Background */}
			<Box
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: "url('/newHomeOwnerHero.png')",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			{/* Hero Section */}
			<Box
				minH="80vh"
				display="flex"
				alignItems="center"
				justifyContent="center"
				mb={32}
			>
				<Flex
					direction="column"
					justify="center"
					align="center"
					textAlign="center"
					h="100%"
					px={6}
				>
					<Heading fontSize="80px" mb={4} color="white">
						Let Our AI Agent Find Your
					</Heading>
					<Heading
						fontSize="80px"
						mb={4}
						lineHeight="1.5"
						bgGradient="to-r"
						gradientFrom="#F4E5B2"
						gradientTo="#D4AF37"
						bgClip="text"
						color="transparent"
					>
						Perfect Design Style!
					</Heading>
					<Text
						fontSize="2xl"
						mt={8}
						mb={6}
						maxW="700px"
						color="white"
					>
						Complete the 5 steps below to get your personalized
						design style guide and mood board now!
					</Text>
				</Flex>
			</Box>

			{/* Action Steps */}
			<Box pb={2} px={8}>
				<Steps.RootProvider value={steps} colorPalette="yellow">
					<Box
						w="75%"
						h="150px"
						mb={-24}
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
													borderRadius="8px"
													width="48px"
													height="48px"
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
									<Steps.Separator mb={8} height="2px" />
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
						px={6}
						py={12}
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
						bgColor="white"
						boxShadow="2px 2px 1px 1px rgba(0, 0, 0, 0.10), 0px 0px 2px 1px rgba(0, 0, 0, 0.10)"
					>
						<Box
							flex="1"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							{items.map((item, index) => (
								<Steps.Content key={index} index={index} mt={8}>
									{item.content}
								</Steps.Content>
							))}
							<Steps.CompletedContent>
								All steps are complete!
							</Steps.CompletedContent>
						</Box>

						{showNavigationButtons && (
							<Flex justify="center" gap={4}>
								{steps.value > 0 && (
									<Steps.PrevTrigger asChild>
										<Button
											size="xl"
											borderRadius="md"
											bg="gray.300"
											color="black"
											_hover={{ bg: "gray.400" }}
										>
											Prev
										</Button>
									</Steps.PrevTrigger>
								)}
								<Button
									size="xl"
									borderRadius="md"
									bg="#D4AF37"
									color="white"
									disabled={isNextDisabled}
									opacity={isNextDisabled ? 0.5 : 1}
									cursor={isNextDisabled ? "not-allowed" : "pointer"}
									_hover={{ bg: isNextDisabled ? "#D4AF37" : "#C9A961" }}
									onClick={handleNextClick}
								>
									Next
								</Button>
							</Flex>
						)}
					</Box>
				</Steps.RootProvider>
			</Box>
		</>
	);
}

export default NewHomeOwnerPage;