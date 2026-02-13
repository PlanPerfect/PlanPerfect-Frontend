import { Box, Flex, Heading, Text, Button, Slider, InputGroup, NumberInput, Switch } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { LuDollarSign } from "react-icons/lu";

const designThemes = [
	{ id: 1, name: "Boutique", icon: "👗", color: "#FFB6C1" },
	{ id: 2, name: "Classical", icon: "🏛️", color: "#87CEEB" },
	{ id: 3, name: "Contemporary", icon: "🏢", color: "#F4E5B2" },
	{ id: 4, name: "Country", icon: "🌳", color: "#90EE90" },
	{ id: 5, name: "Electic", icon: "💡", color: "#ADD8E6" },
	{ id: 6, name: "Industrial", icon: "⚙️", color: "#D3D3D3" },
	{ id: 7, name: "Japanese", icon: "🌸", color: "#FFE4B5" },
	{ id: 8, name: "Luxury", icon: "💎", color: "#FFD700" },
	{ id: 9, name: "Minimalist", icon: "🔶", color: "#FFA07A" },
	{ id: 10, name: "Modern", icon: "📊", color: "#E0E0E0" },
	{ id: 11, name: "Persian", icon: "🧿", color: "#FFE4B5" },
	{ id: 12, name: "Scandinavian", icon: "🪵", color: "#F5DEB3" },
	{ id: 13, name: "Vintage", icon: "💗", color: "#FFC0CB" },
	{ id: 14, name: "Wabi Sabi", icon: "⏳", color: "#E6D5B8" },
	{ id: 15, name: "Japandi", icon: "🏯", color: "#FFE4B5" },
	{ id: 16, name: "Peranakan", icon: "🏛️", color: "#98D8C8" },
];

