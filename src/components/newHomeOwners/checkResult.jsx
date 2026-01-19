import { useState, useEffect, useRef } from "react";
import { Box, Flex, Heading, Text, Image, IconButton, Input, Grid } from "@chakra-ui/react";
import { IoBed } from "react-icons/io5";
import { IoIosTv } from "react-icons/io";
import { MdBalcony, MdKitchen, MdBathtub } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa";
import { GiFlatPlatform } from "react-icons/gi";

function CheckResult({ extractionResults, onUpdateExtractionResults }) {
	const [roomCounts, setRoomCounts] = useState({
		bedroom: 0,
		bathroom: 0,
		ledge: 0,
		kitchen: 0,
		livingRoom: 0,
		balcony: 0,
	});
	const [unitRooms, setUnitRooms] = useState(extractionResults?.unitInfo?.unit_rooms || "");
	const [unitType, setUnitType] = useState(extractionResults?.unitInfo?.unit_types || "");
	const [unitSize, setUnitSize] = useState(extractionResults?.unitInfo?.unit_sizes || "");
	const inputRef = useRef(null);

	// Initialize room counts from extraction results
	useEffect(() => {
		if (extractionResults?.unitInfo?.room_counts) {
			const counts = extractionResults.unitInfo.room_counts;
			setRoomCounts({
				bedroom: counts.BEDROOM || 0,
				bathroom: (counts.BATH || 0) + (counts.WC || 0),
				ledge: counts.LEDGE || 0,
				kitchen: counts.KITCHEN || 0,
				livingRoom: counts.LIVING || 0,
				balcony: counts.BALCONY || 0,
			});
		}
		if (extractionResults?.unitInfo) {
			setUnitRooms(extractionResults.unitInfo.unit_rooms || "");
			setUnitType(extractionResults.unitInfo.unit_types || "");
			setUnitSize(extractionResults.unitInfo.unit_sizes || "");
		}
	}, [extractionResults]);

	const handleIncrement = (room) => {
		updateRoomCounts((prev) => ({
			...prev,
			[room]: Math.min(10, prev[room] + 1),
		}));
	};

	const handleDecrement = (room) => {
		updateRoomCounts((prev) => ({
			...prev,
			[room]: Math.max(0, prev[room] - 1),
		}));
	};

	const handleInputChange = (room, value) => {
		const numValue = parseInt(value) || 0;
		updateRoomCounts((prev) => ({
			...prev,
			[room]: Math.min(10, Math.max(0, numValue)),
		}));
	};

	// Extract image URL from extraction results
	const imageUrl = extractionResults?.segmentedImage || null;

	const updateUnitInfo = (key, value) => {
		onUpdateExtractionResults((prev) => ({
		  ...prev,
		  unitInfo: {
			...prev.unitInfo,
			[key]: value,
		  },
		}));
	};

	const updateRoomCounts = (newCounts) => {
		setRoomCounts(newCounts);
	  
		onUpdateExtractionResults((prev) => ({
		  ...prev,
		  unitInfo: {
			...prev.unitInfo,
			room_counts: {
			  BEDROOM: newCounts.bedroom,
			  BATH: newCounts.bathroom,
			  LEDGE: newCounts.ledge,
			  KITCHEN: newCounts.kitchen,
			  LIVING: newCounts.livingRoom,
			  BALCONY: newCounts.balcony,
			},
		  },
		}));
	};	

	const rooms = [
		{ key: "bedroom", label: "Bedroom", icon: IoBed },
		{ key: "bathroom", label: "Bathroom", icon: MdBathtub },
		{ key: "ledge", label: "Ledge", icon: GiFlatPlatform },
		{ key: "kitchen", label: "Kitchen", icon: MdKitchen },
		{ key: "livingRoom", label: "Living Room", icon: IoIosTv },
		{ key: "balcony", label: "Balcony", icon: MdBalcony },
	];

	return (
		<Box w="100%" py={8}>
			{/* Floor Plan Image Section */}
			<Box
				position="relative"
				border="2px solid #D4AF37"
				borderRadius="12px"
				p={4}
				mb={8}
				bg="gray.50"
			>
				{imageUrl ? (
					<Flex direction="column" align="center" gap={4}>
						<Image
							src={imageUrl}
							alt="Extracted Floor Plan"
							maxH="400px"
							objectFit="contain"
							borderRadius="8px"
						/>
					</Flex>
				) : (
					<Box textAlign="center" py={20}>
						<Text color="gray.500">
							No extraction results available
						</Text>
					</Box>
				)}
			</Box>

			{/* Unit Information Section */}
			<Heading size="lg" mb={6} textAlign="center">
				Your Unit Information
			</Heading>

			{/* Unit Details */}
			<Grid templateColumns="repeat(3, 1fr)" gap={6} mb={8}>
				<Box>
					<Flex align="center" gap={2} mb={2}>
						<Text fontWeight="600" fontSize="lg">
							🏠 Unit
						</Text>
					</Flex>
					<Input
						ref={inputRef}
						value={unitRooms}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
						onChange={(e) => {
							setUnitRooms(e.currentTarget.value)
							updateUnitInfo("unit_rooms", [e.currentTarget.value]);
						}}
					/>
				</Box>

				<Box>
					<Flex align="center" gap={2} mb={2}>
						<Text fontWeight="600" fontSize="lg">
							🏢 Unit Type
						</Text>
					</Flex>
					<Input
						ref={inputRef}
						value={unitType}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
						onChange={(e) => {
							setUnitType(e.currentTarget.value)
							updateUnitInfo("unit_types", [e.currentTarget.value]);
						}}
					/>
				</Box>

				<Box>
					<Flex align="center" gap={2} mb={2}>
						<Text fontWeight="600" fontSize="lg">
							📐 Unit Size
						</Text>
					</Flex>
					<Input
						ref={inputRef}
						value={unitSize}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
						onChange={(e) => {
							setUnitSize(e.currentTarget.value)
							updateUnitInfo("unit_sizes", [e.currentTarget.value]);
						}}
					/>
				</Box>
			</Grid>

			{/* Room Counters */}
			<Grid templateColumns="repeat(3, 1fr)" gap={6}>
				{rooms.map(({ key, label, icon: Icon }) => (
					<Box key={key}>
						<Flex align="center" gap={2} mb={2}>
							<Icon size={20} />
							<Text fontWeight="600" fontSize="lg">
								{label}
							</Text>
						</Flex>
						<Flex
							align="center"
							justify="space-between"
							bg="white"
							border="2px solid #D4AF37"
							borderRadius="md"
							px={4}
							py={2}
						>
							<IconButton
								aria-label={`Decrease ${label}`}
								size="sm"
								onClick={() => handleDecrement(key)}
								isDisabled={roomCounts[key] === 0}
								opacity={roomCounts[key] === 0 ? 0.4 : 1}
								cursor={
									roomCounts[key] === 0
										? "not-allowed"
										: "pointer"
								}
								_hover={
									roomCounts[key] === 0
										? {}
										: { bg: "#F4E5B2" }
								}
							>
								<FaMinus />
							</IconButton>
							<Input
								value={roomCounts[key]}
								onChange={(e) =>
									handleInputChange(key, e.target.value)
								}
								textAlign="center"
								border="none"
								fontWeight="600"
								fontSize="lg"
								w="60px"
								_focus={{ boxShadow: "none" }}
							/>
							<IconButton
								aria-label={`Increase ${label}`}
								size="sm"
								onClick={() => handleIncrement(key)}
								isDisabled={roomCounts[key] === 10}
								opacity={roomCounts[key] === 10 ? 0.4 : 1}
								cursor={
									roomCounts[key] === 10
										? "not-allowed"
										: "pointer"
								}
								_hover={
									roomCounts[key] === 0
										? {}
										: { bg: "#F4E5B2" }
								}
							>
								<FaPlus />
							</IconButton>
						</Flex>
					</Box>
				))}
			</Grid>
		</Box>
	);
}

export default CheckResult;
