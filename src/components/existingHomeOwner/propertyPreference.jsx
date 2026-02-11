import { Box, Flex, Heading, Text, Button, Slider } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const propertyTypes = ["HDB", "Condo", "Landed"];
const unitTypes = ["1-Room", "2-Room", "3-Room", "4-Room", "5-Room", "Executive", "3gen"];

// Budget configuration
const MIN_BUDGET = 10000; // SGD 10k
const MAX_BUDGET = 100000; // SGD 100k
const STEP = 5000; // SGD 5k increments

function PropertyPreferences({ onPreferencesChange }) {
	const [selectedPropertyType, setSelectedPropertyType] = useState(null);
	const [selectedUnitType, setSelectedUnitType] = useState(null);
	const [budgetValue, setBudgetValue] = useState([MIN_BUDGET, 50000]); // Default range [10k, 50k]

	useEffect(() => {
		// Update parent component when any preference changes
		if (selectedPropertyType && selectedUnitType && budgetValue) {
			onPreferencesChange({
				propertyType: selectedPropertyType,
				unitType: selectedUnitType,
				budgetMin: budgetValue[0],
				budgetMax: budgetValue[1]
			});
		} else {
			onPreferencesChange(null);
		}
	}, [selectedPropertyType, selectedUnitType, budgetValue]);

	const formatCurrency = (value) => {
		if (value >= 100000) return `SGD $${(value / 1000).toFixed(0)}k+`;
		return `SGD $${(value / 1000).toFixed(0)}k`;
	};

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
						<Button key={type} onClick={() => setSelectedPropertyType(type)}
							bg={selectedPropertyType === type ? "#D4AF37" : "white"}
							color={selectedPropertyType === type ? "white" : "black"}
							border="2px solid #D4AF37" borderRadius="md" px={12} py={6}
							fontSize="md" fontWeight="500" minW="150px"
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
						<Button key={type} onClick={() => setSelectedUnitType(type)}
							bg={selectedUnitType === type ? "#D4AF37" : "white"}
							color={selectedUnitType === type ? "white" : "black"}
							border="2px solid #D4AF37" borderRadius="md" px={8}
							py={6} fontSize="md" fontWeight="500" minW="120px"
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

			{/* Budget Range Slider */}
			<Box>
				<Text fontSize="2xl" fontWeight="600" mb={4} textAlign="center">
					What's your estimated budget range?
				</Text>
				
				<Box px={8}>
					{/* Display Selected Range */}
					<Flex justify="center" mb={6}>
						<Box 
							bg="#D4AF37" 
							color="white" 
							px={8} 
							py={4} 
							borderRadius="full"
							fontSize="xl"
							fontWeight="700"
							boxShadow="md"
						>
							{formatCurrency(budgetValue[0])} - {formatCurrency(budgetValue[1])}
						</Box>
					</Flex>

					{/* Range Slider */}
					<Slider.Root
						min={MIN_BUDGET}
						max={MAX_BUDGET}
						step={STEP}
						value={budgetValue}
						onValueChange={(e) => setBudgetValue(e.value)}
						colorPalette="yellow"
					>
						<Slider.Label srOnly>Budget Range</Slider.Label>
						<Slider.Control>
							<Slider.Track>
								<Slider.Range />
							</Slider.Track>
							<Slider.Thumb index={0} />
							<Slider.Thumb index={1} />
						</Slider.Control>
					</Slider.Root>

					{/* Min/Max Labels */}
					<Flex justify="space-between" mt={2} px={2}>
						<Text fontSize="sm" color="gray.600">
							{formatCurrency(MIN_BUDGET)}
						</Text>
						<Text fontSize="sm" color="gray.600">
							{formatCurrency(MAX_BUDGET)}+
						</Text>
					</Flex>

					{/* Helper Text */}
					<Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
						💡 Drag the sliders to set your minimum and maximum budget
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

export default PropertyPreferences;