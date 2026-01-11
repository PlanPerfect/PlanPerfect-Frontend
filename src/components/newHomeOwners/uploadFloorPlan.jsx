import { Box, Flex, Heading, Text, IconButton, FileUpload, Image } from "@chakra-ui/react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

function UploadFloorPlan() {
	const [uploadedFile, setUploadedFile] = useState(null);
	const [error, setError] = useState("");

	const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
	const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];

	const handleFileAccept = (details) => {
		const file = details.files[0];

		if (!file) return;

		// Check file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			setError("Only PNG, JPG and JPEG files are allowed");
			return;
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			setError("File size must be less than 15MB");
			return;
		}

		setError("");
		setUploadedFile({
			name: file.name,
			size: formatFileSize(file.size),
			preview: URL.createObjectURL(file),
			file: file,
		});
	};

	const handleRemoveFile = () => {
		if (uploadedFile?.preview) {
			URL.revokeObjectURL(uploadedFile.preview);
		}
		setUploadedFile(null);
		setError("");
	};

	const formatFileSize = (bytes) => {
		if (bytes >= 1024 * 1024) {
			return (bytes / (1024 * 1024)).toFixed(1) + "MB";
		}
		return (bytes / 1024).toFixed(0) + "KB";
	};

	return (
		<Box w="100%" maxW="800px" mx="auto" p={8}>
			<Heading size="xl" textAlign="center" mb={4}>
				Upload Floor Plan
			</Heading>
			<Text textAlign="center" color="gray.700" mb={8} fontSize="sm">
				Uploading your floor plan not only helps your designer
				understand your unit, but it will also be included in your final
				design documentation
			</Text>

			<FileUpload.Root
				accept={["image/png", "image/jpeg", "image/jpg"]}
				maxFiles={1}
				onFileAccept={handleFileAccept}
			>
				{/* Drag and Drop Area */}
				<FileUpload.Dropzone
					border="2px dashed"
					borderColor="gray.300"
					borderRadius="10px"
					bg="white"
					p={12}
					textAlign="center"
					cursor="pointer"
					transition="all 0.2s"
					mb={6}
					w="100%"
					_hover={{
						borderColor: "#D4AF37",
						bg: "#FFFDF7",
					}}
				>
					<Flex direction="column" align="center" gap={4}>
						{/* Floor Plan Icon */}
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Image
								src="/uploadFloorPlanImage.svg"
								alt="Floor Plan Icon"
								width="80px"
								height="80px"
							/>
						</Box>

						<Box>
							<FileUpload.Trigger asChild>
								<Text fontSize="md" fontWeight="500">
									Drop your image here, or{" "}
									<Text
										as="span"
										color="#D4AF37"
										cursor="pointer"
										fontWeight="600"
									>
										browse
									</Text>
								</Text>
							</FileUpload.Trigger>
							<Text fontSize="sm" color="gray.500" mt={2}>
								Supports: PNG, JPG and JPEG
							</Text>
							<Text fontSize="sm" color="gray.500">
								Max File Size: 1 File, 15MB
							</Text>
						</Box>
					</Flex>
				</FileUpload.Dropzone>

				<FileUpload.HiddenInput />
			</FileUpload.Root>

			{/* Error Message */}
			{error && (
				<Box
					bg="red.50"
					border="1px solid"
					borderColor="red.300"
					borderRadius="8px"
					p={3}
					mb={4}
				>
					<Text color="red.600" fontSize="sm">
						{error}
					</Text>
				</Box>
			)}

			{/* Uploaded File Display */}
			{uploadedFile && (
				<Box
					border="2px solid"
					borderColor="#D4AF37"
					borderRadius="10px"
					p={4}
					bg="white"
					mb={6}
				>
					<Flex align="center" justify="space-between">
						<Flex align="center" gap={3}>
							{/* File Preview Thumbnail */}
							<Box
								w="50px"
								h="50px"
								border="1px solid"
								borderColor="gray.300"
								borderRadius="8px"
								overflow="hidden"
								bg="gray.50"
							>
								<Image
									src={uploadedFile.preview}
									alt="Preview"
									width="100%"
									height="100%"
									objectFit="cover"
								/>
							</Box>

							{/* File Info */}
							<Box textAlign="left">
								<Text fontWeight="600" fontSize="md">
									{uploadedFile.name}
								</Text>
								<Text fontSize="sm" color="gray.600">
									{uploadedFile.size}
								</Text>
							</Box>
						</Flex>

						{/* Remove Button */}
						<IconButton
							onClick={handleRemoveFile}
							bg="red.500"
							color="white"
							borderRadius="full"
							size="sm"
							_hover={{ bg: "red.600" }}
						>
							<IoClose size={20} />
						</IconButton>
					</Flex>
				</Box>
			)}
		</Box>
	);
}

export default UploadFloorPlan;