function PreferenceBudget({ onPreferenceChange, onBudgetChange }) {
	const [selectedThemes, setSelectedThemes] = useState([]);
	const [budget, setBudget] = useState(75000);
	const [isCustomBudget, setIsCustomBudget] = useState(false);
	const [customBudgetInput, setCustomBudgetInput] = useState("");
	const maxBudget = 150000;

	// Handle preferences change
	useEffect(() => {
		if (onPreferenceChange) {
			const selectedThemeObjects = designThemes.filter(theme => 
				selectedThemes.includes(theme.id)
			);
			
			const preferencesData = {
				style: selectedThemeObjects.map(t => t.name).join(" & ") || "Not selected"
			};
			
			onPreferenceChange(preferencesData);
		}
	}, [selectedThemes, onPreferenceChange]);

	// Handle budget changes
	useEffect(() => {
		if (onBudgetChange) {
			onBudgetChange(formatCurrency(budget));
		}
	}, [budget, onBudgetChange]);

	const handleThemeSelect = (themeId) => {
		if (selectedThemes.includes(themeId)) {
			setSelectedThemes(selectedThemes.filter((id) => id !== themeId));
		} else if (selectedThemes.length < 2) {
			setSelectedThemes([...selectedThemes, themeId]);
		}
	};

	const formatCurrency = (value) => {
		if (value >= 1_000_000) {
		  return `$${(value / 1_000_000).toFixed(1)}M`;
		}
	  
		if (value >= 1_000) {
		  return `$${(value / 1_000).toFixed(0)}k`;
		}
	  
		return `$${value}`;
	};	  

	const handleCustomBudgetToggle = (checked) => {
		setIsCustomBudget(checked);
		if (checked) {
			setCustomBudgetInput(budget.toString());
		} else {
			if (budget > maxBudget) {
				setBudget(maxBudget);
			}
		}
	};

	const MIN_BUDGET = 0;
	const MAX_BUDGET = 1_000_000;

	const clamp = (value, min, max) =>
		Math.min(Math.max(value, min), max);
	  
	const commitCustomBudget = (value) => {
		const num = Number(value);
	  
		if (isNaN(num)) return;
	  
		const clamped = clamp(num, MIN_BUDGET, MAX_BUDGET);
	  
		setBudget(clamped);
		setCustomBudgetInput(clamped.toString());
	};

	return (
		<Box w="100%" maxW="800px" mx="auto" py={10}>
			{/* Design Theme Preference Section */}
			<Box mb={12}>
				<Heading size="2xl" textAlign="center" mb={2}>
					What is your design theme preference?
				</Heading>
				<Text textAlign="center" color="gray.600" mb={6} fontSize="sm">
					You can choose up to maximum 2 choices.
				</Text>

				<Flex flexWrap="wrap" gap={4} justify="center">
					{designThemes.map((theme) => {
						const isSelected = selectedThemes.includes(theme.id);
						const isDisabled =
							!isSelected && selectedThemes.length >= 2;

						return (
							<Button
								key={theme.id}
								onClick={() => handleThemeSelect(theme.id)}
								bg={isSelected ? theme.color : "white"}
								border="2px solid"
								borderColor="#D4AF37"
								borderRadius="10px"
								px={6}
								py={6}
								h="auto"
								fontSize="md"
								fontWeight="500"
								opacity={isDisabled ? 0.4 : 1}
								cursor={isDisabled ? "not-allowed" : "pointer"}
								_hover={{
									bg: isDisabled ? "white" : theme.color,
									transform: isDisabled
										? "none"
										: "translateY(-2px)",
									boxShadow: isDisabled ? "none" : "md",
								}}
								transition="all 0.2s"
								disabled={isDisabled}
								display="flex"
								alignItems="center"
								gap={2}
							>
								<Text fontSize="20px">{theme.icon}</Text>
								<Text>{theme.name}</Text>
							</Button>
						);
					})}
				</Flex>
			</Box>

			{/* Budget Section */}
			<Box>
				<Heading size="2xl" textAlign="center" mb={8}>
					What's your renovation budget?
				</Heading>

				<Flex direction="column" align="center" gap={6}>
					{/* Budget Display Bubble */}
					<Box
						bg="#F4E5B2"
						borderRadius="10px"
						px={6}
						py={3}
						fontWeight="600"
						fontSize="lg"
					>
						{formatCurrency(budget)}
					</Box>

					{/* Conditional: Slider or Custom Input */}
					{!isCustomBudget ? (
						<>
							{/* Slider */}
							<Box w="100%" maxW="500px">
								<Slider.Root
									value={[budget]}
									onValueChange={(e) => setBudget(e.value[0])}
									min={0}
									max={maxBudget}
									step={5000}
								>
									<Slider.Control>
										<Slider.Track bg="gray.200" h="8px">
											<Slider.Range bg="#D4AF37" />
										</Slider.Track>
										<Slider.Thumb
											index={0}
											bg="white"
											border="3px solid #D4AF37"
											w="20px"
											h="20px"
										/>
									</Slider.Control>
								</Slider.Root>
							</Box>

							{/* Budget Input Fields */}
							<Flex gap={4} align="center">
								<Box
									border="2px solid black"
									borderRadius="10px"
									px={6}
									py={3}
									bg="white"
									minW="120px"
									textAlign="center"
									fontWeight="500"
								>
									$0
								</Box>
								<Text fontWeight="600">–</Text>
								<Box
									border="2px solid black"
									borderRadius="10px"
									px={6}
									py={3}
									bg="white"
									minW="120px"
									textAlign="center"
									fontWeight="500"
								>
									{formatCurrency(maxBudget)}
								</Box>
							</Flex>
						</>
					) : (
						<>
							{/* Custom Budget Input */}
							<Box w="100%" maxW="400px">
								<Text fontSize="sm" color="black" mb={2} textAlign="center">
									Enter your budget amount
								</Text>
								<NumberInput.Root
									allowMouseWheel
									value={customBudgetInput}
									step={1000}
									min={MIN_BUDGET}
									max={MAX_BUDGET}
									border="2px solid #D4AF37" 
									borderRadius="10px"
									onValueChange={(e) => {
										// typing only -> no clamping
										setCustomBudgetInput(e.value);
										const num = Number(e.value);
										if (!isNaN(num)) {
											setBudget(num); // live bubble update
										}
									}}
									onValueCommit={(e) => {
										// blur / enter -> perform clamping
										commitCustomBudget(e.value);
									}}
									_focus={{
										borderColor: "#D4AF37",
										boxShadow: "0 0 0 3px rgba(212, 175, 55, 0.2)"
									}}
								>
									<InputGroup startElement={<LuDollarSign />} endElement={
										<NumberInput.Control border={"none"}>
											<NumberInput.IncrementTrigger borderTopRightRadius={6} />
											<NumberInput.DecrementTrigger borderBottomRightRadius={6} border={"none"} mb={0.2}/>
										</NumberInput.Control>
									}>
										<NumberInput.Input fontWeight="500" fontSize="lg" border="none" textAlign="center" />
									</InputGroup>
								</NumberInput.Root>
							</Box>
							<Text fontSize="xs" color="gray.500" textAlign="center" maxW="400px">
								💡 Tip: For $250,000 enter "250000"
							</Text>
						</>
					)}
					
					{/* Custom Budget Toggle */}
					<Flex align="center" gap={3}>
						<Switch.Root
							checked={isCustomBudget}
							onCheckedChange={(e) => handleCustomBudgetToggle(e.checked)}
						>
							
							<Switch.HiddenInput />
							<Switch.Control />
							<Switch.Label fontSize="sm" fontWeight="500" color="gray.700">
								Budget over $150k? Enter custom amount
							</Switch.Label>
						</Switch.Root>
					</Flex>
				</Flex>
			</Box>
		</Box>
	);
}

export default PreferenceBudget;