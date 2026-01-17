import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Flex, Box, Text, Heading, Image, Badge, Button, HStack, VStack, Icon, SimpleGrid, Carousel, IconButton } from "@chakra-ui/react";
import { LuSparkles, LuSofa, LuShoppingCart, LuHeart, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { motion } from "framer-motion";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";

function Recommendations() {
	const location = useLocation();
	const { style, furnitures } = location.state || {};
	const [uniqueFurniture, setUniqueFurniture] = useState([]);
	const [furnitureCounts, setFurnitureCounts] = useState({});
	const [recommendations, setRecommendations] = useState([]);

	useEffect(() => {
		if (furnitures && furnitures.length > 0) {
			const counts = furnitures.reduce((acc, item) => {
				acc[item.name] = (acc[item.name] || 0) + 1;
				return acc;
			}, {});

			setFurnitureCounts(counts);
			setUniqueFurniture(Object.keys(counts));

			const mockRecs = [
				{
					id: 1,
					name: "Modern Sectional Sofa",
					price: "$1,299",
					image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
					description: "Contemporary L-shaped sectional with premium fabric upholstery",
					match: 95
				},
				{
					id: 2,
					name: "Minimalist Coffee Table",
					price: "$399",
					image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80",
					description: "Sleek wooden coffee table with clean lines and storage",
					match: 92
				},
				{
					id: 3,
					name: "Designer Armchair",
					price: "$699",
					image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
					description: "Ergonomic mid-century modern accent chair",
					match: 88
				},
				{
					id: 4,
					name: "Floating Shelf Unit",
					price: "$249",
					image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80",
					description: "Wall-mounted shelving system with adjustable levels",
					match: 85
				}
			];
			setRecommendations(mockRecs);
		}
	}, [furnitures]);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	const MotionBox = motion.create(Box);

	return (
		<>
			<Box
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url(${StyleMatchBackground})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			<Flex height="75vh" gap={4}>
				{/* Left Panel - Style & Detected Furniture */}
				<Card.Root width="35%" variant="elevated" borderRadius={35} style={glassStyle} overflow="hidden">
					<Card.Body display="flex" flexDirection="column" gap={6} height="100%" overflow="hidden">
						<MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<VStack align="stretch" gap={3}>
								<Flex align="center" gap={2}>
									<Icon as={LuSparkles} boxSize={6} color="#fff0bd" />
									<Heading size="lg" color="white">
										Your Style
									</Heading>
								</Flex>
								<Box bg="rgba(255, 240, 189, 0.15)" borderRadius={20} padding={4} border="1px solid rgba(255, 240, 189, 0.3)">
									<Text fontSize="2xl" fontWeight="bold" color="#fff0bd" textAlign="center">
										{style || "Modern"}
									</Text>
								</Box>
							</VStack>
						</MotionBox>

						<Box height="1px" bg="rgba(255, 255, 255, 0.2)" />

						<MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} flex={1} overflow="hidden" display="flex" flexDirection="column">
							<VStack align="stretch" gap={3} height="100%" overflow="hidden">
								<Flex align="center" gap={2}>
									<Icon as={LuSofa} boxSize={6} color="white" />
									<Heading size="lg" color="white">
										Detected Items
									</Heading>
								</Flex>
								<VStack
									align="stretch"
									gap={2}
									flex={1}
									overflowY="auto"
									css={{
										"&::-webkit-scrollbar": { display: "none" },
										"-ms-overflow-style": "none",
										"scrollbar-width": "none"
									}}
								>
									{uniqueFurniture.length > 0 ? (
										<SimpleGrid columns={2} spacing={4} gap={2}>
											{uniqueFurniture.map((furniture, index) => (
												<MotionBox
													key={index}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: 0.1 * index }}
													bg="rgba(255, 255, 255, 0.08)"
													borderRadius={15}
													p={3}
													border="1px solid rgba(255, 255, 255, 0.15)"
													_hover={{
														bg: "rgba(255, 255, 255, 0.12)",
														transform: "translateX(5px)",
														transition: "all 0.2s"
													}}
												>
													<Flex align="center" gap={3}>
														<Box w={8} h={8} borderRadius="full" bg="rgba(255, 240, 189, 0.2)" display="flex" alignItems="center" justifyContent="center">
															<Text color="#fff0bd" fontWeight="bold">
																{furnitureCounts[furniture] || 0}
															</Text>
														</Box>
														<Text color="white" fontSize="md" fontWeight="medium">
															{furniture}
														</Text>
													</Flex>
												</MotionBox>
											))}
										</SimpleGrid>
									) : (
										<Text color="rgba(255, 255, 255, 0.6)" textAlign="center">
											No furniture detected
										</Text>
									)}
								</VStack>
							</VStack>
						</MotionBox>
					</Card.Body>
				</Card.Root>

				{/* Right Panel - Recommendations */}
				<Flex direction="column" width="65%" gap={3}>
					<Card.Root
						height="100%"
						variant="elevated"
						borderRadius={35}
						style={glassStyle}
						overflowY="auto"
						overflowX="hidden"
						css={{
							"&::-webkit-scrollbar": { display: "none" },
							"-ms-overflow-style": "none",
							"scrollbar-width": "none"
						}}
					>
						<Card.Body paddingTop={4} paddingBottom={5} px={4} height="100%">
							<VStack align="stretch" gap={2} height="100%">
								<Box flex={1} display="flex" flexDirection="column">
									<Carousel.Root slideCount={recommendations.length} display="flex" flexDirection="column" height="100%">
										<Box flex={1}>
											<Carousel.ItemGroup height="100%">
												{recommendations.map((item, index) => (
													<Carousel.Item key={item.id} index={index} height="100%">
														<Card.Root flexDirection="row" overflow="hidden" height="100%" bg="rgba(255, 255, 255, 0.95)" borderRadius={20}>
															<Box position="relative" width="40%">
																<Image objectFit="cover" width="100%" height="100%" src={recommendations[0].image} alt={recommendations[0].name} />
																<Badge position="absolute" top={3} left={3} colorScheme="green" fontSize="xs" padding={2} borderRadius={8}>
																	{recommendations[0].match}% Match
																</Badge>
															</Box>
															<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
																<Card.Body py={3} px={4}>
																	<Card.Title fontSize="lg" mb={2}>
																		{recommendations[0].name}
																	</Card.Title>
																	<Card.Description fontSize="sm">{recommendations[0].description}</Card.Description>
																</Card.Body>
																<Card.Footer gap={2} pb={3} px={4}>
																	<Button bgColor={"#D4AF37"} borderRadius={6} leftIcon={<LuShoppingCart />} size="sm">
																		Find Reccomendations
																	</Button>
																</Card.Footer>
															</Box>
														</Card.Root>
													</Carousel.Item>
												))}
											</Carousel.ItemGroup>
										</Box>

										<Carousel.Control justifyContent="center" gap={4}>
											<Carousel.PrevTrigger asChild>
												<IconButton size="sm" variant="outline" borderRadius="full">
													<LuChevronLeft />
												</IconButton>
											</Carousel.PrevTrigger>
											<Carousel.Indicators />
											<Carousel.NextTrigger asChild>
												<IconButton size="sm" variant="outline" borderRadius="full">
													<LuChevronRight />
												</IconButton>
											</Carousel.NextTrigger>
										</Carousel.Control>
									</Carousel.Root>
								</Box>

								<Box height="1px" bg="rgba(255, 255, 255, 0.2)" />

								<Box flex={1}>
									{recommendations[0] && (
										<Card.Root flexDirection="row" overflow="hidden" height="100%" bg="rgba(255, 255, 255, 0.95)" borderRadius={20} mt={1}>
											<Box position="relative" width="40%">
												<Image objectFit="cover" width="100%" height="100%" src={recommendations[0].image} alt={recommendations[0].name} />
												<Badge position="absolute" top={3} left={3} colorScheme="green" fontSize="xs" padding={2} borderRadius={8}>
													{recommendations[0].match}% Match
												</Badge>
											</Box>
											<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
												<Card.Body py={3} px={4}>
													<Card.Title fontSize="lg" mb={2}>
														{recommendations[0].name}
													</Card.Title>
													<Card.Description fontSize="sm">{recommendations[0].description}</Card.Description>
												</Card.Body>
												<Card.Footer gap={2} pb={3} px={4}>
													<Button bgColor={"#D4AF37"} borderRadius={6} leftIcon={<LuShoppingCart />} size="sm">
														Save
													</Button>
												</Card.Footer>
											</Box>
										</Card.Root>
									)}
								</Box>
							</VStack>
						</Card.Body>
					</Card.Root>
				</Flex>
			</Flex>
		</>
	);
}

export default Recommendations;
