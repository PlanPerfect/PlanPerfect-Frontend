import { useEffect, useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import server from "../../../networking";

function AIExtraction({ file, onComplete }) {
	const [status, setStatus] = useState("processing");
	const [progress, setProgress] = useState("Preparing...");

	useEffect(() => {
		if (!file) return;

		const runExtraction = async () => {
			try {
				setStatus("processing");

				// Step 1: Room Segmentation
				setProgress("Segmenting rooms from floor plan...");

				const segmentationFormData = new FormData();
				// Append the actual File object with the correct field name
				segmentationFormData.append("file", file.file);

				const segmentationResponse = await server.post(
					"/newHomeOwners/extraction/roomSegmentation",
					segmentationFormData
				);

				if (!segmentationResponse.data.success) {
					throw new Error("Room segmentation failed");
				}

				const segmentedImage =
					segmentationResponse.data.result.segmented_image;

				// Step 2: Unit Information Extraction
				setProgress("Extracting unit information...");

				const extractionFormData = new FormData();
				// Append the actual File object with the correct field name
				extractionFormData.append("file", file.file);

				const extractionResponse = await server.post(
					"/newHomeOwners/extraction/unitInformationExtraction",
					extractionFormData
				);

				if (!extractionResponse.data.success) {
					throw new Error("Unit information extraction failed");
				}

				const unitInfo = extractionResponse.data.result;

				// Combine both results
				const combinedResults = {
					segmentedImage: segmentedImage,
					unitInfo: unitInfo,
				};

				setStatus("completed");

				// Auto-advance to next step after showing completion
				setTimeout(() => {
					if (onComplete) {
						onComplete(combinedResults);
					}
				}, 1500);
			} catch (error) {
				console.error("AI Extraction Error:", error);
				console.error("Error response:", error.response?.data);
				setStatus("error");

				// More detailed error message
				let errorMessage = "Extraction failed";
				if (error.response?.data?.result) {
					errorMessage = error.response.data.result;
				} else if (error.response?.data?.detail) {
					errorMessage = JSON.stringify(error.response.data.detail);
				} else if (error.message) {
					errorMessage = error.message;
				}

				setProgress(errorMessage);
			}
		};

		runExtraction();
	}, [file]);

	return (
		<Box textAlign="center" py={10}>
			{status === "processing" && (
				<>
					<Spinner size="xl" color="#D4AF37" mb={4} />
					<Text fontSize="2xl" fontWeight="600">
						Extracting rooms using AI…
					</Text>
					<Text fontSize="md" color="#D4AF37" mt={2} fontWeight="500">
						{progress}
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Our AI will extract the unit information and segment out
						the rooms in the floor plan
					</Text>
				</>
			)}

			{status === "completed" && (
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

			{status === "error" && (
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
					<Text fontSize="sm" color="gray.500" mt={2}>
						{progress}
					</Text>
					<Text fontSize="xs" color="gray.400" mt={1}>
						Please try again or contact support
					</Text>
				</>
			)}
		</Box>
	);
}

export default AIExtraction;
