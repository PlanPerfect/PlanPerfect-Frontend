import { useState, useEffect } from "react";
import { Box, Text, Spinner, Button } from "@chakra-ui/react";
import server from "../../../networking";

function AIExtraction({ file, onComplete, startExtraction }) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isPreparing, setIsPreparing] = useState(false);
	const [isSegmenting, setIsSegmenting] = useState(false);
	const [isExtracting, setIsExtracting] = useState(false);
	const [hasCompleted, setHasCompleted] = useState(false);
	const [hasError, setHasError] = useState(false);

	// Automatically start extraction
	useEffect(() => {
		if (startExtraction && file && !isProcessing && !hasCompleted && !hasError) {
			runExtraction();
		}
	}, [startExtraction, file, onComplete]);

	const runExtraction = async () => {
		try {
			setIsProcessing(true);
			setIsPreparing(true);

			// Step 1: Room Segmentation
			setIsPreparing(false);
			setIsSegmenting(true);

			const segmentationFormData = new FormData();
			segmentationFormData.append("file", file.file);

			const segmentationResponse = await server.post(
				"/newHomeOwners/extraction/roomSegmentation",
				segmentationFormData
			);

			if (!segmentationResponse.data.success) {
				console.error("Room segmentation failed:", segmentationResponse?.data);
			}

			const segmentedImage = segmentationResponse.data.result.segmented_image;

			// Step 2: Unit Information Extraction
			setIsSegmenting(false);
			setIsExtracting(true);

			const extractionFormData = new FormData();
			extractionFormData.append("file", file.file);

			const extractionResponse = await server.post(
				"/newHomeOwners/extraction/unitInformationExtraction",
				extractionFormData
			);

			if (!extractionResponse.data.success) {
				console.error("Unit information extraction failed:", extractionResponse?.data);
			}

			const unitInfo = extractionResponse.data.result;

			// Combine results
			const combinedResults = {
				segmentedImage: segmentedImage,
				unitInfo: unitInfo,
			};

			setIsExtracting(false);
			setIsProcessing(false);
			setHasCompleted(true);

			// Auto-advance to next step after showing completion with 1.5s delay
			setTimeout(() => {
				if (onComplete) {
					onComplete(combinedResults);
				}
			}, 1500);
		} catch (error) {
			console.error("AI Extraction Error Response:", error);
			
			setIsPreparing(false);
			setIsSegmenting(false);
			setIsExtracting(false);
			setIsProcessing(false);
			setHasError(true);
		}
	};

	const handleRetry = () => {
		setHasError(false);
		runExtraction();
	};

	// Generate progress message based on current stage
	const getProgressMessage = () => {
		if (isPreparing) return "Preparing...";
		if (isSegmenting) return "Segmenting rooms from floor plan...";
		if (isExtracting) return "Extracting unit information...";
		return "";
	};

	return (
		<Box textAlign="center" py={10}>
			{/* Ai extracting */}
			{isProcessing && (
				<>
					<Spinner size="xl" color="#D4AF37" mb={4} />
					<Text fontSize="2xl" fontWeight="600">
						Extracting rooms using AI…
					</Text>
					<Text fontSize="md" color="#D4AF37" mt={2} fontWeight="500">
						{getProgressMessage()}
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Our AI will extract the unit information and segment out
						the rooms in the floor plan
					</Text>
				</>
			)}

			{/* Extraction complete */}
			{hasCompleted && (
				<>
					<Box
						w="48px"
						h="48px"
						borderRadius="full"
						bg="green.500"
						display="flex"
						alignItems="center"
						justifyContent="center"
						mx="auto"
						mb={4}
					>
						<Text color="white" fontSize="2xl">
							✓
						</Text>
					</Box>
					<Text fontSize="2xl" fontWeight="600" color="green.600">
						Extraction Complete!
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Moving to next step...
					</Text>
				</>
			)}

			{/* Extraction error */}
			{hasError && (
				<>
					<Box
						w="48px"
						h="48px"
						borderRadius="full"
						bg="red.500"
						display="flex"
						alignItems="center"
						justifyContent="center"
						mx="auto"
						mb={4}
					>
						<Text color="white" fontSize="2xl">
							✕
						</Text>
					</Box>
					<Text fontSize="2xl" fontWeight="600" color="red.600">
						Extraction Failed
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2} mb={4}>
						An error occurred during extraction
					</Text>
					<Button
						onClick={handleRetry}
						bg="#D4AF37"
						color="white"
						size="md"
						px={6}
						_hover={{ bg: "#C19B2F" }}
					>
						Try Again
					</Button>
				</>
			)}
		</Box>
	);
}

export default AIExtraction;