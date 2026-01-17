import { useState } from "react";
import { Card, Flex, Heading, Text, Box, Grid, Image, Avatar, Spinner } from "@chakra-ui/react";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";
import SampleStyleBackground from "../../assets/SampleStyleBackground.png";
import AnimatedLogo from "@/components/Homepage/AnimatedLogo";
import GetStartedButton from "@/components/Homepage/GetStartedButton";
import server from "../../../networking";

function GetStarted() {
	const [furnitureItems, setFurnitureItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [roomImage, setRoomImage] = useState(SampleStyleBackground);
	const [error, setError] = useState(null);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	const handleGetStarted = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const formData = new FormData();

			// Fetch the sample image and convert to file
			const response = await fetch(SampleStyleBackground);
			const blob = await response.blob();
			const file = new File([blob], "room.png", { type: "image/png" });
			formData.append("file", file);

			// Send to backend with increased timeout
			const { data } = await server.post("/stylematch/detection/detect-furniture", formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				},
				timeout: 120000, // 2 minutes timeout
				onUploadProgress: (progressEvent) => {
					// Optional: Track upload progress
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					console.log(`Upload Progress: ${percentCompleted}%`);
				}
			});

			if (data.success) {
				// Map the response to furniture items
				const items = data.images.map((item) => {
					const baseUrl = server.defaults.baseURL?.replace(/\/$/, '') || '';
					const imagePath = item.image_path?.startsWith('/') ? item.image_path : `/${item.image_path}`;
					const imageUrl = `${baseUrl}${imagePath}`;

					// Capitalize each word in the class name
					const capitalizedName = item.class
						? item.class
							.split(/[\s_-]+/) // Split by space, underscore, or hyphen
							.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
							.join(' ')
						: 'Unknown';

					return {
						name: capitalizedName,
						image: imageUrl,
						confidence: `${item.confidence}%`
					};
				});

				setFurnitureItems(items);
				setError(null);
			} else {
				console.error("Detection failed:", data.error);
				setError(data.error || "Failed to detect furniture. Please try again.");
			}
		} catch (error) {
			console.error("Error:", error);

			// Better error handling
			if (error.code === 'ECONNABORTED') {
				setError("Request timed out. The analysis is taking longer than expected. Please try again.");
			} else if (error.response?.status === 500) {
				setError(error.response?.data?.error || "Server error occurred. Please try again.");
			} else if (error.response) {
				setError(`Error: ${error.response.data?.error || error.message}`);
			} else if (error.request) {
				setError("No response from server. Please check your connection.");
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

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

						<Box mt={4} display={"flex"} justifyContent={"center"} width="100%">
							<Box onClick={handleGetStarted} cursor="pointer" width="90%">
								<GetStartedButton width={"100%"} destination={null} delay={"0.5s"} />
							</Box>
						</Box>

						{error && (
							<Box
								mt={2}
								p={3}
								bg="rgba(255, 0, 0, 0.1)"
								borderRadius="md"
								border="1px solid rgba(255, 0, 0, 0.3)"
								width="90%"
							>
								<Text color="white" fontSize="sm" textAlign="center">
									{error}
								</Text>
							</Box>
						)}
					</Card.Body>
				</Card.Root>

				<Flex direction="column" width="75%" gap={3}>
					<Card.Root height="45%" variant="elevated" borderRadius={35} style={glassStyle} overflow="hidden">
						<Box position="relative" width="100%" height="100%">
							<Image src={roomImage} alt="Modern living room" objectFit="cover" width="100%" height="100%" opacity={0.5} />
							{/* Gradient overlay */}
							<Box position="absolute" inset={0} bgGradient="to-b" gradientFrom="transparent" gradientTo="rgba(0,0,0,0.3)" />
							<Box position="absolute" bottom={3} right={5} fontWeight="md" fontSize="2xl" color="white">
								<Text>Modern</Text>
							</Box>
						</Box>
					</Card.Root>

					<Card.Root height="55%" variant="elevated" borderRadius={35} style={glassStyle}>
						<Card.Body padding={4}>
							{isLoading ? (
								<Flex justify="center" align="center" height="100%" direction="column" gap={4}>
									<Spinner size="xl" color="white" thickness="4px" />
									<Text color="white" fontSize="lg" opacity={0.8}>
										Analyzing your room...
									</Text>
									<Text color="white" fontSize="sm" opacity={0.6}>
										This may take up to 2 minutes
									</Text>
								</Flex>
							) : furnitureItems.length === 0 ? (
								<Flex justify="center" align="center" height="100%" direction="column" gap={3}>
									<Text color="white" fontSize="xl" opacity={0.7}>
										No furniture detected yet
									</Text>
									<Text color="white" fontSize="md" opacity={0.5}>
										Click "Get Started" to analyze your room
									</Text>
								</Flex>
							) : (
								<Grid templateColumns="repeat(3, 1fr)" gap={4} height="100%">
									{furnitureItems.map((item, index) => (
										<Card.Root key={index} size="sm" borderRadius={20}>
											<Card.Body>
												<Flex align="start" gap="3">
													<Avatar.Root size="lg" shape="rounded">
														<Avatar.Image src={item.image} />
														<Avatar.Fallback name={item.name} />
													</Avatar.Root>

													<Box>
														<Card.Title>{item.name}</Card.Title>
														<Card.Description>Confidence: {item.confidence}</Card.Description>
													</Box>
												</Flex>
											</Card.Body>
										</Card.Root>
									))}
								</Grid>
							)}
						</Card.Body>
					</Card.Root>
				</Flex>
			</Flex>
		</>
	);
}

export default GetStarted;