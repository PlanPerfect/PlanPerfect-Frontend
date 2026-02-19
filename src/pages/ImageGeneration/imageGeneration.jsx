import { Box, Flex, Heading, Text, Button, Spinner, Image, Container } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FaPaintBrush, FaPalette } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useAuth } from "../../contexts/AuthContext";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";
import RegenerateDesignInput from "@/components/existingHomeOwner/RegenerateDesignInput";
import FurnitureSelector from "@/components/existingHomeOwner/FurnitureSelector";

function ImageGeneration() {
	const { user } = useAuth();
	const [preferences, setPreferences] = useState(null);
	const [analysisResults, setAnalysisResults] = useState(null);
	const [selectedStyles, setSelectedStyles] = useState([]);
	const [originalImageUrl, setOriginalImageUrl] = useState(null);

	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);

	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedImage, setGeneratedImage] = useState(null);
	const [generatedImageId, setGeneratedImageId] = useState(null);
	const [generationError, setGenerationError] = useState(null);
	const [isRestoredImage, setIsRestoredImage] = useState(false);

	const [preGenStep, setPreGenStep] = useState("preview");

	const [selectedFurnitureUrls, setSelectedFurnitureUrls] = useState([]);
	const [selectedFurnitureDescriptions, setSelectedFurnitureDescriptions] = useState([]);

	const [showRegenerateInput, setShowRegenerateInput] = useState(false);

	const [designHistory, setDesignHistory] = useState([]);
	const [showHistory, setShowHistory] = useState(false);
	const [lightboxUrl, setLightboxUrl] = useState(null);

	const imagesSectionRef = useRef(null);
	const regenerateInputRef = useRef(null);

	const availableStyles = ["Boutique", "Classical", "Contemporary", "Country", "Electic", "Industrial", "Japanese", "Luxury", "Minimalist", "Modern", "Persian", "Scandinavian", "Vintage", "Wabi Sabi", "Japandi", "Peranakan", "Boho"];

	useEffect(() => {
		if (!user) return;
		const referrer = document.referrer;
		const fromLumen = referrer.includes("/lumen/chat");
		const savedImage = sessionStorage.getItem(`generatedImage_${user.uid}`);
		const savedImageId = sessionStorage.getItem(`generatedImageId_${user.uid}`);
		if (fromLumen && savedImage) {
			setIsRestoredImage(true);
			setGeneratedImage(savedImage);
			if (savedImageId) setGeneratedImageId(savedImageId);
		} else {
			sessionStorage.removeItem(`generatedImage_${user.uid}`);
			sessionStorage.removeItem(`generatedImageId_${user.uid}`);
		}
	}, [user]);

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

				const response = await server.get(`/existingHomeOwners/styleClassification/getPreferences/${user.uid}`);

				if (response.data.success && response.data.result) {
					const data = response.data.result;

					setPreferences({
						propertyType: data.property_type,
						unitType: data.unit_type,
						budgetMin: data.budget_min,
						budgetMax: data.budget_max
					});

					setAnalysisResults({ detected_style: data.detected_style });
					setSelectedStyles(data.selected_styles || []);
					setOriginalImageUrl(data.original_image_url || null);
					fetchHistory();
				} else {
					setLoadError("No preferences found. Please complete the setup first.");
				}
			} catch (err) {
				const errDetail = err?.response?.data?.detail || err?.response?.data?.error;
				if (errDetail) {
					const clean = errDetail.replace(/^(UERROR|ERROR):\s*/, "");
					setLoadError(clean);
					console.error("Failed to fetch user data: ", clean);
					
				} else {
					console.error("Failed to fetch user data: ", err?.response);
					setLoadError("An unexpected error occurred while fetching your data.");}
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [user]);

	useEffect(() => {
		if (generatedImage && imagesSectionRef.current && !isRestoredImage) {
			setTimeout(() => {
				imagesSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		}
	}, [generatedImage]);

	const handleErrorResponse = (err, context, setError) => {
		const errDetail = err?.response?.data?.detail || err?.response?.data?.error;
		if (errDetail) {
			const clean = errDetail.replace(/^(UERROR|ERROR):\s*/, "");
			if (setError) setError(clean);
			console.error(`${context}: `, clean);
			ShowToast("error", clean, "Check console for more details.");
		} else {
			console.error(`${context}: `, err?.response);
			ShowToast("error", "An unexpected error occurred", "Check console for more details.");
		}
	};

	const fetchHistory = async () => {
		try {
			const response = await server.get("/image/history", {
				headers: { "X-User-ID": user.uid }
			});
			if (response.data.success) {
				setDesignHistory(response.data.designs || []);
			}
		} catch (err) {
			console.error("Failed to fetch design history:", err);
		}
	};

	const saveFinalSelection = async (imageUrl, generationId) => {
		console.log("[saveFinalSelection] id:", generationId, "url:", imageUrl);
		if (!generationId) return;
		try {
			await server.post("/image/selectFinal", { generation_id: generationId, image_url: imageUrl }, {
				headers: { "X-User-ID": user.uid }
			});
		} catch (err) {
			console.error("Failed to save final selection:", err);
		}
	};

	const handleFurnitureConfirm = ({ urls, descriptions }) => {
		setSelectedFurnitureUrls(urls);
		setSelectedFurnitureDescriptions(descriptions);
		handleGenerateDesign(urls, descriptions);
	};

	const buildFormData = (styles, furnitureUrls = [], furnitureDescriptions = [], userPrompt = null) => {
		const formData = new FormData();
		formData.append("styles", styles.join(", "));
		if (furnitureUrls?.length > 0)
			formData.append("furniture_urls", JSON.stringify(furnitureUrls));
		if (furnitureDescriptions?.length > 0)
			formData.append("furniture_descriptions", JSON.stringify(furnitureDescriptions));
		if (userPrompt)
			formData.append("user_prompt", userPrompt);
		return formData;
	};

	const handleGenerateDesign = async (furnitureUrls = [], furnitureDescriptions = []) => {
		setIsGenerating(true);
		setGenerationError(null);
		setIsRestoredImage(false);

		try {
			const formData = buildFormData(selectedStyles, furnitureUrls, furnitureDescriptions);

			const response = await server.post("/image/generate", formData, {
				headers: { "Content-Type": "multipart/form-data", "X-User-ID": user.uid }
			});
			const { url, generation_id } = response.data;

			setGeneratedImage(url);
			setGeneratedImageId(generation_id);
			sessionStorage.setItem(`generatedImage_${user.uid}`, url);
			sessionStorage.setItem(`generatedImageId_${user.uid}`, generation_id);
			fetchHistory();
		} catch (err) {
			handleErrorResponse(err, "Failed to generate design", setGenerationError);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRegenerateDesign = async ({ prompt, styles }) => {
		setIsGenerating(true);
		setGenerationError(null);
		setIsRestoredImage(false);
		setShowRegenerateInput(false);

		try {
			const formData = buildFormData(styles, selectedFurnitureUrls, selectedFurnitureDescriptions, prompt || null);

			const response = await server.post("/image/generate", formData, {
				headers: { "Content-Type": "multipart/form-data", "X-User-ID": user.uid }
			});
			const { url, generation_id } = response.data;

			setGeneratedImage(url);
			setGeneratedImageId(generation_id);
			sessionStorage.setItem(`generatedImage_${user.uid}`, url);
			sessionStorage.setItem(`generatedImageId_${user.uid}`, generation_id);
			setSelectedStyles(styles);
			fetchHistory();
		} catch (err) {
			setShowRegenerateInput(true);
			handleErrorResponse(err, "Failed to re-generate design", setGenerationError);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleShowRegenerateInput = () => {
		const isOpening = !showRegenerateInput;
		setShowRegenerateInput(isOpening);
		setGenerationError(null);

		if (isOpening) {
			setTimeout(() => {
				regenerateInputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		}
	};

	const handleDownloadImage = async () => {
		try {
			const response = await fetch(generatedImage);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = `generated-design-${Date.now()}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			console.error("Error downloading image:", error);
			window.open(generatedImage, "_blank");
		}
	};

	const Background = () => (
		<Box
			style={{
				position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
				backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/newHomeOwnerHero.png')`,
				backgroundSize: "cover", backgroundPosition: "center",
				backgroundRepeat: "no-repeat", zIndex: -1
			}}
		/>
	);

	if (isLoading) {
		return (
			<>
				<Background />
				<Container maxW="6xl" py={8}>
					<Box bg="white" borderRadius="12px" p={8} textAlign="center" boxShadow="xl">
						<Spinner size="xl" color="#D4AF37" thickness="4px" mb={4} />
						<Text fontSize="lg" color="gray.600">Loading your data...</Text>
					</Box>
				</Container>
			</>
		);
	}

	if (loadError) {
		return (
			<>
				<Background />
				<Container maxW="6xl" py={8}>
					<Box bg="red.50" border="2px solid" borderColor="red.400" borderRadius="12px" p={8} textAlign="center" boxShadow="xl">
						<Text color="red.600" fontWeight="600" fontSize="xl">⚠️ {loadError}</Text>
					</Box>
				</Container>
			</>
		);
	}

	if (!generatedImage && preGenStep === "furniture") {
		return (
			<>
				<Background />
				<Container maxW="6xl" py={8}>
					<Box bg="white" borderRadius="12px" p={8} boxShadow="xl">
						<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
							Choose Items to Include
						</Heading>
						<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
							Select saved recommendations to incorporate into your design
						</Text>

						{isGenerating ? (
							<Box border="2px solid #D4AF37" borderRadius="12px" p={8} bg="#FFFDF7">
								<Flex direction="column" align="center" gap={4}>
									<Spinner size="xl" color="#D4AF37" thickness="4px" speed="0.65s" />
									<Text fontSize="xl" fontWeight="600" color="#D4AF37">
										✨ Creating Your Design Magic...
									</Text>
									<Text fontSize="md" color="gray.600" textAlign="center">
										Our AI is crafting your personalized design based on your styles and selected items.
										<br />This may take a few moments. Please wait.
									</Text>
								</Flex>
							</Box>
						) : (
							<FurnitureSelector
								onConfirm={handleFurnitureConfirm}
								onBack={() => setPreGenStep("preview")}
							/>
						)}
					</Box>
				</Container>
			</>
		);
	}

	if (!generatedImage && preGenStep === "preview") {
		return (
			<>
				<Background />
				<Container maxW="6xl" py={8}>
					<Box bg="white" borderRadius="12px" p={8} boxShadow="xl">
						<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
							Generate Your Design
						</Heading>
						<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
							Review your style selections and generate your personalized design
						</Text>

						<Flex direction="column" gap={6}>
							<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPaintBrush color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">AI-Detected Style</Heading>
								</Flex>
								<Flex justify="center">
									<Box bg="#D4AF37" color="white" px={8} py={3} borderRadius="full" fontSize="xl" fontWeight="700">
										{analysisResults?.detected_style || "Unknown"}
									</Box>
								</Flex>
							</Box>

							<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPalette color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">Selected Design Themes</Heading>
								</Flex>
								{selectedStyles.length > 0 ? (
									<Flex justify="center" align="center" gap={3} flexWrap="wrap">
										{selectedStyles.map((style, index) => (
											<Box key={index} bg="#F4E5B2" color="#8B7355" px={6} py={3} borderRadius="full" fontSize="lg" fontWeight="600" border="2px solid #D4AF37">
												{style}
											</Box>
										))}
									</Flex>
								) : (
									<Text textAlign="center" color="gray.600">No design themes selected yet.</Text>
								)}
							</Box>

							{originalImageUrl && (
								<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
									<Heading size="md" textAlign="center" mb={4} color="gray.700">Your Room</Heading>
									<Flex justify="center">
										<Image src={originalImageUrl} borderRadius="12px" boxShadow="lg" maxW="380px" maxH="450px" w="100%" h="auto" objectFit="cover" border="2px solid #E2E8F0" />
									</Flex>
								</Box>
							)}

							{selectedStyles.length > 0 && (
								<Flex justify="center" mt={4}>
									<Button
										onClick={() => setPreGenStep("furniture")}
										size="xl" borderRadius="md"
										bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
										color="white" px={16} py={7} fontSize="xl" fontWeight="700"
										leftIcon={<FaWandMagicSparkles />}
										_hover={{
											bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)",
											transform: "translateY(-2px)", boxShadow: "xl"
										}}
										transition="all 0.2s" boxShadow="lg"
									>
										Next: Select Items ✨
									</Button>
								</Flex>
							)}
						</Flex>
					</Box>
				</Container>
			</>
		);
	}

	return (
		<>
			<Background />
			{/* Lightbox Overlay */}
			{lightboxUrl && (
				<Box
					position="fixed" top={0} left={0} right={0} bottom={0} zIndex={9999}
					bg="blackAlpha.900"
					display="flex" alignItems="center" justifyContent="center"
					onClick={() => setLightboxUrl(null)}
					cursor="zoom-out"
				>
					<Box onClick={(e) => e.stopPropagation()} display="flex" flexDirection="column" alignItems="center" gap={4}>
						<Box position="relative">
							<Image src={lightboxUrl} maxW="88vw" maxH="72vh" objectFit="contain"
								borderRadius="12px" boxShadow="0 0 60px rgba(212,175,55,0.4)"
								border="3px solid #D4AF37"
							/>
							<Button position="absolute" top="-14px" right="-14px"
								borderRadius="full" size="sm" bg="#D4AF37" color="white"
								_hover={{ bg: "#C9A961" }}
								onClick={() => setLightboxUrl(null)}
								minW="32px" h="32px" p={0} fontSize="md" fontWeight="700"
							>
								✕
							</Button>
						</Box>
						{lightboxUrl !== generatedImage && (
							<Button bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
								color="white" px={8} py={6} fontSize="md" fontWeight="700"
								borderRadius="md" leftIcon={<FaWandMagicSparkles />}
								boxShadow="0 4px 20px rgba(0,0,0,0.5)"
								_hover={{ bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)", transform: "translateY(-2px)" }}
								transition="all 0.2s"
								onClick={() => {
									const selectedId = designHistory.find(d => d.url === lightboxUrl)?.id || null;
									setGeneratedImage(lightboxUrl);
									setGeneratedImageId(selectedId);
									sessionStorage.setItem(`generatedImage_${user.uid}`, lightboxUrl);
									if (selectedId) sessionStorage.setItem(`generatedImageId_${user.uid}`, selectedId);
									saveFinalSelection(lightboxUrl, selectedId);
									setLightboxUrl(null);
									setTimeout(() => {
										imagesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
									}, 100);
								}}
							>
								Use This Design
							</Button>
						)}
					</Box>
				</Box>
			)}

			<Container maxW="6xl" py={8}>
				<Box bg="white" borderRadius="12px" p={8} boxShadow="xl">
					<Heading size="2xl" textAlign="center" mb={2} color="#D4AF37">
						✨ Your Dream Design is Ready!
					</Heading>
					<Text textAlign="center" fontSize="lg" color="gray.600" mb={8}>
						Here's your AI-generated room transformation
					</Text>

					<Flex direction="column" gap={6}>
						{selectedStyles.length > 0 && (
							<Box border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
								<Flex align="center" justify="center" gap={3} mb={4}>
									<FaPalette color="#D4AF37" size={24} />
									<Heading size="lg" color="#D4AF37">Applied Design Themes</Heading>
								</Flex>
								<Flex justify="center" align="center" gap={3} flexWrap="wrap">
									{selectedStyles.map((style, index) => (
										<Box key={index} bg="#F4E5B2" color="#8B7355" px={6} py={3} borderRadius="full" fontSize="lg" fontWeight="600" border="2px solid #D4AF37">
											{style}
										</Box>
									))}
								</Flex>
							</Box>
						)}

						<Box ref={imagesSectionRef} border="2px solid #D4AF37" borderRadius="12px" p={6} bg="white" boxShadow="md">
							<Heading size="md" textAlign="center" mb={6} color="gray.700">
								Before & After Transformation
							</Heading>

							<Flex gap={4} justify="center" align="start" flexWrap={{ base: "wrap", md: "nowrap" }}>
								<Box flex="1" minW={{ base: "100%", md: "250px" }} maxW="380px">
									<Text fontSize="lg" fontWeight="600" mb={3} textAlign="center" color="gray.600" bg="gray.100" py={2} borderRadius="md">
										📸 Original Room
									</Text>
									{originalImageUrl ? (
										<Image src={originalImageUrl} borderRadius="12px" boxShadow="lg" w="100%" h="auto" maxH="450px" objectFit="cover" border="2px solid #E2E8F0" />
									) : (
										<Box borderRadius="12px" bg="gray.100" p={8} textAlign="center" minH="300px" display="flex" alignItems="center" justifyContent="center">
											<Text color="gray.500">No original image available</Text>
										</Box>
									)}
								</Box>

								<Box flex="1" minW={{ base: "100%", md: "250px" }} maxW="380px">
									<Text fontSize="lg" fontWeight="600" mb={3} textAlign="center" color="white" bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)" py={2} borderRadius="md">
										✨ AI Generated Design
									</Text>
									<Image src={generatedImage} borderRadius="12px" boxShadow="2xl" border="3px solid #D4AF37" w="100%" h="auto" maxH="450px" objectFit="cover" />
								</Box>
							</Flex>
						</Box>

						{generationError && (
							<Box bg="red.50" border="2px solid" borderColor="red.400" borderRadius="12px" p={4} textAlign="center">
								<Text color="red.600" fontWeight="600">⚠️ {generationError}</Text>
							</Box>
						)}

						{showRegenerateInput && !isGenerating && (
							<Box ref={regenerateInputRef}>
								<RegenerateDesignInput onRegenerate={handleRegenerateDesign}
									onCancel={() => setShowRegenerateInput(false)}
									currentStyles={selectedStyles}
									availableStyles={availableStyles}
									isLoading={isGenerating}
								/>
							</Box>
						)}

						{isGenerating && (
							<Box border="2px solid #D4AF37" borderRadius="12px" p={8} bg="#FFFDF7">
								<Flex direction="column" align="center" gap={4}>
									<Spinner size="xl" color="#D4AF37" thickness="4px" speed="0.65s" />
									<Text fontSize="xl" fontWeight="600" color="#D4AF37">✨ Creating Your New Design Magic...</Text>
									<Text fontSize="md" color="gray.600" textAlign="center">
										Our AI is crafting your personalized design based on your selected styles.
										<br />This may take a few moments. Please wait.
									</Text>
								</Flex>
							</Box>
						)}

						{!isGenerating && !showRegenerateInput && (
							<Box>
								<Box textAlign="center" mb={6}>
									<Heading size="lg" color="gray.700" mb={2}>How do you feel about this design?</Heading>
									<Text color="gray.600" fontSize="md">Let us know so we can help you with the next steps</Text>
								</Box>

								<Flex direction={{ base: "column", md: "row" }} gap={6} justify="center" align="stretch">
									<Box flex="1" maxW={{ base: "100%", md: "400px" }} border="2px solid #10B981" borderRadius="12px" p={6} bg="#F0FDF4" textAlign="center">
										<Text fontSize="4xl" mb={3}>😊</Text>
										<Heading size="md" color="#059669" mb={4}>Love It!</Heading>
										<Text fontSize="sm" color="gray.600" mb={6}>
											Download your design and chat with our AI assistant to bring it to life
										</Text>
										<Flex direction="column" gap={3}>
											<Button onClick={() => { saveFinalSelection(generatedImage, generatedImageId); handleDownloadImage(); }} size="lg" bg="green.500" color="white" w="100%" py={6} fontSize="md" fontWeight="700" borderRadius="md"
												leftIcon={<Text fontSize="xl">📥</Text>}
												_hover={{ bg: "green.600", transform: "translateY(-2px)", boxShadow: "lg" }}
												transition="all 0.2s">
												Download Image
											</Button>
											<Button onClick={() => { saveFinalSelection(generatedImage, generatedImageId); window.location.href = "/lumen/chat"; }} size="lg" color="white" w="100%" py={6} fontSize="md"
												bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" fontWeight="700" borderRadius="md"
												leftIcon={<Text fontSize="xl">💬</Text>}
												_hover={{ bg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", transform: "translateY(-2px)", boxShadow: "lg" }}
												transition="all 0.2s">
												Chat with Lumen AI
											</Button>
										</Flex>
									</Box>

									<Box flex="1" maxW={{ base: "100%", md: "400px" }} border="2px solid #D4AF37" borderRadius="12px" p={6} bg="#FFFDF7" textAlign="center">
										<Text fontSize="4xl" mb={3}>🤔</Text>
										<Heading size="md" color="#D4AF37" mb={4}>Want Changes?</Heading>
										<Text fontSize="sm" color="gray.600" mb={6}>
											No problem! Customize the design or try a different furniture selection to see new variations
										</Text>
										<Button
											onClick={handleShowRegenerateInput} size="lg"
											bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
											color="white" w="100%" py={6} fontSize="md" fontWeight="700" borderRadius="md"
											leftIcon={<FaWandMagicSparkles />}
											_hover={{ bg: "linear-gradient(135deg, #C9A961 0%, #B8984D 100%)", transform: "translateY(-2px)", boxShadow: "lg" }}
											transition="all 0.2s">
												{showRegenerateInput ? "Hide Options" : "Regenerate Design"}
										</Button>
									</Box>
								</Flex>
							</Box>
						)}

						{/* Design History Panel */}
						<Box border="2px solid #D4AF37" borderRadius="12px" bg="white" boxShadow="md" overflow="hidden">
							<Flex
								align="center" justify="space-between"
								p={5} cursor="pointer" bg="#FFFDF7"
								onClick={() => {
									if (!showHistory && designHistory.length === 0) fetchHistory();
									setShowHistory(!showHistory);
								}}
								_hover={{ bg: "#FFF8E7" }}
								transition="background 0.2s"
							>
								<Flex align="center" gap={3}>
									<Text fontSize="xl">🕐</Text>
									<Heading size="md" color="#D4AF37">Design History</Heading>
									{designHistory.length > 0 && (
										<Box bg="#D4AF37" color="white" borderRadius="full" px={2} py={0.5} fontSize="sm" fontWeight="700">
											{designHistory.length}
										</Box>
									)}
								</Flex>
								<Text color="#D4AF37" fontWeight="700" fontSize="lg">
									{showHistory ? "▲" : "▼"}
								</Text>
							</Flex>

							{showHistory && (
								<Box p={5} borderTop="1px solid #F4E5B2">
									{designHistory.length === 0 ? (
										<Text textAlign="center" color="gray.500" py={4}>No previous designs yet.</Text>
									) : (
										<Flex gap={4} flexWrap="wrap" justify="flex-start">
											{designHistory.map((design) => (
												<Box key={design.id}
													border={design.url === generatedImage ? "3px solid #D4AF37" : "2px solid #E2E8F0"}
													borderRadius="10px" overflow="hidden" w={{ base: "100%", sm: "180px" }}
													boxShadow={design.url === generatedImage ? "0 0 0 2px #D4AF37" : "sm"}
													cursor="pointer" transition="all 0.2s"
													_hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
													onClick={() => setLightboxUrl(design.url)}
												>
													<Image src={design.url} w="100%" h="140px" objectFit="cover"
														fallback={<Box bg="gray.100" h="140px" display="flex" alignItems="center" 
														justifyContent="center">
														<Text color="gray.400" fontSize="sm">Loading...</Text>
														</Box>}
													/>
													<Box p={2} bg={design.url === generatedImage ? "#FFFDF7" : "white"}>
														<Text fontSize="xs" color="gray.500" noOfLines={1}>
															{design.styles || "—"}
														</Text>
														<Text fontSize="xs" color="gray.400">
															{design.created_at ? new Date(design.created_at).toLocaleDateString() : ""}
														</Text>
														{design.url === generatedImage && (
															<Text fontSize="xs" color="#D4AF37" fontWeight="700">● Current</Text>
														)}
													</Box>
												</Box>
											))}
										</Flex>
									)}
								</Box>
							)}
						</Box>
					</Flex>
				</Box>
			</Container>
		</>
	);
}

export default ImageGeneration;