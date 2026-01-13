import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const propertyTypes = ["HDB", "Condo", "Landed"];
const unitTypes = ["1-Room", "2-Room", "3-Room", "4-Room", "5-Room", "Executive", "3gen"];
const budgetRanges = [
	"Below SGD $10k",
	"SGD $10k - $20K",
	"SGD$20k - $40k",
	"Above SGD $40K"
];

function PropertyPreferences({ onPreferencesChange }) {
	const [selectedPropertyType, setSelectedPropertyType] = useState(null);
	const [selectedUnitType, setSelectedUnitType] = useState(null);
	const [selectedBudget, setSelectedBudget] = useState(null);

	useEffect(() => {
		// Update parent component when any preference changes
		if (selectedPropertyType && selectedUnitType && selectedBudget) {
			onPreferencesChange({
				propertyType: selectedPropertyType,
				unitType: selectedUnitType,
				budget: selectedBudget
			});
		} else {
			onPreferencesChange(null);
		}
	}, [selectedPropertyType, selectedUnitType, selectedBudget]);

	return (
		<Box w="100%" maxW="800px" mx="auto" p={8}>
			<Heading size="3xl" textAlign="center" mb={2}>
				Tell Us About Your Property and Preferences
			</Heading>

			{/* Property Type */}
			<Box mb={8}>
				<Text fontSize="2xl" fontWeight="600" mb={4} textAlign="center">
					What is your property type?
				</Text>
				<Flex gap={4} justify="center" flexWrap="wrap">
					{propertyTypes.map((type) => (
						<Button
							key={type}
							onClick={() => setSelectedPropertyType(type)}
							bg={selectedPropertyType === type ? "#D4AF37" : "white"}
							color={selectedPropertyType === type ? "white" : "black"}
							border="2px solid #D4AF37"
							borderRadius="md"
							px={12}
							py={6}
							fontSize="md"
							fontWeight="500"
							minW="150px"
							_hover={{
								bg: selectedPropertyType === type ? "#C9A961" : "#F4E5B2",
							}}
							transition="all 0.2s"
						>
							{type}
						</Button>
					))}
				</Flex>
			</Box>

			{/* Unit Type */}
			<Box mb={8}>
				<Text fontSize="2xl" fontWeight="600" mb={4} textAlign="center">
					What's your unit type?
				</Text>
				<Flex gap={4} justify="center" flexWrap="wrap">
					{unitTypes.map((type) => (
						<Button
							key={type}
							onClick={() => setSelectedUnitType(type)}
							bg={selectedUnitType === type ? "#D4AF37" : "white"}
							color={selectedUnitType === type ? "white" : "black"}
							border="2px solid #D4AF37"
							borderRadius="md"
							px={8}
							py={6}
							fontSize="md"
							fontWeight="500"
							minW="120px"
							_hover={{
								bg: selectedUnitType === type ? "#C9A961" : "#F4E5B2",
							}}
							transition="all 0.2s"
						>
							{type}
						</Button>
					))}
				</Flex>
			</Box>

			{/* Budget */}
			<Box>
				<Text fontSize="2xl" fontWeight="600" mb={4} textAlign="center">
					What's your estimated budget?
				</Text>
				<Flex gap={4} justify="center" flexWrap="wrap">
					{budgetRanges.map((range) => (
						<Button
							key={range}
							onClick={() => setSelectedBudget(range)}
							bg={selectedBudget === range ? "#D4AF37" : "white"}
							color={selectedBudget === range ? "white" : "black"}
							border="2px solid #D4AF37"
							borderRadius="md"
							px={8}
							py={6}
							fontSize="md"
							fontWeight="500"
							minW="180px"
							_hover={{
								bg: selectedBudget === range ? "#C9A961" : "#F4E5B2",
							}}
							transition="all 0.2s"
						>
							{range}
						</Button>
					))}
				</Flex>
			</Box>
		</Box>
	);
}

export default PropertyPreferences;