import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Image, IconButton, Input, Grid } from "@chakra-ui/react";
import { IoBed, IoRestaurant, IoWater } from "react-icons/io5";
import { IoIosTv } from "react-icons/io";
import { MdBalcony, MdKitchen } from "react-icons/md";
import { FaPlus, FaMinus } from "react-icons/fa";

function CheckResult({ extractionResults }) {
	const [roomCounts, setRoomCounts] = useState({
		bedroom: 2,
		bathroom: 1,
		ledge: 1,
		kitchen: 1,
		livingRoom: 1,
		balcony: 0,
	});

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
	}, [extractionResults]);

	const handleIncrement = (room) => {
		setRoomCounts((prev) => ({
			...prev,
			[room]: Math.min(10, prev[room] + 1),
		}));
	};

	const handleDecrement = (room) => {
		setRoomCounts((prev) => ({
			...prev,
			[room]: Math.max(0, prev[room] - 1),
		}));
	};

	const handleInputChange = (room, value) => {
		const numValue = parseInt(value) || 0;
		setRoomCounts((prev) => ({
			...prev,
			[room]: Math.min(10, Math.max(0, numValue)),
		}));
	};

	// Extract image URL from results
	const imageUrl = extractionResults?.segmentedImage || null;

	// Extract unit information
	const unitRooms = extractionResults?.unitInfo?.unit_rooms || "2-Bedroom";
	const unitType = extractionResults?.unitInfo?.unit_types?.[0] || "Type B2";
	const unitSize = extractionResults?.unitInfo?.unit_sizes?.[0] || "55 sq m";

	const rooms = [
		{ key: "bedroom", label: "Bedroom", icon: IoBed },
		{ key: "bathroom", label: "Bathroom", icon: IoWater },
		{ key: "ledge", label: "Ledge", icon: IoRestaurant },
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
						placeholder={unitRooms}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
					/>
				</Box>

				<Box>
					<Flex align="center" gap={2} mb={2}>
						<Text fontWeight="600" fontSize="lg">
							🏢 Unit Type
						</Text>
					</Flex>
					<Input
						placeholder={unitType}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
					/>
				</Box>

				<Box>
					<Flex align="center" gap={2} mb={2}>
						<Text fontWeight="600" fontSize="lg">
							📐 Unit Size
						</Text>
					</Flex>
					<Input
						placeholder={unitSize}
						bg="white"
						border="2px solid #D4AF37"
						borderRadius="md"
						size="lg"
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
