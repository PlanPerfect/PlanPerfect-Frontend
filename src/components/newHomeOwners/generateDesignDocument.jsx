import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { IoSparkles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import server from "../../../networking";
import ShowToast from '@/Extensions/ShowToast';

function GenerateDesignDocument({ floorPlanFile, preferences, budget, extractionResults }) {
	const navigate = useNavigate();
	const { user } = useAuth();
	
	const [isSaving, setIsSaving] = useState(false);

	function base64ToFile(base64, filename) {
		const arr = base64.split(",");
		const mime = arr[0].match(/:(.*?);/)[1];
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
	  
		while (n--) {
		  u8arr[n] = bstr.charCodeAt(n);
		}
	  
		return new File([u8arr], filename, { type: mime });
	}	  

	function filterThemes(preferences) {
		// Nothing passed
		if (!preferences) {
			return ["Not Selected"];
		}
	
		// Object case: { style: "Scandinavian & Peranakan" }
		if (typeof preferences === "object" && preferences.style) {
			return filterThemes(preferences.style);
		}
	
		// Array
		if (Array.isArray(preferences)) {
			return preferences.length > 0 ? preferences : ["Not Selected"];
		}
	
		// String case
		if (typeof preferences === "string") {
			if (preferences.toLowerCase() === "not selected") {
				return ["Not Selected"];
			}
	
			const themes = preferences
				.split("&")
				.map(t => t.trim())
				.filter(Boolean);
	
			return themes.length > 0 ? themes : ["Not Selected"];
		}
	
		// Fallback
		return ["Not Selected"];
	}
	
	const saveUserInputToDatabase = async () => {
		try {
			setIsSaving(true);

			const formData = new FormData();
			
			// Add floor plan file
			formData.append("floor_plan", floorPlanFile.file);
			
			// Add segmented floor plan
			if (extractionResults?.segmentedImage) {
				const segmentedFile = base64ToFile(
					extractionResults.segmentedImage,
					"segmented_floor_plan.webp"
				);
				formData.append("segmented_floor_plan", segmentedFile);
			}
			
			// Add preferences
			if (preferences) {
				formData.append("preferences", JSON.stringify(filterThemes(preferences)));
			}
			
			// Add budget
			if (budget) {
				formData.append("budget", budget);
			}
			
			// Add unit information
			if (extractionResults?.unitInfo) {
				formData.append("unit_info", JSON.stringify(extractionResults.unitInfo));
			}
			
			// Add user ID
			formData.append("user_id", user.uid);

			const response = await server.post("/newHomeOwners/extraction/saveUserInput", formData);

			if (!response.data.success) {
				throw new Error(response.data.result);
			}

			console.log("Save successful:", response.data);
			setIsSaving(false);
			return true;
		} catch (error) {
			console.error("Save user input error:", error);
			setIsSaving(false);
			
			ShowToast("error", "Failed to save your inputs", "Please try again");
			
			return false;
		}
	};

	const handleNavigateToChatbot = async () => {
		const saved = await saveUserInputToDatabase();
		
		if (saved) {
			navigate("/lumen/chat");
		}
	};

	const handleNavigateToDesignDocument = async () => {
		const saved = await saveUserInputToDatabase();

		console.log("Save user input result before navigating to design document:", saved);
		
		if (saved) {
			navigate("/designDocument");
		}
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
					isLoading={isSaving}
					loadingText="Saving your inputs..."
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
					isLoading={isSaving}
					loadingText="Saving your inputs..."
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