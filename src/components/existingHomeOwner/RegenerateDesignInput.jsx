import { Box, Flex, Heading, Text, Button, Textarea, VStack, Image } from "@chakra-ui/react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaCouch } from "react-icons/fa";
import { useState } from "react";
import FurnitureSelector from "@/components/existingHomeOwner/FurnitureSelector";

function RegenerateDesignInput({ 
	onRegenerate, 
	onCancel, 
	currentStyles = [],
	isLoading = false,
	initialFurnitureUrls = [],
	initialFurnitureDescriptions = []
}) {
	const [regeneratePrompt, setRegeneratePrompt] = useState("");
	const [error, setError] = useState("");
	const [showFurnitureSelector, setShowFurnitureSelector] = useState(false);
	const [selectedFurnitureUrls, setSelectedFurnitureUrls] = useState(initialFurnitureUrls);
	const [selectedFurnitureDescriptions, setSelectedFurnitureDescriptions] = useState(initialFurnitureDescriptions);

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

	const handleRemoveFurniture = (urlToRemove) => {
		const idx = selectedFurnitureUrls.indexOf(urlToRemove);
		setSelectedFurnitureUrls((prev) => prev.filter((u) => u !== urlToRemove));
		setSelectedFurnitureDescriptions((prev) => prev.filter((_, i) => i !== idx));
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

	const hasFurniture = selectedFurnitureUrls.length > 0;

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

				{/* Furniture Selection Box */}
				<Box border="1px solid #F4E5B2" borderRadius="10px" p={4} bg="white">
					<Flex align="center" justify="space-between" flexWrap="wrap" gap={3} mb={hasFurniture ? 4 : 0}>
						<Box>
							<Text fontWeight="600" color="gray.700" fontSize="md">Furniture Selection</Text>
							<Text fontSize="sm" color="gray.500">
								{hasFurniture
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
							{hasFurniture ? "Change Furniture" : "Select Furniture"}
						</Button>
					</Flex>

					{/* Furniture Preview Strip */}
					{hasFurniture && (
						<Flex gap={3} flexWrap="wrap">
							{selectedFurnitureUrls.map((url, idx) => (
								<Box key={url} position="relative" borderRadius="8px"
									overflow="visible" border="2px solid #D4AF37"
									boxShadow="sm" w="100px" h="100px"
									flexShrink={0}
								>
									<Image src={url} alt={selectedFurnitureDescriptions[idx] || `Furniture ${idx + 1}`}
										w="100%" h="100%" objectFit="cover" borderRadius="6px"
									/>

									{/* Tooltip label */}
									{selectedFurnitureDescriptions[idx] && (
										<Box position="absolute" bottom="-22px" left="50%"
											transform="translateX(-50%)" bg="gray.700" color="white"
											fontSize="9px" fontWeight="600" px={1.5} py={0.5}
											borderRadius="4px" whiteSpace="nowrap" maxW="90px"
											overflow="hidden" textOverflow="ellipsis"
											pointerEvents="none"
										>
											{selectedFurnitureDescriptions[idx]}
										</Box>
									)}
									{/* Remove button */}
									<Button size="xs" position="absolute" top="-10px" 	 right="-10px"
										borderRadius="full" bg="red.400" color="white" minW="22px"
										h="22px" p={0} fontSize="10px" fontWeight="700" lineHeight="1"
										_hover={{ bg: "red.500" }}
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveFurniture(url);
										}}
										isDisabled={isLoading}
										aria-label="Remove furniture"
									>
										✕
									</Button>
								</Box>
							))}
						</Flex>
					)}
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

				<Flex gap={3} justify="center" flexWrap="wrap" pt={hasFurniture ? 4 : 2}>
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