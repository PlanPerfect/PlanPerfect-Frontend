import { Box, Flex, Heading, Text, Button, Textarea, VStack } from "@chakra-ui/react";
import { FaWandMagicSparkles, FaPalette } from "react-icons/fa6";
import { useState } from "react";

function RegenerateDesignInput({ 
	onRegenerate, 
	onCancel, 
	currentStyles = [],
	availableStyles = [],
	isLoading = false 
}) {
	const [regeneratePrompt, setRegeneratePrompt] = useState("");
	// Initialize with the first current style (since we only allow one)
	const [selectedStyles, setSelectedStyles] = useState(currentStyles.length > 0 ? [currentStyles[0]] : []);
	const [error, setError] = useState("");

	// Toggle style selection - only allow one at a time
	const handleStyleToggle = (style) => {
		setSelectedStyles(prev => {
			if (prev.includes(style)) {
				// Deselect if clicking the same style
				return [];
			} else {
				// Select new style (replace any existing selection)
				return [style];
			}
		});
		setError(""); // Clear error when user makes changes
	};

	// Handle regenerate button click
	const handleRegenerate = () => {
		// Validate that at least something has changed
		if (!regeneratePrompt.trim() && selectedStyles.length === 0) {
			setError("Please either enter a prompt or select a design style");
			return;
		}

		// Call parent's regenerate handler
		onRegenerate({
			prompt: regeneratePrompt.trim(),
			styles: selectedStyles
		});
	};

	// Check if anything has changed
	const hasChanges = regeneratePrompt.trim() || 
		JSON.stringify(selectedStyles.sort()) !== JSON.stringify(currentStyles.sort());

	return (
		<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" boxShadow="md">
			<VStack spacing={8} align="stretch">
				{/* Header */}
				<Box textAlign="center">
					<Flex align="center" justify="center" gap={2} mb={2}>
						<FaPalette color="#D4AF37" size={24} />
						<Heading size="lg" color="#D4AF37">
							Customize Your Design
						</Heading>
					</Flex>
					<Text color="gray.600" fontSize="md">
						Change the design styles or add custom instructions
					</Text>
				</Box>

				{/* Style Selection Section */}
				<Box>
					<Flex align="center" gap={2} mb={3} justify="center">
						<FaPalette color="#D4AF37" size={20} />
						<Heading size="md" color="gray.700">
							Design Themes
						</Heading>
					</Flex>
					<Text fontSize="sm" color="gray.600" mb={5} textAlign="center">
						Select one design style for your space
					</Text>
					
					<Flex gap={3} flexWrap="wrap" justify="center">
						{availableStyles.map((style) => {
							const isSelected = selectedStyles.includes(style);
							return (
								<Button key={style} onClick={() => handleStyleToggle(style)}
									size="md" bg={isSelected ? "#D4AF37" : "white"}
									color={isSelected ? "white" : "#8B7355"}
									border="2px solid"
									borderColor={isSelected ? "#D4AF37" : "#E2E8F0"}
									px={6} py={3} borderRadius="full"
									fontSize="md" fontWeight="600"
									_hover={{
										bg: isSelected ? "#C9A961" : "#F4E5B2",
										borderColor: "#D4AF37",
										transform: "translateY(-2px)",
										boxShadow: "md"
									}}
									transition="all 0.2s"
								>
									{style}
								</Button>
							);
						})}
					</Flex>
				</Box>

				{/* Divider */}
				<Flex justify="center" align="center" position="relative" py={3}>
					<Box position="absolute" left="0" right="0" h="1px" bg="gray.300"/>
					<Box bg="#FFFDF7" px={4} position="relative"zIndex={1}>
						<Text color="gray.500" fontSize="sm" fontWeight="600">
							AND/OR
						</Text>
					</Box>
				</Flex>

				{/* Custom Prompt Section */}
				<Box>
					<Flex align="center" gap={2} mb={3} justify="center">
						<FaWandMagicSparkles color="#D4AF37" size={20} />
						<Heading size="md" color="gray.700">
							Custom Instructions
						</Heading>
					</Flex>
					<Text fontSize="sm" color="gray.600" mb={5} textAlign="center">
						Describe specific changes you'd like to see
					</Text>
					
					<Textarea value={regeneratePrompt}
						onChange={(e) => {
							setRegeneratePrompt(e.target.value);
							setError(""); // Clear error on input
						}}
						placeholder="E.g., Make the walls darker blue, add more plants, change the sofa to gray, include warmer lighting..."
						size="lg" minH="120px" borderColor="#D4AF37"
						focusBorderColor="#C9A961"
						_hover={{ borderColor: "#C9A961" }}
						fontSize="md" borderRadius="md"
					/>
				</Box>

				{/* Error Display */}
				{error && (
					<Box bg="red.50" border="1px solid" borderColor="red.300"
						borderRadius="md" p={3} textAlign="center"
					>
						<Text color="red.600" fontSize="sm" fontWeight="600">
							⚠️ {error}
						</Text>
					</Box>
				)}

				{/* Action Buttons */}
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
						isDisabled={!hasChanges || isLoading}
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