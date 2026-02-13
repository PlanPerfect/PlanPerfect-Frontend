import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { FaCheckCircle, FaPalette, FaHome, FaDollarSign, FaPaintBrush, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import server from "../../../networking";
/**
 * PreviewSelections Component
 * 
 * Displays a summary of all user selections before proceeding to image generation:
 * 1. Property Preferences (property type, unit type, budget)
 * 2. AI-Detected Style
 * 3. Selected Design Themes
 * 
 * Includes a button to save all data to database and navigate to the image generation page
 */
function PreviewSelections({ 
	preferences, 
	analysisResults, 
	selectedStyles,
	uploadedImageUrl,
	onStylesChange,
	onBack
}) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState(null);
	const handleProceedToGeneration = async () => {
		setIsSaving(true);
		setSaveError(null);
		try {
			// ================================
			// Save preferences to database
			// ================================
			const prefsFormData = new FormData();
			prefsFormData.append('preferences', JSON.stringify(preferences));
			prefsFormData.append('selected_styles', JSON.stringify(selectedStyles));
			prefsFormData.append('analysis_results', JSON.stringify(analysisResults));
			prefsFormData.append('user_id', user.uid);
			
			// Save preferences to database
			const prefsResponse = await server.post(
				'/existingHomeOwners/styleClassification/savePreferences', 
				prefsFormData
			);
			
			// Navigate to StyleMatch GetStarted page
			navigate('/StyleMatch');
		} catch (error) {
			console.error('Error saving data:', error);
			setSaveError(
				error.response?.data?.detail || 
				error.response?.data?.result ||
				error.message || 
				'Failed to save data. Please try again.'
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Box w="100%" maxW="1200px" mx="auto" p={8}>
			<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
				Preview Your Selections
			</Heading>
			<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
				Review your choices before generating your personalized design
			</Text>
			<Flex direction="column" gap={6}>
				{/* Property Preferences Card */}
				<Box border="2px solid #D4AF37" borderRadius="12px" 
					p={6} bg="white" boxShadow="md"
				>
					<Flex align="center" justify="center" gap={3} mb={4}>
						<FaHome color="#D4AF37" size={24} />
						<Heading size="lg" color="#D4AF37">
							Your Property Preferences
						</Heading>
					</Flex>
					
					<Flex direction="column" gap={3} align="center">
						<Flex align="center" gap={2}>
							<Text fontWeight="600" color="gray.700">Property Type:</Text>
							<Text color="gray.600">{preferences?.propertyType || 'Not specified'}</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Text fontWeight="600" color="gray.700">Unit Type:</Text>
							<Text color="gray.600">{preferences?.unitType || 'Not specified'}</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Text fontWeight="600" color="gray.700">Budget:</Text>
							<Text color="gray.600">
								{preferences?.budgetMin && preferences?.budgetMax 
									? `SGD $${(preferences.budgetMin / 1000).toFixed(0)}k - $${(preferences.budgetMax / 1000).toFixed(0)}k`
									: 'Not specified'
								}
							</Text>
						</Flex>
					</Flex>
				</Box>
				{/* AI-Detected Style Card */}
				<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
					<Flex align="center" justify="center" gap={3} mb={4}>
						<FaPaintBrush color="#D4AF37" size={24} />
						<Heading size="lg" color="#D4AF37">
							AI-Detected Style
						</Heading>
					</Flex>
					
					<Flex justify="center" align="center" flexDirection="column" gap={2}>
						<Box bg="#D4AF37" color="white" px={8} py={3}
							borderRadius="full" fontSize="xl" fontWeight="700"
						>
							{analysisResults?.detected_style || 'Unknown'}
						</Box>
					</Flex>
				</Box>
				{/* Selected Design Themes Card */}
				<Box border="2px solid #D4AF37" borderRadius="12px" p={6} 
					bg="white" boxShadow="md"
				>
					<Flex align="center" justify="center" gap={3} mb={4}>
						<FaPalette color="#D4AF37" size={24} />
						<Heading size="lg" color="#D4AF37">
							Your Selected Design Theme
						</Heading>
					</Flex>
					
					{selectedStyles && selectedStyles.length > 0 ? (
						<Flex justify="center" align="center" gap={3} flexWrap="wrap">
							{selectedStyles.map((style, index) => (
								<Box key={index}  bg="#F4E5B2" color="#8B7355" 
									px={6} py={3} borderRadius="full" fontSize="lg" 
									fontWeight="600" border="2px solid #D4AF37"
								>
									{style}
								</Box>
							))}
						</Flex>
					) : (
						<Text textAlign="center" color="gray.500" fontSize="md">
							No design style selected
						</Text>
					)}
				</Box>
				{/* Call to Action Card */}
				<Box border="2px solid #4299E1" borderRadius="12px" 
					p={6} bg="#EBF8FF" boxShadow="md"
				>
					<Flex align="center" justify="center" gap={3} mb={3}>
						<FaCheckCircle color="#4299E1" size={24} />
						<Text fontSize="lg" fontWeight="600" color="gray.700" textAlign="center">
							You're all set! Review your selections above and click "Next Step" below.
						</Text>
					</Flex>
				</Box>
				{/* Error Display */}
				{saveError && (
					<Box bg="red.50" border="2px solid" borderColor="red.400" 
						borderRadius="12px" p={4} textAlign="center"
					>
						<Text color="red.600" fontWeight="600">
							⚠️ {saveError}
						</Text>
					</Box>
				)}
				{/* Action Buttons */}
				<Flex justify="center" mt={4} gap={4}>
					{onBack && (
						<Button onClick={onBack} size="xl" borderRadius="md" 
							bg="gray.300" color="black" px={12} py={7} 
							fontSize="xl" fontWeight="700" leftIcon={<FaArrowLeft />}
							_hover={{
								bg: "gray.400",
								transform: "translateY(-2px)",
								boxShadow: "xl",
							}}
							transition="all 0.2s"
						>
							Back
						</Button>
					)}
					<Button onClick={handleProceedToGeneration}
						isDisabled={!selectedStyles || selectedStyles.length === 0}
						isLoading={isSaving} loadingText="Saving..."
						size="xl" borderRadius="md" bg="#D4AF37"
						color="white" px={16} py={7} fontSize="xl" fontWeight="700"
						_hover={{
							bg: "#C9A961",
							transform: "translateY(-2px)",
							boxShadow: "xl",
						}}
						_disabled={{
							bg: "gray.300",
							cursor: "not-allowed",
							transform: "none"
						}}
						transition="all 0.2s"
					>
						Next Step 🎨
					</Button>
				</Flex>
			</Flex>
		</Box>
	);
}
export default PreviewSelections;