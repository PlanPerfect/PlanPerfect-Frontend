import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Flex, Heading, Text, Box, Image, Avatar, Grid, IconButton, Carousel, Icon, Popover, Portal } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { RxRocket } from "react-icons/rx";
import { motion } from "framer-motion";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";
import SampleStyleBackground from "../../assets/SampleStyleBackground.png";
import AnimatedLogo from "@/components/Homepage/AnimatedLogo";
import GetStartedButton from "@/components/Homepage/GetStartedButton";
import FindRecommendationsButton from "@/components/StyleMatch/FindReccomendationsButton";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

function GetStarted() {
	const [furnitureItems, setFurnitureItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [roomImage, setRoomImage] = useState(SampleStyleBackground);
	const [detectionSuccess, setDetectionSuccess] = useState(false);
	const styles = ["Boutique", "Classical", "Contemporary", "Country", "Eclectic", "Industrial", "Japanese", "Luxury", "Minimalist", "Modern", "Persian", "Scandinavian", "Vintage", "Wabi-Sabi", "Japandi", "Peranakan", "Boho"];
	const [roomStyle, setRoomStyle] = useState(() => {
		return styles[Math.floor(Math.random() * styles.length)];
	});
	const fileInputRef = useRef(null);
	const navigate = useNavigate();

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	const rocketVariants = {
		initial: { y: 0 },
		analyzing: {
			y: [-7, 7, -7],
			rotate: [0, 5, -5, 0],
			transition: {
				duration: 2.5,
				repeat: Infinity
			}
		}
	};

	const itemsPerPage = 6;
	const chunkedItems = [];
	for (let i = 0; i < furnitureItems.length; i += itemsPerPage) {
		chunkedItems.push(furnitureItems.slice(i, i + itemsPerPage));
	}

	const processImage = async file => {
		if (!file) {
			ShowToast("error", "No File Selected", "Please select an image file to analyze.");
			return;
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
		if (!validTypes.includes(file.type)) {
			ShowToast("error", "Invalid File Type", "Please upload a JPEG, PNG, WEBP, or AVIF image.");
			return;
		}

		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			ShowToast("error", "File Too Large", "Please upload an image smaller than 50MB.");
			return;
		}

		setIsLoading(true);
		setFurnitureItems([]);
		setDetectionSuccess(false);

		const imageUrl = URL.createObjectURL(file);
		setRoomImage(imageUrl);

		const detectionPromise = new Promise(async (resolve, reject) => {
			try {
				const formData = new FormData();
				formData.append("file", file);

				const { data } = await server.post("/stylematch/detection/detect-furniture", formData, {
					headers: {
						"Content-Type": "multipart/form-data"
					},
					timeout: 300000
				});

				if (data.success && data.images && data.images.length > 0) {
					const timestamp = data.images[0].timestamp;

					const items = data.images.map(item => {
						const baseUrl = server.defaults.baseURL?.replace(/\/$/, "") || "";
						const imagePath = `/static/predictions/furniture-detection/${timestamp}/${item.filename}`;
						const imageUrl = `${baseUrl}${imagePath}`;

						const capitalizedName = item.class
							? item.class
									.split(/[\s_-]+/)
									.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
									.join(" ")
							: "Unknown";

						return {
							name: capitalizedName,
							image: imageUrl,
							confidence: item.confidence
						};
					});

					setFurnitureItems(items);
					setDetectionSuccess(true);
					resolve(items);
				} else {
					setFurnitureItems([]);
					setDetectionSuccess(false);
					reject(new Error("NO_FURNITURE_DETECTED"));
				}
			} catch (error) {
				console.error("Detection error:", error);
				setFurnitureItems([]);
				setDetectionSuccess(false);
				reject(error);
			} finally {
				setIsLoading(false);
			}
		});

		ShowToast(null, null, null, {
			promise: detectionPromise,
			loading: {
				title: "Processing..."
			},
			success: items => ({
				title: `Successfully detected ${items.length} furniture item(s)`,
				duration: 4500
			}),
			error: error => {
				let errorTitle = "Detection Failed";
				let errorDescription = "An unexpected error occurred.";

				if (error.message === "NO_FURNITURE_DETECTED") {
					errorTitle = "No Furniture Detected";
					errorDescription = "We couldn't detect any furniture in this image. Try a different photo.";
				} else if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
					errorTitle = "Request Timeout";
					errorDescription = "Request timed out. Please try again with a smaller image.";
				} else if (error.response?.status === 504) {
					errorTitle = "Service Timeout";
					errorDescription = error.response?.data?.error || "Server timed out. Please try with a smaller image.";
				} else if (error.response?.status === 500) {
					errorTitle = "500 Internal Server Error";
					errorDescription = error.response?.data?.error || "A server error occurred. Please try again later.";
				} else if (error.response?.status === 401 || error.response?.status === 403) {
					errorTitle = "401 Unauthorized";
					errorDescription = "Access denied. Please check with your system administrator.";
				} else if (error.response?.status === 429) {
					errorTitle = "429 Too Many Requests";
					errorDescription = "You have hit the rate-limit. Please wait and try again later.";
				} else if (error.response?.status === 404) {
					errorTitle = "404 Not Found";
					errorDescription = "The requested resource was not found. Please try again.";
				} else if (error.response?.status === 400) {
					errorTitle = "400 Bad Request";
					errorDescription = "The server could not understand the request. Please try again with a different image.";
				} else if (error.response) {
					errorDescription = error.response.data?.error || error.message;
				} else if (error.request) {
					errorTitle = "Network Error";
					errorDescription = "Unable to connect to the server. Please check your internet connection.";
				}

				return {
					title: errorTitle,
					description: errorDescription
				};
			}
		});
	};

	const handleFileUpload = event => {
		const file = event.target.files?.[0];
		if (file) {
			processImage(file);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFindRecommendations = () => {
		navigate("/stylematch/reccomendations", {
			state: {
				style: roomStyle,
				furnitures: furnitureItems
			}
		});
	};

	const MotionCard = motion.create(Card.Root);
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

			<input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" style={{ display: "none" }} onChange={handleFileUpload} />

			<Flex height="75vh" gap={4}>
				<Card.Root width="25%" variant="elevated" borderRadius={35} style={glassStyle}>
					<Card.Body display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={8} gap={4}>
						<Box width="150px" height="120px">
							<AnimatedLogo style={{ maxWidth: "150px", height: "auto" }} />
						</Box>

						<Heading size="xl" color="white" textAlign="center" textShadow="0 2px 4px rgba(0,0,0,0.2)" lineHeight="1.2">
							Discover furniture that fits your style with{" "}
							<Text as="span" color="#fff0bd">
								StyleMatch
							</Text>
						</Heading>

						<Text color="rgba(255, 255, 255, 0.9)" fontSize="md" textAlign="center" textShadow="0 1px 2px rgba(0,0,0,0.1)" mt={2}>
							Let us analyse your space to find the perfect furniture for you
						</Text>

						<Box mt={4} display="flex" justifyContent="center" width="100%">
							{!detectionSuccess ? (
								<Box onClick={!isLoading ? handleUploadClick : undefined} width="90%" opacity={isLoading ? 0.5 : 1}>
									<GetStartedButton width="100%" destination={null} delay="0.5s" loading={isLoading} />
								</Box>
							) : (
								<Box width="90%">
									<FindRecommendationsButton width="100%" delay="0.5s" onClick={handleFindRecommendations} />
								</Box>
							)}
						</Box>
					</Card.Body>
				</Card.Root>

				<Flex direction="column" width="75%" gap={3}>
					<MotionCard height="45%" variant="elevated" borderRadius={35} style={glassStyle} overflow="hidden" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
						<Box position="relative" width="100%" height="100%">
							<Image src={roomImage} alt="Room preview" objectFit="cover" width="100%" height="100%" opacity={0.5} />
							<Box position="absolute" inset={0} bgGradient="to-b" gradientFrom="transparent" gradientTo="rgba(0,0,0,0.3)" />
							<MotionBox position="absolute" bottom={3} right={5} fontWeight="md" fontSize="2xl" color="white" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
								<Text>{roomStyle}</Text>
							</MotionBox>
						</Box>
					</MotionCard>

					<Card.Root height="55%" variant="elevated" borderRadius={35} style={glassStyle}>
						<Card.Body padding={4}>
							{isLoading ? (
								<Flex justify="center" align="center" height="100%" direction="column" gap={4}>
									<motion.div variants={rocketVariants} animate="analyzing">
										<Icon as={RxRocket} w={10} h={10} color="white" />
									</motion.div>
									<Text color="white" fontSize="lg">
										Analyzing your room...
									</Text>
									<Text color="white" fontSize="sm">
										Hold tight! This may take up to 5 minutes
									</Text>
								</Flex>
							) : furnitureItems.length === 0 ? (
								<Flex justify="center" align="center" height="100%" direction="column" gap={3}>
									<Text color="white" fontSize="xl">
										No furniture detected yet
									</Text>
									<Text color="white" fontSize="md">
										Click "Get Started" to upload your room image
									</Text>
								</Flex>
							) : (
								<Carousel.Root slideCount={chunkedItems.length}>
									<Carousel.ItemGroup>
										{chunkedItems.map((chunk, pageIndex) => (
											<Carousel.Item key={pageIndex} index={pageIndex}>
												<Grid templateColumns="repeat(3, 1fr)" gap={4} height="100%">
													{chunk.map((item, index) => (
														<Popover.Root key={index} positioning={{ placement: "top-middle" }}>
															<Popover.Trigger asChild>
																<MotionCard
																	size="sm"
																	borderRadius={20}
																	maxHeight={"77px"}
																	initial={{ opacity: 0, scale: 0.8, y: 20 }}
																	animate={{ opacity: 1, scale: 1, y: 0 }}
																	cursor={"pointer"}
																	transition={{
																		duration: 0.4,
																		delay: index * 0.1,
																		ease: "easeOut"
																	}}
																>
																	<Card.Body>
																		<Flex align="start" gap="3">
																			<Avatar.Root size="lg" shape="rounded">
																				<Avatar.Image src={item.image} />
																				<Avatar.Fallback name={item.name} />
																			</Avatar.Root>

																			<Box>
																				<Card.Title>{item.name}</Card.Title>
																				<Card.Description>
																					Confidence:{" "}
																					<Text as="span" fontWeight="bold">
																						{item.confidence}
																					</Text>
																				</Card.Description>
																			</Box>
																		</Flex>
																	</Card.Body>
																</MotionCard>
															</Popover.Trigger>
															<Popover.Positioner>
																<Popover.Content maxW="400px">
																	<Popover.Arrow />
																	<Popover.Body p={0}>
																		<Box>
																			<Popover.Title fontWeight="semibold" fontSize="lg" p={4} pb={3} borderBottom="1px solid" borderColor="border.subtle">
																				{item.name}
																			</Popover.Title>
																			<Box p={4}>
																				<Image
																					src={item.image}
																					alt={item.name}
																					borderRadius="md"
																					width="100%"
																					height="auto"
																					maxH="200px"
																					objectFit="contain" // Changed from "cover"
																					imageRendering="crisp-edges"
																				/>
																			</Box>
																		</Box>
																	</Popover.Body>
																	<Popover.CloseTrigger />
																</Popover.Content>
															</Popover.Positioner>
														</Popover.Root>
													))}
												</Grid>
											</Carousel.Item>
										))}
									</Carousel.ItemGroup>

									<Carousel.Control justifyContent="center" gap={2} mt={3}>
										<Carousel.PrevTrigger asChild>
											<IconButton variant="ghost" size="sm" color="white" borderRadius={"full"}>
												<LuChevronLeft />
											</IconButton>
										</Carousel.PrevTrigger>

										<Carousel.IndicatorGroup>
											{chunkedItems.map((_, index) => (
												<Carousel.Indicator key={index} index={index} />
											))}
										</Carousel.IndicatorGroup>

										<Carousel.NextTrigger asChild>
											<IconButton variant="ghost" size="sm" color="white" borderRadius={"full"}>
												<LuChevronRight />
											</IconButton>
										</Carousel.NextTrigger>
									</Carousel.Control>
								</Carousel.Root>
							)}
						</Card.Body>
					</Card.Root>
				</Flex>
			</Flex>
		</>
	);
}

export default GetStarted;
