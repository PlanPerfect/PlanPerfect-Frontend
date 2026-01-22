import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const designThemes = [
	{ id: 1, name: "Boutique", icon: "👗", color: "#FFB6C1" },
	{ id: 2, name: "Classical", icon: "🏛️", color: "#87CEEB" },
	{ id: 3, name: "Contemporary", icon: "🏢", color: "#E8F4F8" },
	{ id: 4, name: "Country", icon: "🌳", color: "#90EE90" },
	{ id: 5, name: "Electic", icon: "💡", color: "#FFE4B5" },
	{ id: 6, name: "Industrial", icon: "⚙️", color: "#D3D3D3" },
	{ id: 7, name: "Japanese", icon: "🌸", color: "#FFB6D9" },
	{ id: 8, name: "Luxury", icon: "💎", color: "#E6E6FA" },
	{ id: 9, name: "Minimalist", icon: "🔶", color: "#FFA07A" },
	{ id: 10, name: "Modern", icon: "📊", color: "#E0E0E0" },
	{ id: 11, name: "Persian", icon: "🧿", color: "#ADD8E6" },
	{ id: 12, name: "Scandinavian", icon: "🪵", color: "#F5DEB3" },
	{ id: 13, name: "Vintage", icon: "💗", color: "#FFC0CB" },
	{ id: 14, name: "Wabi Sabi", icon: "⏳", color: "#E6D5B8" },
	{ id: 15, name: "Japandi", icon: "🏯", color: "#FFE4E1" },
	{ id: 16, name: "Peranakan", icon: "🏛️", color: "#E6E6FA" },
];

function StyleSelector({ detectedStyle, onStylesChange, value = [], preferences, analysisResults }) {
	const [localSelectedThemes, setLocalSelectedThemes] = useState(() =>
		value.map(name => {
			const match = designThemes.find(t => t.name === name);
			return match?.id;
		}).filter(Boolean)
	);
	
	const didInitFromDetected = useRef(false);

	// Optional: preselect detected style ONCE (doesn't fight user clicks)
	useEffect(() => {
		if (!detectedStyle) return;
		if (didInitFromDetected.current) return;
		if (localSelectedThemes.length > 0) return;

		const match = designThemes.find(
			t => t.name.toLowerCase() === detectedStyle.toLowerCase()
		);
		if (!match) return;

		didInitFromDetected.current = true;
		setLocalSelectedThemes([match.id]);
		onStylesChange?.([match.name]);
	}, [detectedStyle, localSelectedThemes.length, onStylesChange]);

	const handleThemeSelect = (themeId) => {
		let next;

		if (localSelectedThemes.includes(themeId)) {
			next = localSelectedThemes.filter(id => id !== themeId);
		} else if (localSelectedThemes.length < 2) {
			next = [...localSelectedThemes, themeId];
		} else {
			return;
		}

		setLocalSelectedThemes(next);

		const selectedNames = next
			.map(id => designThemes.find(t => t.id === id)?.name)
			.filter(Boolean);

		onStylesChange?.(selectedNames);
	};

	const selectedThemeDetails = localSelectedThemes
		.map(id => designThemes.find(t => t.id === id))
		.filter(Boolean);

	return (
		<Box w="100%" maxW="1200px" mx="auto" p={8}>
			{/* Header */}
			<Box mb={8}>
				<Heading size="xl" textAlign="center" mb={3}>
					What is your design theme preference?
				</Heading>
				<Text textAlign="center" color="gray.600" fontSize="lg" mb={2}>
					You can choose up to maximum 2 choices.
				</Text>
				{detectedStyle && (
					<Flex justify="center" align="center" gap={2} mt={4}>
						<Text fontSize="sm" color="gray.600">
							💡 We detected your style as
						</Text>
						<Box
							bg="#F4E5B2"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="sm"
							fontWeight="600"
						>
							{detectedStyle}
						</Box>
					</Flex>
				)}
			</Box>

			{/* Theme Grid */}
			<Flex flexWrap="wrap" gap={4} justify="center" mb={6}>
				{designThemes.map((theme) => {
					const isSelected = localSelectedThemes.includes(theme.id);
					const isDisabled = !isSelected && localSelectedThemes.length >= 2;

					return (
						<Button
							key={theme.id}
							onClick={() => handleThemeSelect(theme.id)}
							bg={isSelected ? "#D4AF37" : "white"}
							color={isSelected ? "white" : "black"}
							border="2px solid"
							borderColor="#D4AF37"
							borderRadius="10px"
							px={8}
							py={7}
							h="auto"
							fontSize="lg"
							fontWeight="500"
							minW="200px"
							opacity={isDisabled ? 0.4 : 1}
							cursor={isDisabled ? "not-allowed" : "pointer"}
							_hover={{
								bg: isDisabled ? "white" : isSelected ? "#C9A961" : "#F4E5B2",
								transform: isDisabled ? "none" : "translateY(-2px)",
								boxShadow: isDisabled ? "none" : "md",
							}}
							transition="all 0.2s"
							disabled={isDisabled}
							display="flex"
							alignItems="center"
							gap={3}
						>
							<Text fontSize="28px">{theme.icon}</Text>
							<Text>{theme.name}</Text>
						</Button>
					);
				})}
			</Flex>

			{/* Selection Counter */}
			<Flex justify="center" align="center" gap={2} mb={8}>
				<Box
					bg={localSelectedThemes.length > 0 ? "#D4AF37" : "gray.200"}
					color={localSelectedThemes.length > 0 ? "white" : "gray.600"}
					px={4}
					py={2}
					borderRadius="full"
					fontSize="sm"
					fontWeight="600"
					transition="all 0.2s"
				>
					{localSelectedThemes.length} / 2 Selected
				</Box>
			</Flex>

			{/* Preview Your Selections - Only shown when at least one style is selected */}
			{localSelectedThemes.length > 0 && (
				<Box mt={8}>
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
							<Flex gap={3} flexWrap="wrap" justify="center">
								{selectedThemeDetails.map((theme, index) => (
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
										{theme.name}
									</Box>
								))}
							</Flex>
						</Box>

						{/* Ready to Continue Message */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" textAlign="center">
							<Text fontSize="lg" color="gray.700">
								🎉 You're all set! Review your selections above and click "Next" below to generate your personalized design recommendations.
							</Text>
						</Box>
					</Flex>
				</Box>
			)}
		</Box>
	);
}

export default StyleSelector;