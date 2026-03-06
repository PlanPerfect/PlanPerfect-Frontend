import { Box, Flex, Grid, Heading, IconButton, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const FURNITURE_BY_ROOM = {
	bedroom: {
		label: "Bedroom",
		icon: "🛏️",
		items: [
			{ id: "queen_bed", label: "Queen-size Bed" },
			{ id: "wardrobe", label: "Wardrobe" },
			{ id: "study_table", label: "Study Table" },
			{ id: "study_chair", label: "Chair" },
			{ id: "bedside_table", label: "Bedside Table" },
		],
		defaultCounts: (roomCount) => ({
			queen_bed: roomCount,
			wardrobe: roomCount,
			study_table: 1,
			study_chair: roomCount,
			bedside_table: roomCount,
		}),
	},
	livingRoom: {
		label: "Living Room",
		icon: "🛋️",
		items: [
			{ id: "sofa", label: "Sofa" },
			{ id: "coffee_table", label: "Coffee Table" },
			{ id: "tv_stand", label: "TV Stand" },
			{ id: "armchair", label: "Armchair" },
			{ id: "side_table", label: "Side Table" },
		],
		defaultCounts: () => ({
			sofa: 1,
			coffee_table: 1,
			tv_stand: 1,
			armchair: 2,
			side_table: 2,
		}),
	},
	kitchen: {
		label: "Kitchen / Dining",
		icon: "🍽️",
		items: [
			{ id: "dining_table", label: "Dining Table" },
			{ id: "dining_chair", label: "Dining Chair" },
		],
		defaultCounts: () => ({
			dining_table: 1,
			dining_chair: 4,
		}),
	},
	balcony: {
		label: "Balcony",
		icon: "🌿",
		items: [
			{ id: "outdoor_chair", label: "Outdoor Chair" },
			{ id: "outdoor_table", label: "Outdoor Table" },
		],
		defaultCounts: () => ({
			outdoor_chair: 2,
			outdoor_table: 1,
		}),
	},
};

function FurnitureSelection({ extractionResults, onFurnitureChange }) {
	const roomCounts = extractionResults?.unitInfo?.room_counts || {};

	const bedroomCount = roomCounts.BEDROOM || 0;
	const livingRoomCount = roomCounts.LIVING || 0;
	const kitchenCount = roomCounts.KITCHEN || 0;
	const balconyCount = roomCounts.BALCONY || 0;

	const availableRooms = [];
	if (bedroomCount > 0) availableRooms.push({ key: "bedroom", count: bedroomCount });
	if (livingRoomCount > 0) availableRooms.push({ key: "livingRoom", count: livingRoomCount });
	if (kitchenCount > 0) availableRooms.push({ key: "kitchen", count: kitchenCount });
	if (balconyCount > 0) availableRooms.push({ key: "balcony", count: balconyCount });

	const buildDefaultSelections = () => {
		const selections = {};
		for (const { key, count } of availableRooms) {
			const roomDef = FURNITURE_BY_ROOM[key];
			const defaults = roomDef.defaultCounts(count);
			for (const item of roomDef.items) {
				selections[item.id] = {
					selected: true,
					quantity: defaults[item.id] ?? 1,
					label: item.label,
				};
			}
		}
		return selections;
	};

	const [selections, setSelections] = useState(buildDefaultSelections);

	useEffect(() => {
		if (!onFurnitureChange) return;
		const furnitureList = [];
		const furnitureCounts = {};
		for (const [, val] of Object.entries(selections)) {
			if (val.selected) {
				furnitureList.push(val.label);
				furnitureCounts[val.label] = val.quantity;
			}
		}
		onFurnitureChange({ furnitureList, furnitureCounts });
	}, [selections]);

	const toggleItem = (itemId) => {
		setSelections((prev) => ({
			...prev,
			[itemId]: { ...prev[itemId], selected: !prev[itemId].selected },
		}));
	};

	const adjustQuantity = (itemId, delta) => {
		setSelections((prev) => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				quantity: Math.max(1, Math.min(20, prev[itemId].quantity + delta)),
			},
		}));
	};

	if (availableRooms.length === 0) {
		return (
			<Box w="100%" py={12} textAlign="center">
				<Text fontSize="4xl" mb={4}>🪑</Text>
				<Heading size="lg" mb={2}>No Rooms Detected</Heading>
				<Text color="gray.500" fontSize="sm">
					Please go back to Check Details and verify your room counts.
				</Text>
			</Box>
		);
	}

	return (
		<Box w="100%" py={6}>
			<Heading size="xl" textAlign="center" mb={2}>
				Choose Your Furniture
			</Heading>
			<Text textAlign="center" color="gray.600" mb={8} fontSize="sm">
				Select furniture for your floor plan. Quantities are pre-filled based on your room counts — adjust as needed.
			</Text>

			<Flex direction="column" gap={10}>
				{availableRooms.map(({ key, count }) => {
					const roomDef = FURNITURE_BY_ROOM[key];
					return (
						<Box key={key}>
							<Flex align="center" gap={2} mb={4}>
								<Text fontSize="2xl">{roomDef.icon}</Text>
								<Heading size="md">{roomDef.label}</Heading>
								<Text fontSize="sm" color="gray.400">
									({count} {count === 1 ? "room" : "rooms"})
								</Text>
							</Flex>

							<Grid templateColumns="repeat(3, 1fr)" gap={4}>
								{roomDef.items.map((item) => {
									const sel = selections[item.id];
									if (!sel) return null;

									return (
										<Box
											key={item.id}
											border="2px solid"
											borderColor={sel.selected ? "#D4AF37" : "gray.200"}
											borderRadius="lg"
											p={4}
											bg={sel.selected ? "#FFFDF0" : "white"}
											transition="all 0.2s"
											cursor="pointer"
											onClick={() => toggleItem(item.id)}
										>
											<Flex justify="space-between" align="center" mb={sel.selected ? 3 : 0}>
												<Text fontWeight="600" fontSize="sm">
													{item.label}
												</Text>
												<Box
													w="20px"
													h="20px"
													borderRadius="4px"
													border="2px solid"
													borderColor={sel.selected ? "#D4AF37" : "gray.400"}
													bg={sel.selected ? "#D4AF37" : "white"}
													display="flex"
													alignItems="center"
													justifyContent="center"
													flexShrink={0}
												>
													{sel.selected && (
														<Text color="white" fontSize="xs" fontWeight="bold" lineHeight="1">
															✓
														</Text>
													)}
												</Box>
											</Flex>

											{sel.selected && (
												<Flex
													align="center"
													justify="space-between"
													bg="white"
													border="1px solid #D4AF37"
													borderRadius="md"
													px={3}
													py={1}
													onClick={(e) => e.stopPropagation()}
												>
													<IconButton
														size="xs"
														variant="ghost"
														aria-label={`Decrease ${item.label}`}
														disabled={sel.quantity <= 1}
														opacity={sel.quantity <= 1 ? 0.4 : 1}
														cursor={sel.quantity <= 1 ? "not-allowed" : "pointer"}
														_hover={sel.quantity <= 1 ? {} : { bg: "#F4E5B2" }}
														onClick={() => adjustQuantity(item.id, -1)}
													>
														<FaMinus />
													</IconButton>
													<Text fontWeight="600" fontSize="sm" minW="24px" textAlign="center">
														{sel.quantity}
													</Text>
													<IconButton
														size="xs"
														variant="ghost"
														aria-label={`Increase ${item.label}`}
														disabled={sel.quantity >= 20}
														opacity={sel.quantity >= 20 ? 0.4 : 1}
														cursor={sel.quantity >= 20 ? "not-allowed" : "pointer"}
														_hover={sel.quantity >= 20 ? {} : { bg: "#F4E5B2" }}
														onClick={() => adjustQuantity(item.id, 1)}
													>
														<FaPlus />
													</IconButton>
												</Flex>
											)}
										</Box>
									);
								})}
							</Grid>
						</Box>
					);
				})}
			</Flex>
		</Box>
	);
}

export default FurnitureSelection;
