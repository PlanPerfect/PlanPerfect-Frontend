import { Box, Flex, Heading, Text, Button, Textarea, VStack } from "@chakra-ui/react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaCouch } from "react-icons/fa";
import { useState } from "react";
import FurnitureSelector from "@/components/existingHomeOwner/FurnitureSelector";

function RegenerateDesignInput({ 
	onRegenerate, 
	onCancel, 
	currentStyles = [],
	isLoading = false 
}) {
	const [regeneratePrompt, setRegeneratePrompt] = useState("");
	const [error, setError] = useState("");
	const [showFurnitureSelector, setShowFurnitureSelector] = useState(false);
	const [selectedFurnitureUrls, setSelectedFurnitureUrls] = useState([]);
	const [selectedFurnitureDescriptions, setSelectedFurnitureDescriptions] = useState([]);

	const handleRegenerate = () => {
		onRegenerate({
			prompt: regeneratePrompt.trim(),
			styles: currentStyles,
			furnitureUrls: selectedFurnitureUrls,
			furnitureDescriptions: selectedFurnitureDescriptions
		});
	};

	const handleFurnitureConfirm = ({ urls, descriptions }) => {
		setSelectedFurnitureUrls(urls);
		setSelectedFurnitureDescriptions(descriptions);
		setShowFurnitureSelector(false);
	};

	if (showFurnitureSelector) {
		return (
			<FurnitureSelector
				onConfirm={handleFurnitureConfirm}
				onBack={() => setShowFurnitureSelector(false)}
				confirmLabel="Confirm"
			/>
		);
	}

	return (
		<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" boxShadow="md">
			<VStack spacing={8} align="stretch">
				<Box textAlign="center">
					<Flex align="center" justify="center" gap={2} mb={2}>
						<FaWandMagicSparkles color="#D4AF37" size={24} />
						<Heading size="lg" color="#D4AF37">
							Customize Your Design
						</Heading>
					</Flex>
					<Text color="gray.600" fontSize="md">
						Describe specific changes you'd like to see
					</Text>
				</Box>

				<Box>
					<Textarea value={regeneratePrompt}
						onChange={(e) => {
							setRegeneratePrompt(e.target.value);
							setError("");
						}}
						placeholder="E.g., Make the walls darker blue, add more plants, change the sofa to gray, include warmer lighting..."
						size="lg" minH="120px" borderColor="#D4AF37"
						focusBorderColor="#C9A961"
						_hover={{ borderColor: "#C9A961" }}
						fontSize="md" borderRadius="md"
					/>
				</Box>

				<Box border="1px solid #F4E5B2" borderRadius="10px" p={4} bg="white">
					<Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
						<Box>
							<Text fontWeight="600" color="gray.700" fontSize="md">Furniture Selection</Text>
							<Text fontSize="sm" color="gray.500">
								{selectedFurnitureUrls.length > 0
									? `${selectedFurnitureUrls.length} item${selectedFurnitureUrls.length > 1 ? "s" : ""} selected`
									: "No furniture selected"}
							</Text>
						</Box>
						<Button
							onClick={() => setShowFurnitureSelector(true)}
							size="md" variant="outline"
							borderColor="#D4AF37" color="#D4AF37"
							leftIcon={<FaCouch />}
							fontWeight="600" borderRadius="md"
							_hover={{ bg: "#FFFDF7", borderColor: "#C9A961", color: "#C9A961" }}
							isDisabled={isLoading}
						>
							{selectedFurnitureUrls.length > 0 ? "Change Furniture" : "Select Furniture"}
						</Button>
					</Flex>
				</Box>

				{error && (
					<Box bg="red.50" border="1px solid" borderColor="red.300"
						borderRadius="md" p={3} textAlign="center"
					>
						<Text color="red.600" fontSize="sm" fontWeight="600">
							⚠️ {error}
						</Text>
					</Box>
				)}

				<Flex gap={3} justify="center" flexWrap="wrap" pt={2}>
					<Button onClick={handleRegenerate} size="lg"
						bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
						color="white" px={8} py={6} fontSize="md"
						fontWeight="700" borderRadius="md"
						leftIcon={<FaWandMagicSparkles />}
						_hover={{ 
							bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)",
							transform: "translateY(-2px)",
							boxShadow: "lg"
						}}
						transition="all 0.2s"
						isDisabled={isLoading}
						isLoading={isLoading}
						loadingText="Generating..."
					>
						Generate New Design
					</Button>
					<Button onClick={onCancel} size="lg" variant="outline"
						borderColor="#D4AF37" color="#D4AF37"
						px={8} py={6} fontSize="md" fontWeight="600" borderRadius="md"
						_hover={{ 
							bg: "#FFFDF7",
							borderColor: "#C9A961",
							color: "#C9A961"
						}}
						isDisabled={isLoading}
					>
						Cancel
					</Button>
				</Flex>
			</VStack>
		</Box>
	);
}

export default RegenerateDesignInput;