import { useEffect, useState } from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";
import { Client } from "@gradio/client";

function AIExtraction({ file, onComplete }) {
	const [status, setStatus] = useState("processing");

	useEffect(() => {
		if (!file) return;

        // Call api call in backend later
		const runExtraction = async () => {
			try {
				setStatus("processing");

				const client = await Client.connect(
					"https://tallmanager267-sg-room-segmentation.hf.space/"
				);

				const result = await client.predict("/predict", {
					pil_img: file.file,
				});

				console.log("AI Extraction Result:", result.data);

				setStatus("completed");

				setTimeout(() => {
					if (onComplete) {
						onComplete(result.data);
					}
				}, 1500);
			} catch (error) {
				console.error("AI Extraction Error:", error);
				setStatus("error");
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
					<Text fontSize="sm" color="gray.500" mt={2}>
                        Our AI will extract the unit information and segment out the rooms in the floor plan
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
					<Text fontSize="2xl" fontWeight="600" color="red.600">
						Extraction Failed
					</Text>
					<Text fontSize="sm" color="gray.500" mt={2}>
						Please try again or contact support
					</Text>
				</>
			)}
		</Box>
	);
}

export default AIExtraction;
