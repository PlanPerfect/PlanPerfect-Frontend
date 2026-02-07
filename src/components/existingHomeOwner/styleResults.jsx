import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";

function StyleResults({ analysisResults }) {
	const detectedStyle = analysisResults?.detected_style || "Unknown";

	const styleDescriptions = {
		"Industrial": "Raw, unfinished look with exposed brick, metal, and reclaimed wood",
		"Minimalist": "Less is more - clean, simple spaces with essential furniture only",
		"Modern": "Sleek, streamlined design with emphasis on horizontal and vertical lines",
		"Scandinavian": "Light, airy spaces with functional furniture and natural materials",
		"Boho": "Eclectic, colorful style with global influences and layered textures",
		"Contemporary": "Clean lines with a mix of modern and traditional elements",
		"Luxury": "High-end materials, rich textures, and sophisticated color palettes",
		"Japanese": "Minimalist aesthetics with natural materials and zen principles",
		"Japandi": "Fusion of Japanese and Scandinavian design principles",
		"Wabi Sabi": "Embracing imperfection and natural aging in design",
		"Classical": "Traditional elegance with ornate details and symmetry",
		"Vintage": "Nostalgic charm with retro furniture and accessories",
		"Country": "Rustic, cozy style with natural materials and warm tones",
		"Persian": "Rich patterns, intricate designs, and luxurious textiles",
		"Peranakan": "Colorful, ornate style blending Chinese and Malay influences",
		"Boutique": "Curated, high-end aesthetic with unique statement pieces",
		"Electic": "Mix of various styles, colors, and periods"
	};

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
		}
	};

	const recommendations = styleRecommendations[detectedStyle] || {
		recommended: [],
		notRecommended: [],
		reason: "Style compatibility information not available"
	};

	return (
		<Box w="100%" py={8}>
			{/* Detected Style Section */}
			<Heading size="2xl" mb={6} textAlign="center" color="#D4AF37">
				Style Analysis Complete!
			</Heading>

			<Flex direction={{ base: "column", md: "row" }} gap={8} mb={8} align="stretch">
				{/* Room Image */}
				<Box flex="1" border="2px solid #D4AF37" borderRadius="12px" p={4} bg="gray.50">
					{analysisResults?.image_url ? (
						<Image 
							src={analysisResults.image_url} 
							alt="Your Room" 
							maxH="400px" 
							w="100%" 
							objectFit="contain" 
							borderRadius="8px"
						/>
					) : (
						<Box textAlign="center" py={20}>
							<Text color="gray.500">No Cloudinary image available</Text>
						</Box>
					)}
				</Box>

				{/* Style Information */}
				<Box flex="1" border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" display="flex" alignItems="center">
					<Flex direction="column" gap={4} w="100%" textAlign="center">
						<Box>
							<Text fontSize="xl" color="gray.600" mb={2} fontWeight="bold">
								Detected Style
							</Text>
							<Heading size="2xl" color="#D4AF37">
								{detectedStyle}
							</Heading>
						</Box>

						<Box>
							<Text fontSize="xl" color="gray.600" mb={2} fontWeight="bold">
								About This Style
							</Text>
							<Text fontSize="md" color="gray.700">
								{styleDescriptions[detectedStyle] || "A unique interior design style"}
							</Text>
						</Box>
					</Flex>
				</Box>
			</Flex>

			{/* Next Steps Info */}
			<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" textAlign="center">
				<Heading size="xl" mb={3}>
					🎉 Analysis Complete!
				</Heading>
				<Text color="gray.700" fontSize="lg">
					We've successfully identified your interior style as <strong>{detectedStyle}</strong>.
					Click <strong>Next</strong> to select your preferred design themes.
				</Text>
			</Box>
		</Box>
	);
}

export default StyleResults;