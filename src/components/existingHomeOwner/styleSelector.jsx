import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const designThemes = [
	{ id: 1, name: "Boutique", icon: "💗", color: "#FFB6C1" },
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
	{ id: 16, name: "Peranakan", icon: "🛕", color: "#E6E6FA" },
	{ id: 17, name: "Boho", icon: "🪶", color: "#FFFACD" },
];

function StyleSelector({ detectedStyle, onStylesChange, value = [], preferences, analysisResults }) {
	const [localSelectedThemes, setLocalSelectedThemes] = useState(() =>
		value.map(name => {
			const match = designThemes.find(t => t.name === name);
			return match?.id;
		}).filter(Boolean)
	);

	const didInitFromDetected = useRef(false);

	// Style compatibility recommendations
	const styleRecommendations = {
		"Scandinavian": {
			recommended: ["Minimalist", "Modern", "Japandi", "Japanese"],
			notRecommended: ["Luxury", "Persian", "Peranakan", "Boutique", "Classical"],
			reason: "Scandinavian shares clean lines and natural materials with these styles"
		},
		"Modern": {
			recommended: ["Contemporary", "Minimalist", "Industrial", "Scandinavian"],
			notRecommended: ["Vintage", "Classical", "Persian", "Country"],
			reason: "Modern design complements sleek, streamlined aesthetics"
		},
		"Minimalist": {
			recommended: ["Scandinavian", "Modern", "Japanese", "Wabi Sabi"],
			notRecommended: ["Luxury", "Boutique", "Peranakan", "Persian", "Electic"],
			reason: "Minimalist pairs well with simple, uncluttered styles"
		},
		"Industrial": {
			recommended: ["Modern", "Contemporary", "Electic"],
			notRecommended: ["Classical", "Luxury", "Persian", "Peranakan"],
			reason: "Industrial works with raw, modern aesthetics"
		},
		"Boho": {
			recommended: ["Electic", "Vintage", "Country"],
			notRecommended: ["Minimalist", "Modern", "Japanese"],
			reason: "Boho embraces eclectic, layered design"
		},
		"Contemporary": {
			recommended: ["Modern", "Luxury", "Industrial"],
			notRecommended: ["Vintage", "Classical", "Country"],
			reason: "Contemporary blends well with current design trends"
		},
		"Luxury": {
			recommended: ["Contemporary", "Classical", "Boutique"],
			notRecommended: ["Industrial", "Country", "Wabi Sabi"],
			reason: "Luxury pairs with sophisticated, high-end styles"
		},
		"Japanese": {
			recommended: ["Minimalist", "Scandinavian", "Japandi", "Wabi Sabi"],
			notRecommended: ["Luxury", "Boutique", "Persian", "Peranakan"],
			reason: "Japanese design values simplicity and natural elements"
		},
		"Japandi": {
			recommended: ["Scandinavian", "Japanese", "Minimalist"],
			notRecommended: ["Luxury", "Classical", "Persian"],
			reason: "Japandi is already a fusion of Japanese and Scandinavian"
		},
		"Wabi Sabi": {
			recommended: ["Japanese", "Minimalist", "Country"],
			notRecommended: ["Luxury", "Boutique", "Modern"],
			reason: "Wabi Sabi celebrates imperfection and natural aging"
		},
		"Classical": {
			recommended: ["Luxury", "Vintage", "Persian"],
			notRecommended: ["Modern", "Industrial", "Minimalist"],
			reason: "Classical works with traditional, ornate styles"
		},
		"Vintage": {
			recommended: ["Boho", "Classical", "Electic"],
			notRecommended: ["Modern", "Contemporary", "Industrial"],
			reason: "Vintage pairs well with nostalgic, eclectic styles"
		},
		"Country": {
			recommended: ["Vintage", "Boho"],
			notRecommended: ["Modern", "Luxury", "Industrial"],
			reason: "Country suits rustic, cozy aesthetics"
		},
		"Persian": {
			recommended: ["Luxury", "Classical", "Boutique"],
			notRecommended: ["Minimalist", "Scandinavian", "Japanese"],
			reason: "Persian features rich patterns and luxurious details"
		},
		"Peranakan": {
			recommended: ["Boutique", "Electic", "Vintage"],
			notRecommended: ["Minimalist", "Scandinavian", "Modern"],
			reason: "Peranakan celebrates vibrant colors and ornate details"
		},
		"Boutique": {
			recommended: ["Luxury", "Contemporary", "Electic"],
			notRecommended: ["Country", "Industrial"],
			reason: "Boutique works with curated, high-end aesthetics"
		},
		"Electic": {
			recommended: ["Boho", "Vintage", "Contemporary"],
			notRecommended: ["Minimalist", "Japanese"],
			reason: "Eclectic embraces mixing various styles"
		}
	};

	const recommendations = styleRecommendations[detectedStyle] || {
		recommended: [],
		notRecommended: [],
		reason: "Style compatibility information not available"
	};

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
			</Box>

			{/* Style Recommendations Section */}
			{detectedStyle && (recommendations.recommended.length > 0 || recommendations.notRecommended.length > 0) && (
				<Box mb={8}>
					<Heading size="lg" textAlign="center" mb={6} color="#D4AF37">
						💡 Style Transformation Guide
					</Heading>

					<Flex direction={{ base: "column", lg: "row" }} gap={6} mb={6}>
						{/* Recommended Styles */}
						<Box flex="1" border="2px solid #10B981" borderRadius="12px" p={6} bg="#F0FDF4">
							<Flex align="center" gap={2} mb={4} justify="center">
								<Text fontSize="2xl">✅</Text>
								<Heading size="md" color="#059669">
									Easy Transitions
								</Heading>
							</Flex>
							<Text fontSize="xs" color="gray.600" mb={4} textAlign="center" fontStyle="italic">
								{recommendations.reason}
							</Text>
							<Flex flexWrap="wrap" gap={2} justify="center">
								{recommendations.recommended.length > 0 ? (
									recommendations.recommended.map((style, index) => (
										<Box
											key={index}
											bg="#10B981"
											color="white"
											px={3}
											py={1.5}
											borderRadius="full"
											fontSize="xs"
											fontWeight="600"
										>
											{style}
										</Box>
									))
								) : (
									<Text color="gray.500" fontSize="xs">No specific recommendations</Text>
								)}
							</Flex>
							<Box mt={3} p={2} bg="white" borderRadius="6px">
								<Text fontSize="xs" color="gray.600">
									💰 <strong>Budget Impact:</strong> Lower renovation costs
								</Text>
							</Box>
						</Box>

						{/* Not Recommended Styles */}
						<Box flex="1" border="2px solid #F59E0B" borderRadius="12px" p={6} bg="#FFFBEB">
							<Flex align="center" gap={2} mb={4} justify="center">
								<Text fontSize="2xl">⚠️</Text>
								<Heading size="md" color="#D97706">
									Dramatic Changes
								</Heading>
							</Flex>
							<Text fontSize="xs" color="gray.600" mb={4} textAlign="center" fontStyle="italic">
								Requires more significant transformation
							</Text>
							<Flex flexWrap="wrap" gap={2} justify="center">
								{recommendations.notRecommended.length > 0 ? (
									recommendations.notRecommended.map((style, index) => (
										<Box
											key={index}
											bg="#F59E0B"
											color="white"
											px={3}
											py={1.5}
											borderRadius="full"
											fontSize="xs"
											fontWeight="600"
										>
											{style}
										</Box>
									))
								) : (
									<Text color="gray.500" fontSize="xs">No specific warnings</Text>
								)}
							</Flex>
							<Box mt={3} p={2} bg="white" borderRadius="6px">
								<Text fontSize="xs" color="gray.600">
									💰 <strong>Budget Impact:</strong> Higher renovation costs
								</Text>
							</Box>
						</Box>
					</Flex>

					{/* Info Note */}
					<Box border="2px solid #3B82F6" borderRadius="12px" p={4} bg="#EFF6FF">
						<Flex align="start" gap={3}>
							<Text fontSize="lg">ℹ️</Text>
							<Box>
								<Text fontSize="sm" color="gray.700">
									<strong>Note:</strong> You can still choose any style! These recommendations help you understand the transformation scope. Dramatic changes create stunning results but may require higher budgets.
								</Text>
							</Box>
						</Flex>
					</Box>
				</Box>
			)}
			<Box mb={8}>
				<Text textAlign="center" color="gray.600" fontSize="lg" mb={2}>
					You can choose up to maximum 2 choices.
				</Text>
				{detectedStyle && (
					<Flex justify="center" align="center" gap={2} mt={4}>
						<Text fontSize="md" color="gray.600">
							💡 We detected your style as
						</Text>
						<Box bg="#F4E5B2" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600">
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
							border="2px solid" borderColor="#D4AF37" borderRadius="10px"
							px={8} py={7} h="auto" fontSize="lg" fontWeight="500"
							minW="200px" opacity={isDisabled ? 0.4 : 1} cursor={isDisabled ? "not-allowed" : "pointer"}
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
				<Box bg={localSelectedThemes.length > 0 ? "#D4AF37" : "gray.200"}
					color={localSelectedThemes.length > 0 ? "white" : "gray.600"}
					px={4} py={2} borderRadius="full"
					fontSize="sm" fontWeight="600" transition="all 0.2s"
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
								<Box bg="#D4AF37" color="white" px={6} py={3} borderRadius="full"
									fontSize="xl" fontWeight="700"
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
									<Box key={index} bg="#F4E5B2" color="#8B7355" px={5} py={3} borderRadius="full" fontSize="lg" fontWeight="600" border="2px solid #D4AF37">
										{theme.name}
									</Box>
								))}
							</Flex>
						</Box>

						{/* Ready to Continue Message */}
						<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" textAlign="center">
							<Text fontSize="lg" color="gray.700">
								🎉 You're all set! Review your selections above and click "Generate Design" below to generate your personalized design recommendations.
							</Text>
						</Box>
					</Flex>
				</Box>
			)}
		</Box>
	);
}

export default StyleSelector;