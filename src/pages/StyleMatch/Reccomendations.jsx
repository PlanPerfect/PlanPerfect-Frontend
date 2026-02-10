import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Flex, Box, Text, Heading, Image, Badge, Button, HStack, VStack, Icon, SimpleGrid, Carousel, IconButton, Spinner } from "@chakra-ui/react";
import { LuSparkles, LuSofa, LuShoppingCart, LuHeart, LuChevronLeft, LuChevronRight, LuCheck, LuX, LuPackageSearch } from "react-icons/lu";
import { motion } from "framer-motion";
import { useAuth } from "@/Contexts/AuthContext";
import { useRecommendations } from "@/contexts/RecommendationsContext";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";
import server from "../../../networking";
import ShowToast from "@/Extensions/ShowToast";

function Recommendations() {
	const { user } = useAuth();
	const location = useLocation();
	const { style, furnitures } = location.state || {};
	const [uniqueFurniture, setUniqueFurniture] = useState([]);
	const [furnitureCounts, setFurnitureCounts] = useState({});
	const [recommendations, setRecommendations] = useState([]);
	const [loadingRecs, setLoadingRecs] = useState(false);
	const [selectedFurniture, setSelectedFurniture] = useState(null);
	const [savedRecommendations, setSavedRecommendations] = useState([]);
	const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
	const [removingRecId, setRemovingRecId] = useState(null);
	const [savingRecId, setSavingRecId] = useState(null);
	const [isInitialMount, setIsInitialMount] = useState(true);
	const navigate = useNavigate();
	const { setHasRecommendations, setSavedRecommendationsCount } = useRecommendations();

	// Reset context when component unmounts
	useEffect(() => {
		return () => {
			setHasRecommendations(false);
			setSavedRecommendationsCount(0);
		};
	}, [setHasRecommendations, setSavedRecommendationsCount]);

	// Update context when savedRecommendations changes
	useEffect(() => {
		setSavedRecommendationsCount(savedRecommendations.length);
	}, [savedRecommendations, setSavedRecommendationsCount]);

	useEffect(() => {
		setIsInitialMount(false);
		fetchSavedRecommendations();
	}, []);

	useEffect(() => {
		if (furnitures && furnitures.length > 0) {
			const counts = furnitures.reduce((acc, item) => {
				acc[item.name] = (acc[item.name] || 0) + 1;
				return acc;
			}, {});

			setFurnitureCounts(counts);
			setUniqueFurniture(Object.keys(counts));
		}
	}, [furnitures]);

	useEffect(() => {
		if (isInitialMount) return;

		if (!furnitures || furnitures.length === 0 || !style) {
			ShowToast("info", "Please upload an image for processing before using this search feature.", "", {
				persistent: true,
				action: {
					label: "Go Back",
					onClick: () => navigate("/stylematch")
				}
			});
		}
	}, [furnitures, style, navigate, isInitialMount]);

	const fetchSavedRecommendations = async () => {
		try {
			const response = await server.get("/stylematch/recommendations/get-saved-recommendations", {
				headers: {
					"Content-Type": "multipart/form-data",
					"X-User-ID": user.uid
				}
			});
			if (response.data && response.data.recommendations) {
				setSavedRecommendations(response.data.recommendations);
			}
		} catch (err) {
			console.error("Failed to fetch saved recommendations:", err);
		}
	};

	const getMatchBadge = matchPercentage => {
		if (matchPercentage >= 90) {
			return { text: "Perfect match", colorPalette: "green" };
		} else if (matchPercentage >= 75) {
			return { text: "Great match", colorPalette: "blue" };
		} else if (matchPercentage >= 50) {
			return { text: "Good match", colorPalette: "teal" };
		} else {
			return { text: "Decent match", colorPalette: "gray" };
		}
	};

	const fetchRecommendations = async furnitureName => {
		setLoadingRecs(true);
		setSelectedFurniture(furnitureName);

		const fetchPromise = new Promise(async (resolve, reject) => {
			try {
				const response = await server.post("/stylematch/recommendations/get-recommendations", {
					style: style || "Modern",
					furniture_name: furnitureName,
					per_page: 5
				}, {
					headers: {
						"Content-Type": "application/json",
						"X-User-ID": user.uid
					}
				});

				if (response.data && response.data.recommendations) {
					const recs = response.data.recommendations.map((rec, index) => ({
						id: rec.image,
						...rec
					}));
					setRecommendations(recs);
					setHasRecommendations(true);
					setCurrentCarouselIndex(0);
					resolve(response.data);
				}
			} catch (err) {
				const backendError = err.response?.data?.error || err.response?.data?.detail;

				if (backendError) {
					reject(new Error(backendError));
				} else {
					console.error("Failed to fetch recommendations:", err);
					reject(err);
				}
			} finally {
				setLoadingRecs(false);
			}
		});

		ShowToast(null, null, null, {
			promise: fetchPromise,
			loading: {
				title: "Finding recommendations..."
			},
			success: {
				title: "Recommendations found!"
			},
			error: error => {
				let errorTitle = "Failed to fetch recommendations";

				if (error.message === "NO_RECOMMENDATIONS_FOUND") {
					errorTitle = "No Recommendations Found";
				} else if (error.message?.startsWith("UERROR: ")) {
					errorTitle = error.message.substring("UERROR: ".length);
				} else if (error.message?.startsWith("ERROR: ")) {
					errorTitle = error.message.substring("ERROR: ".length);
				} else if (error.message) {
					errorTitle = error.message;
				}

				return {
					title: errorTitle
				};
			}
		});
	};

	const fetchSingleRecommendation = async furnitureName => {
		try {
			const randomPage = Math.floor(Math.random() * 10) + 1;
			const response = await server.post("/stylematch/recommendations/get-recommendations", {
				style: style || "Modern",
				furniture_name: furnitureName,
				per_page: 1,
				page: randomPage
			}, {
				headers: {
					"Content-Type": "application/json",
					"X-User-ID": user.uid
				}
			});

			if (response.data.recommendations && response.data.recommendations.length > 0) {
				const rec = response.data.recommendations[0];
				return {
					id: rec.image,
					...rec
				};
			}
			return null;
		} catch (err) {
			console.error("Error fetching single recommendation:", err);

			const backendError = err.response?.data?.error || err.response?.data?.detail;

			if (backendError) {
				let errorMessage = "Too many requests. Please try again later";

				if (backendError.startsWith("UERROR: ")) {
					errorMessage = backendError.substring("UERROR: ".length);
				} else if (backendError.startsWith("ERROR: ")) {
					errorMessage = backendError.substring("ERROR: ".length);
				} else {
					errorMessage = backendError;
				}

				ShowToast("error", errorMessage);
			}

			return null;
		}
	};

	const handleNotRelevant = async (recId, index) => {
		setRemovingRecId(recId);

		if (isRecommendationSaved(recId)) {
			await handleUnsaveRecommendation(recId, true);
		}

		try {
			const newRec = await fetchSingleRecommendation(selectedFurniture);

			const updatedRecs = recommendations.filter(rec => rec.id !== recId);

			if (newRec) {
				setRecommendations([...updatedRecs, newRec]);
				ShowToast("success", "Recommendation replaced");
			} else {
				setRecommendations(updatedRecs);
				ShowToast("info", "Recommendation removed");
			}

			if (index < updatedRecs.length) {
				setCurrentCarouselIndex(index);
			} else if (updatedRecs.length > 0) {
				setCurrentCarouselIndex(updatedRecs.length - 1);
			} else {
				setCurrentCarouselIndex(0);
			}
		} finally {
			setRemovingRecId(null);
		}
	};

	const handleSaveRecommendation = async rec => {
		setSavingRecId(rec.id);

		try {
			const response = await server.post(
				"/stylematch/recommendations/save-recommendation",
				{
					name: rec.name,
					image: rec.image,
					description: rec.description,
					match: rec.match
				},
				{
					headers: {
						"X-User-ID": user.uid
					}
				}
			);

			if (response.status === 200) {
				setSavedRecommendations(prev => [...prev, { id: rec.id, ...rec }]);
				ShowToast("success", "Recommendation saved!");
			}
		} catch (err) {
			const backendError = err.response?.data?.error;

			if (err.response?.status === 409) {
				ShowToast("info", "This recommendation is already saved");
			} else {
				let errorMessage = "Failed to save recommendation";

				if (backendError?.startsWith("UERROR: ")) {
					errorMessage = backendError.substring("UERROR: ".length);
				} else if (backendError) {
					errorMessage = backendError;
				}

				ShowToast("error", errorMessage);
			}
		} finally {
			setSavingRecId(null);
		}
	};

	const handleUnsaveRecommendation = async (recId, skipToast = false) => {
		setSavingRecId(recId);

		try {
			const encodedRecId = encodeURIComponent(recId);
			const response = await server.delete(`/stylematch/recommendations/delete-recommendation/${encodedRecId}`, {
				headers: {
					"Content-Type": "multipart/form-data",
					"X-User-ID": user.uid
				}
			});

			if (response.status === 200) {
				setSavedRecommendations(prev => prev.filter(saved => saved.id !== recId));
				if (!skipToast) {
					ShowToast("success", "Recommendation unsaved!");
				}
			}
		} catch (err) {
			const backendError = err.response?.data?.error;
			let errorMessage = "Failed to remove recommendation";

			if (backendError?.startsWith("UERROR: ")) {
				errorMessage = backendError.substring("UERROR: ".length);
			} else if (backendError) {
				errorMessage = backendError;
			}

			if (!skipToast) {
				ShowToast("error", errorMessage);
			}
		} finally {
			setSavingRecId(null);
		}
	};

	const toggleSaveRecommendation = async rec => {
		const isAlreadySaved = isRecommendationSaved(rec.id);

		if (isAlreadySaved) {
			await handleUnsaveRecommendation(rec.id);
		} else {
			await handleSaveRecommendation(rec);
		}
	};

	const isRecommendationSaved = recId => {
		return savedRecommendations.some(saved => saved.id === recId);
	};

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	const MotionBox = motion.create(Box);
	const MotionCard = motion.create(Card.Root);
	const MotionFlex = motion.create(Flex);

	if (furnitures && furnitures.length > 0 && style) {
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
							<MotionBox initial={!isInitialMount && { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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

							<MotionBox initial={isInitialMount ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} flex={1} overflow="hidden" display="flex" flexDirection="column">
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
											msOverflowStyle: "none",
											scrollbarWidth: "none"
										}}
									>
										{uniqueFurniture.length > 0 ? (
											<SimpleGrid columns={2} spacing={4} gap={2}>
												{uniqueFurniture.map((furniture, index) => (
													<MotionBox
														key={furniture}
														initial={isInitialMount ? { opacity: 0, y: 20 } : false}
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
								msOverflowStyle: "none",
								scrollbarWidth: "none"
							}}
						>
							<Card.Body paddingTop={4} paddingBottom={5} px={4} height="100%">
								<VStack align="stretch" gap={2} height="100%">
									<Box flex="0 0 45%" display="flex" flexDirection="column" minHeight="0">
										<Carousel.Root slideCount={furnitures.length} display="flex" flexDirection="column" height="100%">
											<Box flex={1}>
												<Carousel.ItemGroup height="100%">
													{furnitures.map((item, index) => (
														<Carousel.Item key={`${item.id}-${index}`} index={index} height="100%">
															<MotionCard
																flexDirection="row"
																overflow="hidden"
																height="100%"
																bg="rgba(255, 255, 255, 0.95)"
																borderRadius={20}
																initial={isInitialMount ? { opacity: 0, y: 20 } : false}
																animate={{ opacity: 1, scale: 1, y: 0 }}
																transition={{ duration: 0.4, ease: "easeOut" }}
															>
																<Box position="relative" minWidth={"240px"} maxWidth={"240px"} minHeight="170px" maxHeight="170px">
																	<Image objectFit="cover" width="100%" height="100%" src={furnitures[index].image} alt={furnitures[index].name} />
																</Box>
																<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
																	<Card.Body py={3} px={4}>
																		<Card.Title fontSize="lg" mb={2}>
																			{furnitures[index].name}
																		</Card.Title>
																		<Card.Description fontSize="sm">StyleMatch is {furnitures[index].confidence} confident of this prediction!</Card.Description>
																	</Card.Body>
																	<Card.Footer gap={2} pb={3} px={4}>
																		<Button
																			bgColor={"#D4AF37"}
																			borderRadius={6}
																			leftIcon={<LuShoppingCart />}
																			size="sm"
																			onClick={() => fetchRecommendations(furnitures[index].name)}
																			isLoading={loadingRecs}
																			disabled={selectedFurniture === furnitures[index].name}
																		>
																			{selectedFurniture === furnitures[index].name ? "Selected" : "Find Recommendations"}
																		</Button>
																	</Card.Footer>
																</Box>
															</MotionCard>
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

									<Box flex="0 0 45%" minHeight="0">
										{recommendations.length > 0 ? (
											<Carousel.Root slideCount={recommendations.length} index={currentCarouselIndex} onIndexChange={e => setCurrentCarouselIndex(e.index)} display="flex" flexDirection="column" height="100%">
												<Box flex={1}>
													<Carousel.ItemGroup height="100%">
														{recommendations.map((rec, index) => {
															const matchBadge = getMatchBadge(rec.match);
															const isSaved = isRecommendationSaved(rec.id);
															return (
																<Carousel.Item key={rec.id} index={index} height="100%">
																	<MotionCard
																		flexDirection="row"
																		overflow="hidden"
																		height="100%"
																		bg="rgba(255, 255, 255, 0.95)"
																		borderRadius={20}
																		initial={isInitialMount ? { opacity: 0, y: 20 } : false}
																		animate={{ opacity: 1, scale: 1, x: 0 }}
																		transition={{ duration: 0.4, ease: "easeOut" }}
																		position="relative"
																	>
																		<Badge colorPalette={matchBadge.colorPalette} position="absolute" top={2} right={2} zIndex={10} fontSize="xs" fontWeight="semibold" borderRadius={10}>
																			{matchBadge.text}
																		</Badge>
																		<Box position="relative" minWidth={"220px"} maxWidth="30%" minH={"180px"} maxHeight="180px">
																			<Image objectFit="cover" minWidth={"164px"} width="100%" minHeight={"171px"} height="100%" src={rec.image} alt={rec.name} />
																		</Box>
																		<Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
																			<Card.Body py={3} px={4}>
																				<Card.Title fontSize="lg" mb={2}>
																					{rec.name}
																				</Card.Title>
																				<Card.Description fontSize="sm">{rec.description}</Card.Description>
																			</Card.Body>
																			<Card.Footer gap={2} pb={3} px={4}>
																				<Button
																					bgColor={isSaved ? "#4CAF50" : "#D4AF37"}
																					borderRadius={6}
																					leftIcon={isSaved ? <LuCheck /> : <LuHeart />}
																					size="sm"
																					onClick={() => toggleSaveRecommendation(rec)}
																					disabled={savingRecId === rec.id}
																				>
																					{savingRecId === rec.id ? <Spinner size="sm" color="white" /> : isSaved ? "Saved" : "Save"}
																				</Button>
																				<Button bgColor="#FF6B6B" borderRadius={6} size="sm" onClick={() => handleNotRelevant(rec.id, index)} color="white" disabled={removingRecId === rec.id}>
																					{removingRecId === rec.id ? (
																						<Spinner size="sm" color="white" />
																					) : (
																						<>
																							<Icon as={LuX} mr={1} />
																							Not Relevant
																						</>
																					)}
																				</Button>
																			</Card.Footer>
																		</Box>
																	</MotionCard>
																</Carousel.Item>
															);
														})}
													</Carousel.ItemGroup>
												</Box>

												<Carousel.Control justifyContent="center" gap={4} mt={2}>
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
										) : loadingRecs ? (
											<Flex height="100%" align="center" justify="center" bg="rgba(255, 255, 255, 0.95)" borderRadius={20} mt={7}>
												<VStack gap={3}>
													<Spinner size="xl" color="#D4AF37" thickness="4px" />
													<Text color="gray.600" fontSize="lg" fontWeight="medium">
														Finding perfect matches...
													</Text>
												</VStack>
											</Flex>
										) : (
											<MotionFlex
												height="100%"
												align="center"
												justify="center"
												bg="rgba(255, 255, 255, 0.95)"
												borderRadius={20}
												mt={7}
												initial={!isInitialMount && { opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.5, ease: "easeOut" }}
												position="relative"
												overflow="hidden"
											>
												<Box
													position="absolute"
													top="50%"
													left="50%"
													transform="translate(-50%, -50%)"
													width="300px"
													height="300px"
													borderRadius="full"
													bg="radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0) 70%)"
													animation="pulse 3s ease-in-out infinite"
													css={{
														"@keyframes pulse": {
															"0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: 0.5 },
															"50%": { transform: "translate(-50%, -50%) scale(1.2)", opacity: 0.3 }
														}
													}}
												/>
												<VStack gap={4} zIndex={1}>
													<MotionBox
														initial={{ rotate: 0 }}
														animate={{ rotate: [0, 10, -10, 0] }}
														transition={{
															duration: 2,
															repeat: Infinity,
															ease: "easeInOut"
														}}
													>
														<Icon as={LuPackageSearch} boxSize={16} color="#D4AF37" />
													</MotionBox>
													<VStack gap={1}>
														<Text color="gray.700" fontSize="xl" fontWeight="bold">
															Ready to Explore?
														</Text>
														<Text color="gray.500" fontSize="sm" textAlign="center" maxW="300px">
															Select a furniture item above to discover perfectly matched recommendations
														</Text>
													</VStack>
												</VStack>
											</MotionFlex>
										)}
									</Box>
								</VStack>
							</Card.Body>
						</Card.Root>
					</Flex>
				</Flex>
				<style>
					{`
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
				</style>
			</>
		);
	} else {
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
			</>
		);
	}
}

export default Recommendations;
