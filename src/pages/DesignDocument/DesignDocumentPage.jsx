import { useState, useEffect } from "react";
import { Box, Card, Flex, Heading, Text, VStack, Button, Spinner } from "@chakra-ui/react";
import { FileText, Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingBackground from "../../assets/LandingBackground.png";
import server from "../../../networking";
import ShowToast from "@/Extensions/ShowToast";
import { useAuth } from "../../contexts/AuthContext";

function DesignDocumentPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [isGenerating, setIsGenerating] = useState(true);
	const [error, setError] = useState(null);
	const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	useEffect(() => {
		// Check if required data exists
		if (!user) {
			ShowToast("error", "Missing floor plan data. Redirecting...");
			navigate("/onboarding");
			return;
		}

		// Auto-generate on mount
		generateDocument();
	}, []);

	const savePdfToCloud = async (pdfBlob) => {
		const formData = new FormData();
	
		const timestamp = new Date()
			.toISOString()
			.replace(/[-:]/g, "")
			.slice(0, 15);
	
		const pdfFile = new File(
			[pdfBlob],
			`design_document_${timestamp}.pdf`,
			{ type: "application/pdf" }
		);
	
		formData.append("pdf_file", pdfFile);
		formData.append("user_id", user.uid);
	
		const res = await server.post(
			`/newHomeOwners/documentLlm/savePdf/${user.uid}`,
			formData,
		);
	
		return res.data.result.pdf_url;
	};	

	const generateDocument = async () => {
		setIsGenerating(true);
		setError(null);
		setGeneratedPdfUrl(null);

		try {
			const response = await server.post(
				`/newHomeOwners/documentLlm/generateDesignDocument/${user.uid}`,
				{},
				{
					responseType: 'blob' // For PDF download
				}
			);

			// Get PDF blob
			const blob = response.data;

			// Save PDF to cloud storage
			await savePdfToCloud(blob);

			// Create preview URL
			const url = window.URL.createObjectURL(blob);
			setGeneratedPdfUrl(url);

			ShowToast("success", "Design document generated successfully!");
		} catch (err) {
			console.error("Error generating document:", err);

			let errorMessage = "Failed to generate design document";

			if (err.response) {
				if (err.response.data) {
					try {
						const errorData =
							typeof err.response.data === "string"
								? JSON.parse(err.response.data)
								: err.response.data;
						errorMessage =
							errorData.detail ||
							errorData.message ||
							errorMessage;
					} catch (parseError) {
						errorMessage = err.response.statusText || errorMessage;
					}
				}
			} else if (err.request) {
				errorMessage = "No response from server. Please check your connection.";
			} else {
				errorMessage = err.message || errorMessage;
			}

			setError(errorMessage);
			ShowToast("error", errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = () => {
		if (!generatedPdfUrl) return;
	
		const now = new Date();
	
		const timestamp = now
			.toISOString()
			.replace(/[-:]/g, "") // remove - and :
			.replace("T", "_") // replace T with _
			.split(".")[0]; // remove milliseconds
	
		const filename = `segmented_floor_plan_${timestamp}.pdf`;
	
		const link = document.createElement("a");
		link.href = generatedPdfUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	
		ShowToast("success", "PDF downloaded successfully!");
	};	

	const handleRegenerate = () => {
		generateDocument();
	};

    const isSuccess = !isGenerating && !error && generatedPdfUrl;

	return (
		<>
			<Box
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url(${LandingBackground})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			<Flex h="75vh" justify="center" align="center">
				<Card.Root
					width="100%"
                    mt={{base: 4, md: isSuccess ? "25vh" : "10vh"}}
					height={{ base: "calc(100vh - 12rem)", md: isSuccess ? "100vh" : "85vh" }}
					variant="elevated"
					borderRadius={{ base: 20, md: 35 }}
					style={glassStyle}
					overflow="hidden"
				>
					{/* Header */}
					<Box
						borderBottom="1px solid rgba(255, 255, 255, 0.2)"
						p={{ base: 4, md: 6 }}
						bg="rgba(255, 255, 255, 0.05)"
					>
						<Flex align="center" gap={3}>
							<Box
								bg="rgba(255, 240, 189, 0.2)"
								p={2}
								borderRadius="full"
							>
								<FileText size={24} color="#fff0bd" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading
									size={{ base: "md", md: "lg" }}
									color="white"
									textShadow="0 2px 4px rgba(0,0,0,0.2)"
								>
									Design Document Generator
								</Heading>
								<Text
									fontSize={{ base: "xs", md: "sm" }}
									color="rgba(255, 255, 255, 0.7)"
								>
									{isGenerating
										? "Generating your personalized design document..."
										: error
										? "Generation failed"
										: "Your document is ready"}
								</Text>
							</VStack>
						</Flex>
					</Box>

					{/* Content */}
					<Card.Body
						p={{ base: 4, md: 6 }}
						overflowY="auto"
						flex="1"
						css={{
							"&::-webkit-scrollbar": {
								width: "8px"
							},
							"&::-webkit-scrollbar-track": {
								background: "rgba(255, 255, 255, 0.1)",
								borderRadius: "10px"
							},
							"&::-webkit-scrollbar-thumb": {
								background: "rgba(255, 255, 255, 0.3)",
								borderRadius: "10px"
							},
							"&::-webkit-scrollbar-thumb:hover": {
								background: "rgba(255, 255, 255, 0.4)"
							}
						}}
					>
						<VStack gap={6} align="stretch" h="100%" justify="center">
							{/* Generating State */}
							{isGenerating && (
								<VStack gap={4} animation="fadeInUp 0.4s ease-out">
									<Spinner size="xl" color="#fff0bd" thickness="4px" />
									<Heading
										size="lg"
										color="white"
										textAlign="center"
									>
										Generating Your Design Document
									</Heading>
									<Text
										color="rgba(255, 255, 255, 0.7)"
										textAlign="center"
										maxW="500px"
									>
										Our AI is analyzing your floor plan and preferences to create a comprehensive interior design proposal. This may take a moment...
									</Text>
								</VStack>
							)}

							{/* Error State */}
							{!isGenerating && error && (
								<VStack gap={4} animation="fadeInUp 0.4s ease-out">
									<AlertCircle size={48} color="#ff6b6b" />
									<Heading
										size="lg"
										color="white"
										textAlign="center"
									>
										Generation Failed
									</Heading>
									<Text
										color="rgba(255, 255, 255, 0.7)"
										textAlign="center"
										maxW="500px"
									>
										{error}
									</Text>
									<Button
										size="lg"
										bg="#D4AF37"
										color="white"
										_hover={{ bg: "#C9A961" }}
										onClick={handleRegenerate}
										leftIcon={<RefreshCw size={20} />}
									>
										Try Again
									</Button>
								</VStack>
							)}

							{/* Success State with PDF Preview */}
							{!isGenerating && !error && generatedPdfUrl && (
								<VStack gap={6} align="stretch" h="100%" animation="fadeInUp 0.4s ease-out">
									<VStack gap={3} animation="successFade 3s ease-out forwards">
										<Box
											bg="rgba(76, 175, 80, 0.2)"
											p={4}
											borderRadius="full"
										>
											<CheckCircle size={40} color="#4caf50" />
										</Box>
										<Heading
											size="md"
											color="white"
											textAlign="center"
										>
											Document Generated Successfully!
										</Heading>
										<Text
											color="rgba(255, 255, 255, 0.7)"
											textAlign="center"
											fontSize="sm"
										>
											Preview your design document below
										</Text>
									</VStack>

									{/* PDF Preview */}
									<Box
										flex="1"
                                        mt={-3}
										bg="rgba(255, 255, 255, 0.05)"
										borderRadius="lg"
										border="1px solid rgba(255, 255, 255, 0.2)"
										overflow="hidden"
										minH="400px"
									>
										<iframe
											src={generatedPdfUrl}
											style={{
												width: "100%",
												height: "100%",
												border: "none",
												minHeight: "800px"
											}}
											title="PDF Preview"
										/>
									</Box>

									{/* Action Buttons */}
									<Flex gap={3} direction={{ base: "column", md: "row" }}>
										<Button
											flex="1"
											size="lg"
											bg="#D4AF37"
											color="white"
											_hover={{ bg: "#C9A961" }}
											onClick={handleDownload}
											leftIcon={<Download size={20} />}
										>
											Download PDF
										</Button>
										<Button
											flex="1"
											size="lg"
											variant="outline"
											borderColor="rgba(255, 255, 255, 0.3)"
											color="white"
											_hover={{
												bg: "rgba(255, 255, 255, 0.1)",
												borderColor: "rgba(255, 255, 255, 0.5)"
											}}
											onClick={handleRegenerate}
											leftIcon={<RefreshCw size={20} />}
										>
											Regenerate
										</Button>
									</Flex>
								</VStack>
							)}
						</VStack>
					</Card.Body>
				</Card.Root>
			</Flex>

			<style>
				{`
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

					@keyframes pulse {
						0%, 100% {
							opacity: 1;
						}
						50% {
							opacity: 0.5;
						}
					}

					@keyframes successFade {
						0% {
							opacity: 1;
							transform: translateY(0);
							max-height: 200px;
						}
						70% {
							opacity: 1;
							transform: translateY(0);
							max-height: 200px;
						}
						100% {
							opacity: 0;
							transform: translateY(-20px);
							max-height: 0;
							margin: 0;
							padding: 0;
						}
					}
				`}
			</style>
		</>
	);
}

export default DesignDocumentPage;