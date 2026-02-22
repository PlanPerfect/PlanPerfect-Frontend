import { Box, Flex, Heading, Text, IconButton, FileUpload, Image } from "@chakra-ui/react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

function UploadRoomImage({ onFileChange, onFileSelected }) {
	const [uploadedFile, setUploadedFile] = useState(null);
	const [confirmed, setConfirmed] = useState(false);
	const [error, setError] = useState("");

	const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
	const ALLOWED_TYPES = ["image/png", "image/jpg", "image/jpeg"];

	const handleFileAccept = details => {
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
		setConfirmed(false);
		setUploadedFile({
			name: file.name,
			size: formatFileSize(file.size),
			preview: URL.createObjectURL(file),
			file: file
		});
		onFileSelected?.(true); // notify parent a file is selected
	};

	const handleConfirm = () => {
		setConfirmed(true);
		onFileChange({
			name: uploadedFile.name,
			size: uploadedFile.size,
			preview: uploadedFile.preview,
			file: uploadedFile.file
		});
	};

	const handleRemoveFile = () => {
		if (uploadedFile?.preview) {
			URL.revokeObjectURL(uploadedFile.preview);
		}
		setUploadedFile(null);
		setConfirmed(false);
		setError("");
		onFileChange(null);
		onFileSelected?.(false); // notify parent file was removed
	};

	const formatFileSize = bytes => {
		if (bytes >= 1024 * 1024) {
			return (bytes / (1024 * 1024)).toFixed(1) + "MB";
		}
		return (bytes / 1024).toFixed(0) + "KB";
	};

	return (
		<Box w="100%" maxW="800px" mx="auto" p={8}>
			<Heading size="2xl" textAlign="center" mb={4}>
				Upload a Photo
			</Heading>
			<Text textAlign="center" color="gray.600" mb={8} fontSize="sm">
				Upload a photo of your room or ideal interior style below to help our chat bot analyze its style and layout.
			</Text>

			<FileUpload.Root accept={["image/png", "image/jpeg", "image/jpg"]} maxFiles={1} onFileAccept={handleFileAccept}>
				{/* Drag and Drop Area */}
				<FileUpload.Dropzone border="2px dashed" borderColor="gray.300" borderRadius="10px" bg="white" p={12} textAlign="center" cursor="pointer" 
					transition="all 0.2s" mb={6} w="100%"
					_hover={{
						borderColor: "#D4AF37",
						bg: "#FFFDF7"
					}}
				>
					<Flex direction="column" align="center" gap={4}>
						{/* Room Image Icon */}
						<Box display="flex" alignItems="center" justifyContent="center" fontSize="60px">
							📤
						</Box>

						<Box>
							<Text fontSize="md" fontWeight="500">
								Drop your image here, or{" "}
								<Text as="span" color="#D4AF37" cursor="pointer" fontWeight="600">
									browse
								</Text>
							</Text>
							<FileUpload.Trigger asChild>
								<Text fontSize="md" color="gray.600">
									Supports: PNG, JPG and JPEG
								</Text>
							</FileUpload.Trigger>
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
				<Box bg="red.50" border="1px solid" borderColor="red.300" borderRadius="8px" p={3} mb={4}>
					<Text color="red.600" fontSize="sm">
						{error}
					</Text>
				</Box>
			)}

			{/* Uploaded File Display */}
			{uploadedFile && (
				<Box>
					{/* Full Image Preview */}
					<Box border="2px solid" borderColor="#D4AF37" borderRadius="12px" overflow="hidden" mb={4} bg="white">
						<Image src={uploadedFile.preview} alt="Room Preview" width="100%" maxH="400px" objectFit="contain" />
					</Box>

					{/* File info + remove row */}
					<Box border="1px solid" borderColor="gray.200" borderRadius="10px" p={4} bg="white" mb={4}>
						<Flex align="center" justify="space-between">
							<Flex align="center" gap={3}>
								<Box w="50px" h="50px" border="1px solid" borderColor="gray.300" borderRadius="8px" overflow="hidden" bg="gray.50">
									<Image src={uploadedFile.preview} alt="Preview" width="100%" height="100%" objectFit="cover" />
								</Box>
								<Box textAlign="left">
									<Text fontWeight="600" fontSize="md">{uploadedFile.name}</Text>
									<Text fontSize="sm" color="gray.600">{uploadedFile.size}</Text>
								</Box>
							</Flex>
							<IconButton onClick={handleRemoveFile} bg="red.500" color="white" borderRadius="full" size="sm" _hover={{ bg: "red.600" }}>
								<IoClose size={20} />
							</IconButton>
						</Flex>
					</Box>

					{/* Confirm / confirmed state */}
					{!confirmed ? (
						<Flex justify="center">
							<Box as="button" onClick={handleConfirm} bg="linear-gradient(135deg, #D4AF37 0%, #C9A961 100%)"
								color="white" px={10} py={3} borderRadius="md" fontSize="md"
								fontWeight="700" cursor="pointer"
								_hover={{ opacity: 0.9, transform: "translateY(-2px)", boxShadow: "lg" }}
								transition="all 0.2s"
							>
								Use This Photo ✨
							</Box>
						</Flex>
					) : (
						<Flex justify="center">
							<Text color="green.600" fontWeight="600" fontSize="md">✅ Photo confirmed — analysing your room style...</Text>
						</Flex>
					)}
				</Box>
			)}
		</Box>
	);
}

export default UploadRoomImage;