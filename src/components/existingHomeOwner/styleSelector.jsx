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

	const handleThemeSelect = (themeId) => {
		let next;

		if (localSelectedThemes.includes(themeId)) {
			// Deselect if clicking the same theme
			next = [];
		} else {
			// Select new theme (replace any existing selection)
			next = [themeId];
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
		<Box w="100%" maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
			{/* Header */}
			<Box mb={8}>
				<Heading size="xl" textAlign="center" mb={3}>
					What is your design theme preference?
				</Heading>
			</Box>

			{/* Style Recommendations Section */}
			{detectedStyle && (recommendations.recommended.length > 0 || recommendations.notRecommended.length > 0) && (
				<Box mb={8} w="100%">
					<Heading size="lg" textAlign="center" mb={6} color="#D4AF37">
						💡 Style Transformation Guide
					</Heading>

					<Flex direction={{ base: "column", lg: "row" }} gap={6} mb={6} w="100%">
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
										<Box key={index} bg="#10B981" color="white" px={3} py={1.5} borderRadius="full"
											fontSize="xs" fontWeight="600"
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
										<Box key={index} bg="#F59E0B" color="white"
											px={3} py={1.5} borderRadius="full"
											fontSize="xs" fontWeight="600"
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
					<Box border="2px solid #3B82F6" borderRadius="12px" p={4} bg="#EFF6FF" w="100%">
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

			<Box mb={8} w="100%">
				<Text textAlign="center" color="gray.600" fontSize="lg" mb={2}>
					Please select one design theme for your space.
				</Text>
				{detectedStyle && (
					<Flex justify="center" align="center" gap={2} mt={4}>
						<Text fontSize="md" color="gray.600">
							💡 We detected your current style as
						</Text>
						<Box bg="#F4E5B2" px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600">
							{detectedStyle}
						</Box>
					</Flex>
				)}
			</Box>

			{/* Theme Grid */}
			<Flex flexWrap="wrap" gap={4} justify="center" mb={6} w="100%">
				{designThemes.map((theme) => {
					const isSelected = localSelectedThemes.includes(theme.id);

					return (
						<Button key={theme.id}
							onClick={() => handleThemeSelect(theme.id)}
							bg={isSelected ? "#D4AF37" : "white"}
							color={isSelected ? "white" : "black"}
							border="2px solid" borderColor="#D4AF37" borderRadius="10px"
							px={8} py={7} h="auto" fontSize="lg" fontWeight="500"
							minW="200px"
							_hover={{
								bg: isSelected ? "#C9A961" : "#F4E5B2",
								transform: "translateY(-2px)",
								boxShadow: "md",
							}}
							transition="all 0.2s"
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
			<Flex justify="center" align="center" gap={2} mb={8} w="100%">
				<Box bg={localSelectedThemes.length > 0 ? "#D4AF37" : "gray.200"}
					color={localSelectedThemes.length > 0 ? "white" : "gray.600"}
					px={4} py={2} borderRadius="full"
					fontSize="sm" fontWeight="600" transition="all 0.2s"
				>
					{localSelectedThemes.length > 0 ? "1 Style Selected" : "No Style Selected"}
				</Box>
			</Flex>
		</Box>
	);
}

export default StyleSelector;