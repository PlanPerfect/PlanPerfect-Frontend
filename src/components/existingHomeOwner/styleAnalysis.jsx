import { useEffect, useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import server from "../../../networking";

function StyleAnalysis({ file, onComplete }) {
	const [status, setStatus] = useState("processing");
	const [progress, setProgress] = useState("Preparing...");
	const { user } = useAuth();

	useEffect(() => {
		if (!file) return;

		const runAnalysis = async () => {
			try {
				setStatus("processing");
				setProgress("Analyzing your room style...");

				const formData = new FormData();
				formData.append("file", file.file);

                const response = await server.post(
               		"/existingHomeOwners/styleClassification/styleAnalysis",
                	formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
							"X-User-ID": user.uid,
						},
					}
                );

				const result = response.data.result;

				setStatus("completed");

				// Auto-advance to next step after showing completion
				setTimeout(() => {
					if (onComplete) {
						onComplete(result);
					}
				}, 1500);
			} catch (error) {
				console.error("Style Analysis Error:", error);
				console.error("Error response:", error.response?.data);
				setStatus("error");

				// More detailed error message
				let errorMessage = "Analysis failed";
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

		runAnalysis();
	}, [file]);

	return (
		<Box textAlign="center" py={10}>
			{status === "processing" && (
				<>
					<Spinner size="xl" color="#D4AF37" mb={4} />
					<Text fontSize="2xl" fontWeight="600">
						Analyzing your room style using AI…
					</Text>
					<Text fontSize="md" color="#D4AF37" mt={2} fontWeight="500">
						{progress}
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Our AI will detect your interior design style and
						identify furniture in your room
					</Text>
				</>
			)}

			{status === "completed" && (
				<>
					<Box w="48px" h="48px" borderRadius="full" bg="green.500" display="flex" alignItems="center" justifyContent="center"
						mx="auto" mb={4}>
						<Text color="white" fontSize="2xl">
							✓
						</Text>
					</Box>
					<Text fontSize="2xl" fontWeight="600" color="green.600">
						Analysis Complete!
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Moving to results...
					</Text>
				</>
			)}

			{status === "error" && (
				<>
					<Box w="48px" h="48px" borderRadius="full" bg="red.500" display="flex" alignItems="center" justifyContent="center"
						mx="auto" mb={4}
					>
						<Text color="white" fontSize="2xl">
							✕
						</Text>
					</Box>
					<Text fontSize="2xl" fontWeight="600" color="red.600">
						Analysis Failed
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

export default StyleAnalysis;