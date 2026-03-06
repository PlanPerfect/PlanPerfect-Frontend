import { Box, Button, Flex, Grid, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import server from "../../../networking";
import ShowToast from "@/Extensions/ShowToast";

function GenerateFurnitureFloorPlanAndQuote({ floorPlanFile, preferences, budget, extractionResults, selectedFurniture }) {
	const { user } = useAuth();

	const [phase, setPhase] = useState("saving"); // saving | generating | success | error
	const [floorPlanUrl, setFloorPlanUrl] = useState(null);
	const [llmQuotation, setLlmQuotation] = useState(null);
	const [errorMessage, setErrorMessage] = useState(null);
	const [isAssigning, setIsAssigning] = useState(false);
	const hasStarted = useRef(false);

	function base64ToFile(base64, filename) {
		const arr = base64.split(",");
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) u8arr[n] = bstr.charCodeAt(n);
		return new File([u8arr], filename, { type: mime });
	}

	function filterThemes(prefs) {
		if (!prefs) return ["Not Selected"];
		if (typeof prefs === "object" && prefs.style) return filterThemes(prefs.style);
		if (Array.isArray(prefs)) return prefs.length > 0 ? prefs : ["Not Selected"];
		if (typeof prefs === "string") {
			if (prefs.toLowerCase() === "not selected") return ["Not Selected"];
			const themes = prefs.split("&").map((t) => t.trim()).filter(Boolean);
			return themes.length > 0 ? themes : ["Not Selected"];
		}
		return ["Not Selected"];
	}

	useEffect(() => {
		if (hasStarted.current) return;
		hasStarted.current = true;
		runFlow();
	}, []);

	const runFlow = async () => {
		try {
			setPhase("saving");
			const saved = await saveUserInputToDatabase();
			if (!saved) return;

			setPhase("generating");
			await generateFurnitureFloorPlan();
		} catch {
			setPhase("error");
			setErrorMessage("An unexpected error occurred.");
		}
	};

	const handleApiError = (err, fallback) => {
		const detail = err?.response?.data?.detail || err?.response?.data?.error;
		if (detail) {
			const msg = detail.startsWith("UERROR: ")
				? detail.slice(8)
				: detail.startsWith("ERROR: ")
				? detail.slice(7)
				: detail;
			console.error(fallback, msg);
			ShowToast("error", msg, "Check console for more details.");
		} else {
			console.error(fallback, err?.response);
			ShowToast("error", fallback, "Check console for more details.");
		}
	};

	const saveUserInputToDatabase = async () => {
		try {
			const formData = new FormData();
			formData.append("floor_plan", floorPlanFile.file);

			if (extractionResults?.segmentedImage) {
				const segmentedFile = base64ToFile(
					extractionResults.segmentedImage,
					"segmented_floor_plan.webp"
				);
				formData.append("segmented_floor_plan", segmentedFile);
			}

			if (preferences) formData.append("preferences", JSON.stringify(filterThemes(preferences)));
			if (budget) formData.append("budget", budget);
			if (extractionResults?.unitInfo) formData.append("unit_info", JSON.stringify(extractionResults.unitInfo));
			if (selectedFurniture) formData.append("furniture_selections", JSON.stringify(selectedFurniture));
			formData.append("user_id", user.uid);

			const response = await server.post("/newHomeOwners/extraction/saveUserInput", formData);
			if (!response.data.success) throw new Error(response.data.result);
			return true;
		} catch (err) {
			handleApiError(err, "Failed to save user input");
			setPhase("error");
			setErrorMessage("Failed to save your data. Please try again.");
			return false;
		}
	};

	const generateFurnitureFloorPlan = async () => {
		try {
			const payload = {
				furniture_list: selectedFurniture?.furnitureList || [],
				furniture_counts: selectedFurniture?.furnitureCounts || {},
			};

			const response = await server.post(
				`/newHomeOwners/extraction/generateFurnitureFloorPlan/${user.uid}`,
				payload
			);

			if (!response.data.success) throw new Error(response.data.result);

			setFloorPlanUrl(response.data.result.floor_plan_url);
			if (response.data.result.quotation_range) {
				setLlmQuotation(response.data.result.quotation_range);
			}
			setPhase("success");
			ShowToast("success", "Floor plan generated!", "Your personalised floor plan is ready.");
		} catch (err) {
			handleApiError(err, "Failed to generate floor plan");
			setPhase("error");
			setErrorMessage("Failed to generate your floor plan. Please try again.");
		}
	};

	const handleRetry = () => {
		hasStarted.current = false;
		setErrorMessage(null);
		runFlow();
	};

	const handleAssignDesigner = async () => {
		setIsAssigning(true);
		try {
			const res = await server.post(`/designDocument/clientConfirmationEmail/${user.uid}`);
			if (!res.data.success) throw new Error(res.data.message);
			ShowToast(
				"success",
				"Request sent!",
				"A confirmation email has been sent. A designer will reach out to you shortly. Please check your inbox (and spam folder) for details."
			);
		} catch {
			ShowToast("error", "Failed to send request", "Please try again.");
		} finally {
			setIsAssigning(false);
		}
	};

	const getBudgetRange = () => {
		if (!budget) return "Contact us for a quote";
		let num = 0;
		if (budget.includes("M")) {
			num = parseFloat(budget.replace(/[$M]/g, "")) * 1_000_000;
		} else if (budget.includes("k")) {
			num = parseFloat(budget.replace(/[$k]/g, "")) * 1_000;
		} else {
			num = parseFloat(budget.replace(/[$,]/g, ""));
		}
		if (isNaN(num) || num === 0) return "Contact us for a quote";
		const low = Math.round(num * 0.8).toLocaleString();
		const high = Math.round(num * 1.2).toLocaleString();
		return `$${low} – $${high}`;
	};

	const ROOM_GROUPS = [
		{
			key: "bedroom",
			label: "Bedroom",
			icon: "🛏️",
			items: ["Queen-size Bed", "Wardrobe", "Study Table", "Chair", "Bedside Table"],
		},
		{
			key: "livingRoom",
			label: "Living Room",
			icon: "🛋️",
			items: ["Sofa", "Coffee Table", "TV Stand", "Armchair", "Side Table"],
		},
		{
			key: "kitchen",
			label: "Kitchen / Dining",
			icon: "🍽️",
			items: ["Dining Table", "Dining Chair"],
		},
		{
			key: "balcony",
			label: "Balcony",
			icon: "🌿",
			items: ["Outdoor Chair", "Outdoor Table"],
		},
	];

	const counts = selectedFurniture?.furnitureCounts || {};
	const groupedFurniture = ROOM_GROUPS.map((room) => ({
		...room,
		selected: room.items.filter((item) => counts[item] > 0).map((item) => ({ name: item, qty: counts[item] })),
	})).filter((room) => room.selected.length > 0);

	return (
		<Box w="100%" py={6}>
			{/* Saving */}
			{phase === "saving" && (
				<VStack gap={4} py={12}>
					<Spinner size="xl" color="#D4AF37" thickness="4px" />
					<Heading size="lg">Saving Your Selections...</Heading>
					<Text color="gray.500" fontSize="sm">
						Storing your preferences and furniture choices.
					</Text>
				</VStack>
			)}

			{/* Generating */}
			{phase === "generating" && (
				<VStack gap={4} py={12}>
					<Spinner size="xl" color="#D4AF37" thickness="4px" />
					<Heading size="lg">Generating Your Floor Plan...</Heading>
					<Text color="gray.500" fontSize="sm" maxW="420px" textAlign="center">
						Our AI is placing your chosen furniture on the floor plan. This may take a moment...
					</Text>
				</VStack>
			)}

			{/* Error */}
			{phase === "error" && (
				<VStack gap={4} py={12}>
					<Box
						w="56px"
						h="56px"
						borderRadius="full"
						bg="red.500"
						display="flex"
						alignItems="center"
						justifyContent="center"
						mx="auto"
					>
						<Text color="white" fontSize="2xl">✕</Text>
					</Box>
					<Heading size="lg" color="red.600">Something Went Wrong</Heading>
					<Text color="gray.500" fontSize="sm" textAlign="center" maxW="400px">
						{errorMessage}
					</Text>
					<Button
						bg="#D4AF37"
						color="white"
						_hover={{ bg: "#C9A961" }}
						onClick={handleRetry}
					>
						Try Again
					</Button>
				</VStack>
			)}

			{/* Success */}
			{phase === "success" && (
				<VStack gap={8} align="stretch">
					{/* Header */}
					<VStack gap={2}>
						<Box animation="successFade 3s ease-out forwards" overflow="hidden">
							<Box
								w="56px"
								h="56px"
								borderRadius="full"
								bg="green.500"
								display="flex"
								alignItems="center"
								justifyContent="center"
								mx="auto"
							>
								<Text color="white" fontSize="2xl">✓</Text>
							</Box>
						</Box>
						<Heading size="lg" textAlign="center">Your Floor Plan is Ready!</Heading>
						<Text color="gray.500" fontSize="sm" textAlign="center">
							Here is your AI-generated floor plan with your selected furniture, alongside your original upload.
						</Text>
					</VStack>
					<style>{`
						@keyframes successFade {
							0% { opacity: 1; transform: translateY(0); max-height: 200px; }
							70% { opacity: 1; transform: translateY(0); max-height: 200px; }
							100% { opacity: 0; transform: translateY(-20px); max-height: 0; margin: 0; padding: 0; }
						}
					`}</style>

					{/* Floor Plan Comparison */}
					<Box>
						<Heading size="md" mb={4} textAlign="center" color="gray.700">
							Floor Plan Comparison
						</Heading>
						<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
							{/* Original */}
							<Box>
								<Text fontWeight="600" fontSize="sm" color="gray.500" mb={2} textAlign="center">
									Original Floor Plan
								</Text>
								<Box
									border="2px solid #D0D0D0"
									borderRadius="xl"
									overflow="hidden"
									bg="gray.50"
								>
									<Image
										src={floorPlanFile?.preview}
										alt="Original Floor Plan"
										w="100%"
										objectFit="contain"
										maxH="420px"
									/>
								</Box>
							</Box>

							{/* Generated */}
							<Box>
								<Text fontWeight="600" fontSize="sm" color="#D4AF37" mb={2} textAlign="center">
									AI-Generated Floor Plan
								</Text>
								<Box
									border="2px solid #D4AF37"
									borderRadius="xl"
									overflow="hidden"
									bg="gray.50"
								>
									<Image
										src={floorPlanUrl}
										alt="AI-Generated Floor Plan with Furniture"
										w="100%"
										objectFit="contain"
										maxH="420px"
									/>
								</Box>
							</Box>
						</Grid>
					</Box>

					{/* Furniture Review */}
					<Box
						bg="#FAFAFA"
						border="1px solid #E8E8E8"
						borderRadius="xl"
						p={6}
					>
						<Heading size="md" mb={4} color="gray.700">
							Your Selected Furniture
						</Heading>
						{groupedFurniture.length === 0 ? (
							<Text color="gray.400" fontSize="sm">No furniture selected.</Text>
						) : (
							<Flex direction="column" gap={6}>
								{groupedFurniture.map((room) => (
									<Box key={room.key}>
										<Flex align="center" gap={2} mb={3}>
											<Text fontSize="xl">{room.icon}</Text>
											<Text fontWeight="700" fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="0.05em">
												{room.label}
											</Text>
										</Flex>
										<Grid templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }} gap={3}>
											{room.selected.map(({ name, qty }) => (
												<Flex
													key={name}
													align="center"
													justify="space-between"
													bg="white"
													border="1px solid #E8E8E8"
													borderRadius="lg"
													px={4}
													py={3}
												>
													<Text fontSize="sm" fontWeight="500" color="gray.700">
														{name}
													</Text>
													<Box
														bg="#D4AF37"
														color="white"
														borderRadius="full"
														minW="28px"
														h="28px"
														display="flex"
														alignItems="center"
														justifyContent="center"
														fontSize="xs"
														fontWeight="700"
														ml={2}
													>
														{qty}
													</Box>
												</Flex>
											))}
										</Grid>
									</Box>
								))}
							</Flex>
						)}
					</Box>

					{/* Budget & Quote */}
					<Box
						bg="#FFFDF0"
						border="2px solid #D4AF37"
						borderRadius="xl"
						p={6}
					>
						<Box pb={4}>
							<Text fontSize="sm" color="gray.500" mb={1}>Your Stated Budget</Text>
							<Heading size="lg" color="gray.800">
								{budget || "Not provided"}
							</Heading>
						</Box>
						<Box borderTop="1px solid" borderColor="#D4AF37" opacity={0.35} />
						<Box pt={4}>
							<Text fontSize="sm" color="gray.500" mb={1}>AI-Recommended Quotation Range</Text>
							<Heading size="lg" color="#D4AF37">
								{llmQuotation || getBudgetRange()}
							</Heading>
						</Box>
						<Text fontSize="xs" color="gray.400" mt={3}>
							*AI-estimated based on Singapore renovation costs and your selections. Actual costs may vary.
						</Text>
					</Box>

					{/* Assign Designer Button */}
					<Button
						size="xl"
						bg="#D4AF37"
						color="white"
						_hover={{ bg: isAssigning ? "#D4AF37" : "#C9A961" }}
						w="100%"
						h="60px"
						fontSize="lg"
						disabled={isAssigning}
						cursor={isAssigning ? "not-allowed" : "pointer"}
						onClick={handleAssignDesigner}
					>
						{isAssigning ? (
							<Flex align="center" gap={2}>
								<Spinner size="sm" />
								<Text>Sending request...</Text>
							</Flex>
						) : (
							"Assign me a Designer"
						)}
					</Button>
				</VStack>
			)}
		</Box>
	);
}

export default GenerateFurnitureFloorPlanAndQuote;
