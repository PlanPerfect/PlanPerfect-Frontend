import { Box, Button, Flex, Heading, Text, Spinner, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";
import server from "../../../networking";
import { useNavigate } from "react-router-dom";

function GenerateDesignDocument({ floorPlanFile, preferences, budget, extractionResults }) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState(null);
	const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
	const navigate = useNavigate()

	const handleGenerateDocument = async () => {
		setIsGenerating(true);
		setError(null);
		setGeneratedPdfUrl(null);

		try {
			const formData = new FormData();

			// Raw floor plan image
			if (floorPlanFile?.file) {
				formData.append("floor_plan", floorPlanFile.file);
			} else {
				throw new Error("Floor plan file is missing");
			}

			// Preferences
			const preferencesData = {
				style: preferences?.style || "Modern"
			};
			formData.append("preferences", JSON.stringify(preferencesData));

			// Budget
			formData.append("budget", budget || "Not specified");

			// Segmented floor plan and extracted data
			if (extractionResults) {
				formData.append(
					"extraction_data",
					JSON.stringify(extractionResults)
				);
			}

			const response = await server.post( "/newHomeOwners/documentLlm/generateDesignDocument", formData,
				{
					responseType: "blob", // Tell axios to expect binary data
				}
			);

			// Get PDF blob
			const blob = response.data;

			// Create download URL
			const url = window.URL.createObjectURL(blob);
			setGeneratedPdfUrl(url);

			// Auto-download
			const link = document.createElement("a");
			link.href = url;
			link.download = `interior_design_proposal_${Date.now()}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
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
				// The request was made but no response was received
				errorMessage =
					"No response from server. Please check your connection.";
			} else {
				// Something happened in setting up the request
				errorMessage = err.message || errorMessage;
			}

			setError(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Box w="100%" maxW="800px" mx="auto" py={10}>
			<VStack gap={6} align="stretch">
				<Box textAlign="center">
					<Heading fontSize="2xl" mb={2}>
						Generate Your Design Document
					</Heading>

					<Text color="gray.600" mb={6} fontSize="sm">
						Our AI will analyze your floor plan, preferences, and
						budget to create a comprehensive interior design
						proposal that you can share with designers.
					</Text>
				</Box>

				{/* Document Preview Info */}
				<Box
					p={6}
					bg="gray.50"
					borderRadius="lg"
					border="1px solid"
					borderColor="gray.200"
				>
					<Heading fontSize="md" mb={3}>
						Your document will include:
					</Heading>
					<VStack align="start" gap={2}>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Executive summary and design philosophy
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Room-by-room space analysis
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Color palette and material recommendations
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">
								Furniture suggestions with cost estimates
							</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">Detailed budget breakdown</Text>
						</Flex>
						<Flex align="center" gap={2}>
							<Box
								w="6px"
								h="6px"
								bg="#D4AF37"
								borderRadius="full"
							/>
							<Text fontSize="sm">Implementation timeline</Text>
						</Flex>
					</VStack>
				</Box>

				{/* Error Display */}
				{error && (
					<Box
						p={4}
						bg="red.50"
						borderRadius="md"
						border="1px solid"
						borderColor="red.200"
					>
						<Text color="red.600" fontSize="sm">
							{error}
						</Text>
					</Box>
				)}

				{/* Before Generation */}
				{!generatedPdfUrl && (
					<>
						{/* Chatbot CTA Button - PRIMARY */}
						<Button
							size="xl"
							bg="#D4AF37"
							color="white"
							_hover={{ bg: "#C9A961" }}
							w="100%"
							h="60px"
							fontSize="lg"
							leftIcon={<IoSparkles />}
							onClick={() => navigate("/chatbot")}
						>
							Chat with our chatbot to get a more cohesive report
						</Button>

						{/* Skip & Generate Button - SECONDARY */}
						<Button
							size="xl"
							variant="outline"
							borderColor="#D4AF37"
							color="#D4AF37"
							bg="transparent"
							_hover={{ bg: "yellow.50" }}
							onClick={handleGenerateDocument}
							disabled={isGenerating || !floorPlanFile}
							leftIcon={isGenerating ? <Spinner size="sm" /> : <IoSparkles />}
							w="100%"
							h="60px"
							fontSize="lg"
						>
							{isGenerating
								? "Generating Your Document..."
								: "Skip and generate design document now"}
						</Button>
					</>
				)}

				{/* After Generation */}
				{generatedPdfUrl && !isGenerating && (
					<>
						{/* Generate Again Button - PRIMARY */}
						<Button
							size="xl"
							bg="#D4AF37"
							color="white"
							_hover={{ bg: "#C9A961" }}
							onClick={handleGenerateDocument}
							disabled={isGenerating || !floorPlanFile}
							leftIcon={<IoSparkles />}
							w="100%"
							h="60px"
							fontSize="lg"
						>
							Generate Again
						</Button>

						{/* Download Again Button - SECONDARY */}
						<Button
							size="xl"
							variant="outline"
							borderColor="#D4AF37"
							color="#D4AF37"
							bg="transparent"
							_hover={{ bg: "yellow.50" }}
							leftIcon={<FaDownload />}
							onClick={() => {
								const link = document.createElement("a");
								link.href = generatedPdfUrl;
								link.download = `interior_design_proposal_${Date.now()}.pdf`;
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
							}}
							w="100%"
							h="60px"
							fontSize="lg"
						>
							Download Again
						</Button>
					</>
				)}

				<Text fontSize="xs" color="gray.500" textAlign="center">
					Generation typically takes 30-60 seconds. Your document will
					download automatically.
				</Text>
			</VStack>
		</Box>
	);
}

export default GenerateDesignDocument;
