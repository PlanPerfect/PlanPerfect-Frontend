import { Box, Flex, Heading, Text, Button, Spinner, Image, Container } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FaPaintBrush, FaPalette } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useAuth } from "../../contexts/AuthContext";
import server from "../../../networking";
import RegenerateDesignInput from "@/components/existingHomeOwner/RegenerateDesignInput";

function ImageGeneration() {
	const { user } = useAuth();
	const [preferences, setPreferences] = useState(null);
	const [analysisResults, setAnalysisResults] = useState(null);
	const [selectedStyles, setSelectedStyles] = useState([]);
	const [originalImageUrl, setOriginalImageUrl] = useState(null);
	
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	
	const [isGenerating, setIsGenerating] = useState(false);
	// Eagerly read sessionStorage so results view renders immediately on back-navigation,
	// before the async fetchUserData even completes
	const [generatedImage, setGeneratedImage] = useState(null);
	const [generationError, setGenerationError] = useState(null);
	const [isRestoredImage, setIsRestoredImage] = useState(false);
	
	// NEW: State for regeneration UI
	const [showRegenerateInput, setShowRegenerateInput] = useState(false);

	// Ref for scrolling to images section
	const imagesSectionRef = useRef(null);

	// Ref for scrolling to regenerate input section
	const regenerateInputRef = useRef(null);

	// Define available styles (matching styleSelector.jsx for consistency)
	const availableStyles = [
		"Boutique",
		"Classical",
		"Contemporary",
		"Country",
		"Electic",
		"Industrial",
		"Japanese",
		"Luxury",
		"Minimalist",
		"Modern",
		"Persian",
		"Scandinavian",
		"Vintage",
		"Wabi Sabi",
		"Japandi",
		"Peranakan",
		"Boho"
	];

	// ================================
	// Eagerly restore generated image from sessionStorage
	// Runs as soon as user is available, before fetchUserData completes,
	// so the results view renders immediately on back-navigation
	// ================================
	useEffect(() => {
		if (!user) return;
		const savedImage = sessionStorage.getItem(`generatedImage_${user.uid}`);
		if (savedImage) {
			setIsRestoredImage(true);
			setGeneratedImage(savedImage);
		}
	}, [user]);

	// ================================
	// Fetch data from database on mount
	// ================================
	useEffect(() => {
		const fetchUserData = async () => {
			if (!user) {
				setLoadError("User not authenticated");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setLoadError(null);

				// Fetch preferences from database
				const response = await server.get(`/existingHomeOwners/styleClassification/getPreferences/${user.uid}`);
				
				if (response.data.success && response.data.result) {
					const data = response.data.result;
					
					// Set preferences
					setPreferences({
						propertyType: data.property_type,
						unitType: data.unit_type,
						budgetMin: data.budget_min,
						budgetMax: data.budget_max
					});

					// Set analysis results (detected_style comes from Preferences node)
					setAnalysisResults({
						detected_style: data.detected_style
					});

					// Set selected styles
					setSelectedStyles(data.selected_styles || []);

					// Set original image URL (fetched from Style Analysis node by backend)
					setOriginalImageUrl(data.original_image_url || null);

				} else {
					setLoadError("No preferences found. Please complete the setup first.");
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				setLoadError(
					error.response?.data?.result || 
					error.message || 
					'Failed to load your data. Please try again.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [user]);

	// ================================
	// Auto-scroll to images when generated
	// ================================
	useEffect(() => {
		if (generatedImage && imagesSectionRef.current && !isRestoredImage) {
			setTimeout(() => {
				imagesSectionRef.current.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'start' 
				});
			}, 100);
		}
	}, [generatedImage]);

	// ================================
	// Generate design handler (initial generation)
	// ================================
	const handleGenerateDesign = async () => {
		setIsGenerating(true);
		setGenerationError(null);
		setIsRestoredImage(false);
		
		try {
			const formData = new FormData();
			formData.append('styles', selectedStyles.join(', '));

			const response = await server.post('/image/generate', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'X-User-ID': user.uid,
				}
			});
			const { url, file_id, filename } = response.data;

			setGeneratedImage(url);
			sessionStorage.setItem(`generatedImage_${user.uid}`, url);
		} catch (error) {
			console.error('Error generating image:', error);
			setGenerationError(
				error.response?.data?.detail || 
				error.message || 
				'Failed to generate design. Please try again.'
			);
		} finally {
			setIsGenerating(false);
		}
	};

	// ================================
	// NEW: Regenerate with custom options handler
	// ================================
	const handleRegenerateDesign = async ({ prompt, styles }) => {
		setIsGenerating(true);
		setGenerationError(null);
		setIsRestoredImage(false);
		setShowRegenerateInput(false); // Hide input while generating
		
		try {
			const formData = new FormData();
			formData.append('styles', styles.join(', '));
			
			// Only add prompt if it exists
			if (prompt) {
				formData.append('user_prompt', prompt);
			}

			const response = await server.post('/image/generate', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'X-User-ID': user.uid,
				}
			});
			const { url, file_id, filename } = response.data;

			setGeneratedImage(url);
			sessionStorage.setItem(`generatedImage_${user.uid}`, url);
			setSelectedStyles(styles); // Update the selected styles
		} catch (error) {
			console.error('Error regenerating image:', error);
			setGenerationError(
				error.response?.data?.detail || 
				error.message || 
				'Failed to regenerate design. Please try again.'
			);
			setShowRegenerateInput(true); // Show input again on error
		} finally {
			setIsGenerating(false);
		}
	};

	// ================================
	// Toggle regenerate input visibility
	// ================================
	const handleShowRegenerateInput = () => {
		const isOpening = !showRegenerateInput;
		setShowRegenerateInput(isOpening);
		setGenerationError(null);

		if (isOpening) {
			setTimeout(() => {
				regenerateInputRef.current?.scrollIntoView({ 
					behavior: 'smooth', 
					block: 'start' 
				});
			}, 100);
		}
	};

	// ================================
	// Download image handler
	// ================================
	const handleDownloadImage = async () => {
		try {
			// Fetch the image as a blob
			const response = await fetch(generatedImage);
			const blob = await response.blob();
			
			// Create a temporary URL for the blob
			const blobUrl = window.URL.createObjectURL(blob);
			
			// Create a temporary anchor element and trigger download
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = `generated-design-${Date.now()}.png`;
			document.body.appendChild(link);
			link.click();
			
			// Clean up
			document.body.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			console.error('Error downloading image:', error);
			// Fallback: open image in new tab
			window.open(generatedImage, '_blank');
		}
	};

	// ================================
	// Loading state
	// ================================
	if (isLoading) {
		return (
			<>
				{/* Background */}
				<Box
					style={{
						position: "fixed", 
						top: 0, 
						left: 0, 
						right: 0, 
						bottom: 0,
						backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						backgroundRepeat: "no-repeat",
						zIndex: -1
					}}
				/>

				<Container maxW="6xl" py={8}>
					<Box 
						bg="white" 
						borderRadius="12px" 
						p={8} 
						textAlign="center"
						boxShadow="xl"
					>
						<Spinner size="xl" color="#D4AF37" thickness="4px" mb={4} />
						<Text fontSize="lg" color="gray.600">
							Loading your data...
						</Text>
					</Box>
				</Container>
			</>
		);
	}

	// ================================
	// Error state
	// ================================
	if (loadError) {
		return (
			<>
				{/* Background */}
				<Box
					style={{
						position: "fixed", 
						top: 0, 
						left: 0, 
						right: 0, 
						bottom: 0,
						backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						backgroundRepeat: "no-repeat",
						zIndex: -1
					}}
				/>

				<Container maxW="6xl" py={8}>
					<Box 
						bg="red.50" 
						border="2px solid" 
						borderColor="red.400"
						borderRadius="12px" 
						p={8}
						textAlign="center"
						boxShadow="xl"
					>
						<Text color="red.600" fontWeight="600" fontSize="xl">
							⚠️ {loadError}
						</Text>
					</Box>
				</Container>
			</>
		);
	}

	// ================================
	// Main content - Before generation
	// ================================
	if (!generatedImage) {
		return (
			<>
				{/* Background */}
				<Box
					style={{
						position: "fixed", 
						top: 0, 
						left: 0, 
						right: 0, 
						bottom: 0,
						backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						backgroundRepeat: "no-repeat",
						zIndex: -1
					}}
				/>

				<Container maxW="6xl" py={8}>
					<Box bg="white" borderRadius="12px" p={8} boxShadow="xl">
						<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
							Generate Your Design
						</Heading>
						<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
							Review your style selections and generate your personalized design
						</Text>

						<Flex direction="column" gap={6}>
							{/* AI-Detected Style Card */}
							<Box 
								border="2px solid #D4AF37" 
								borderRadius="12px" 
								p={6} 
								bg="white"
								boxShadow="md"
							>
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPaintBrush color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">
										AI-Detected Style
									</Heading>
								</Flex>
								
								<Flex justify="center" align="center" flexDirection="column" gap={2}>
									<Box 
										bg="#D4AF37" 
										color="white" 
										px={8} 
										py={3}
										borderRadius="full" 
										fontSize="xl" 
										fontWeight="700"
									>
										{analysisResults?.detected_style || 'Unknown'}
									</Box>
								</Flex>
							</Box>

							{/* Selected Design Themes Card */}
							<Box 
								border="2px solid #D4AF37" 
								borderRadius="12px" 
								p={6} 
								bg="white"
								boxShadow="md"
							>
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPalette color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">
										Selected Design Themes
									</Heading>
								</Flex>
								
								{selectedStyles.length > 0 ? (
									<Flex justify="center" align="center" gap={3} flexWrap="wrap">
										{selectedStyles.map((style, index) => (
											<Box 
												key={index} 
												bg="#F4E5B2" 
												color="#8B7355" 
												px={6} 
												py={3}
												borderRadius="full" 
												fontSize="lg" 
												fontWeight="600" 
												border="2px solid #D4AF37"
											>
												{style}
											</Box>
										))}
									</Flex>
								) : (
									<Text textAlign="center" color="gray.600">
										No design themes selected yet.
									</Text>
								)}
							</Box>

							{/* Original Image Preview */}
							{originalImageUrl && (
								<Box 
									border="2px solid #D4AF37" 
									borderRadius="12px" 
									p={6} 
									bg="white"
									boxShadow="md"
								>
									<Heading size="md" textAlign="center" mb={4} color="gray.700">
										Your Room
									</Heading>
									<Flex justify="center">
										<Image
											src={originalImageUrl}
											borderRadius="12px"
											boxShadow="lg"
											maxW="380px"
											maxH="450px"
											w="100%"
											h="auto"
											objectFit="cover"
											border="2px solid #E2E8F0"
										/>
									</Flex>
								</Box>
							)}

							{/* Generating State */}
							{isGenerating && (
								<Box 
									border="2px solid #D4AF37" 
									borderRadius="12px" 
									p={8} 
									bg="#FFFDF7"
								>
									<Flex direction="column" align="center" gap={4}>
										<Spinner size="xl" color="#D4AF37" thickness="4px" speed="0.65s" />
										<Text fontSize="xl" fontWeight="600" color="#D4AF37">
											✨ Creating Your Design Magic...
										</Text>
										<Text fontSize="md" color="gray.600" textAlign="center">
											Our AI is crafting your personalized design based on your selected styles.<br/>
											This may take a few moments. Please wait.
										</Text>
									</Flex>
								</Box>
							)}

							{/* Generate Button */}
							{selectedStyles.length > 0 && !isGenerating && (
								<Flex justify="center" mt={4}>
									<Button 
										onClick={handleGenerateDesign} 
										size="xl" 
										borderRadius="md" 
										bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
										color="white" 
										px={16} 
										py={7} 
										fontSize="xl" 
										fontWeight="700"
										leftIcon={<FaWandMagicSparkles />}
										_hover={{
											bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)",
											transform: "translateY(-2px)",
											boxShadow: "xl",
										}}
										transition="all 0.2s"
										boxShadow="lg"
									>
										Generate Design ✨
									</Button>
								</Flex>
							)}
						</Flex>
					</Box>
				</Container>
			</>
		);
	}

	// ================================
	// After generation - Results view
	// ================================
	return (
		<>
			{/* Background */}
			<Box
				style={{
					position: "fixed", 
					top: 0, 
					left: 0, 
					right: 0, 
					bottom: 0,
					backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			<Container maxW="6xl" py={8}>
				<Box bg="white" borderRadius="12px" p={8} boxShadow="xl">
					<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
						✨ Your Dream Design is Ready!
					</Heading>
					<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
						Here's your AI-generated room transformation
					</Text>

					<Flex direction="column" gap={6}>
						{/* Applied Styles Card */}
						{selectedStyles.length > 0 && (
							<Box 
								border="2px solid #D4AF37" 
								borderRadius="12px" 
								p={6} 
								bg="white"
								boxShadow="md"
							>
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPalette color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">
										Applied Design Themes
									</Heading>
								</Flex>
								
								<Flex justify="center" align="center" gap={3} flexWrap="wrap">
									{selectedStyles.map((style, index) => (
										<Box 
											key={index} 
											bg="#F4E5B2" 
											color="#8B7355" 
											px={6} 
											py={3}
											borderRadius="full" 
											fontSize="lg" 
											fontWeight="600" 
											border="2px solid #D4AF37"
										>
											{style}
										</Box>
									))}
								</Flex>
							</Box>
						)}

						{/* Image Comparison Card */}
						<Box 
							ref={imagesSectionRef}
							border="2px solid #D4AF37" 
							borderRadius="12px" 
							p={6} 
							bg="white"
							boxShadow="md"
						>
							<Heading size="md" textAlign="center" mb={6} color="gray.700">
								Before & After Transformation
							</Heading>

							<Flex gap={4} justify="center" align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
								{/* Original Image */}
								<Box flex="1" minW={{ base: "100%", md: "250px" }} maxW="380px">
									<Text 
										fontSize="lg" 
										fontWeight="600" 
										mb={3} 
										textAlign="center" 
										color="gray.600"
										bg="gray.100"
										py={2}
										borderRadius="md"
									>
										📸 Original Room
									</Text>
									{originalImageUrl ? (
										<Image
											src={originalImageUrl}
											borderRadius="12px"
											boxShadow="lg"
											w="100%"
											h="auto"
											maxH="450px"
											objectFit="cover"
											border="2px solid #E2E8F0"
										/>
									) : (
										<Box 
											borderRadius="12px" 
											boxShadow="lg" 
											bg="gray.100" 
											p={8} 
											textAlign="center"
											minH="300px"
											display="flex"
											alignItems="center"
											justifyContent="center"
										>
											<Text color="gray.500">
												No original image available
											</Text>
										</Box>
									)}
								</Box>

								{/* Generated Image */}
								<Box flex="1" minW={{ base: "100%", md: "250px" }} maxW="380px">
									<Text 
										fontSize="lg" 
										fontWeight="600" 
										mb={3} 
										textAlign="center" 
										color="white"
										bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
										py={2}
										borderRadius="md"
									>
										✨ AI Generated Design
									</Text>
									<Image
										src={generatedImage}
										borderRadius="12px"
										boxShadow="2xl"
										border="3px solid #D4AF37"
										w="100%"
										h="auto"
										maxH="450px"
										objectFit="cover"
									/>
								</Box>
							</Flex>
						</Box>

						{/* Error Display */}
						{generationError && (
							<Box 
								bg="red.50" 
								border="2px solid" 
								borderColor="red.400"
								borderRadius="12px" 
								p={4} 
								textAlign="center"
							>
								<Text color="red.600" fontWeight="600">
									⚠️ {generationError}
								</Text>
							</Box>
						)}

						{/* NEW: Regenerate Input Section */}
						{showRegenerateInput && !isGenerating && (
							<Box ref={regenerateInputRef}>
								<RegenerateDesignInput
									onRegenerate={handleRegenerateDesign}
									onCancel={() => setShowRegenerateInput(false)}
									currentStyles={selectedStyles}
									availableStyles={availableStyles}
									isLoading={isGenerating}
								/>
							</Box>
						)}

						{/* Regenerating State */}
						{isGenerating && (
							<Box 
								border="2px solid #D4AF37" 
								borderRadius="12px" 
								p={8} 
								bg="#FFFDF7"
							>
								<Flex direction="column" align="center" gap={4}>
									<Spinner size="xl" color="#D4AF37" thickness="4px" speed="0.65s" />
									<Text fontSize="xl" fontWeight="600" color="#D4AF37">
										✨ Creating Your New Design Magic...
									</Text>
									<Text fontSize="md" color="gray.600" textAlign="center">
										Our AI is crafting your personalized design based on your selected styles.<br/>
										This may take a few moments. Please wait.
									</Text>
								</Flex>
							</Box>
						)}

						{/* Action Buttons - New Flow */}
						{!isGenerating && !showRegenerateInput && (
							<Box>
								{/* Satisfaction Question */}
								<Box textAlign="center" mb={6}>
									<Heading size="lg" color="gray.700" mb={2}>
										How do you feel about this design?
									</Heading>
									<Text color="gray.600" fontSize="md">
										Let us know so we can help you with the next steps
									</Text>
								</Box>

								{/* Two Path Options */}
								<Flex 
									direction={{ base: "column", md: "row" }} 
									gap={6} 
									justify="center" 
									align="stretch"
								>
									{/* Happy Path - Left Side */}
									<Box 
										flex="1"
										maxW={{ base: "100%", md: "400px" }}
										border="2px solid #10B981"
										borderRadius="12px"
										p={6}
										bg="#F0FDF4"
										textAlign="center"
									>
										<Text fontSize="4xl" mb={3}>😊</Text>
										<Heading size="md" color="#059669" mb={4}>
											Love It!
										</Heading>
										<Text fontSize="sm" color="gray.600" mb={6}>
											Download your design and chat with our AI assistant to bring it to life
										</Text>
										
										<Flex direction="column" gap={3}>
											<Button 
												onClick={handleDownloadImage}
												size="lg" 
												bg="green.500" 
												color="white"
												w="100%"
												py={6}
												fontSize="md"
												fontWeight="700"
												borderRadius="md"
												leftIcon={<Text fontSize="xl">📥</Text>}
												_hover={{ 
													bg: "green.600",
													transform: "translateY(-2px)",
													boxShadow: "lg"
												}}
												transition="all 0.2s"
											>
												Download Image
											</Button>
											
											<Button
												onClick={() => window.location.href = '/lumen/chat'}
												size="lg"
												bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
												color="white"
												w="100%"
												py={6}
												fontSize="md"
												fontWeight="700"
												borderRadius="md"
												leftIcon={<Text fontSize="xl">💬</Text>}
												_hover={{ 
													bg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
													transform: "translateY(-2px)",
													boxShadow: "lg"
												}}
												transition="all 0.2s"
											>
												Chat with Lumen AI
											</Button>
										</Flex>
									</Box>

									{/* Unhappy Path - Right Side */}
									<Box 
										flex="1"
										maxW={{ base: "100%", md: "400px" }}
										border="2px solid #D4AF37"
										borderRadius="12px"
										p={6}
										bg="#FFFDF7"
										textAlign="center"
									>
										<Text fontSize="4xl" mb={3}>🤔</Text>
										<Heading size="md" color="#D4AF37" mb={4}>
											Want Changes?
										</Heading>
										<Text fontSize="sm" color="gray.600" mb={6}>
											No problem! Customize the design or try a different style
										</Text>
										
										<Button
											onClick={handleShowRegenerateInput}
											size="lg"
											bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
											color="white"
											w="100%"
											py={6}
											fontSize="md"
											fontWeight="700"
											borderRadius="md"
											leftIcon={<FaWandMagicSparkles />}
											_hover={{ 
												bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)",
												transform: "translateY(-2px)",
												boxShadow: "lg"
											}}
											transition="all 0.2s"
										>
											{showRegenerateInput ? "Hide Options" : "Regenerate Design"}
										</Button>
									</Box>
								</Flex>
							</Box>
						)}
					</Flex>
				</Box>
			</Container>
		</>
	);
}

export default ImageGeneration;