import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Flex, Heading, Text, VStack, Button, Spinner } from "@chakra-ui/react";
import { FileText, Download, RefreshCw, CheckCircle, AlertCircle, ClipboardList } from "lucide-react";
import LandingBackground from "../../assets/LandingBackground.png";
import server from "../../../networking";
import ShowToast from "@/Extensions/ShowToast";
import { useAuth } from "../../contexts/AuthContext";

function DesignDocumentPage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const [isLoadingFlow, setIsLoadingFlow] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState(null);
	const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
	const [noFlow, setNoFlow] = useState(false);
	const [userFlow, setUserFlow] = useState(null);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	useEffect(() => {
		const fetchUserFlow = async () => {
			if (!user?.uid) {
				setNoFlow(true);
				setIsLoadingFlow(false);
				return;
			}

			try {
				const res = await server.get(`/designDocument/checkFlow/${user.uid}`);
				const flow = res.data?.result?.flow ?? null;
				if (!flow) {
					setNoFlow(true);
					ShowToast("info", "Onboarding Incomplete", "Let us analyse your style first", {
						action: {
							label: "Take me there",
							onClick: () => navigate("/onboarding")
						},
						duration: 6000
					});
				} else {
					setUserFlow(flow);
				}
			} catch (err) {
				console.error("Error fetching user flow:", err);
				setNoFlow(true);
				ShowToast("error", "Could not determine your profile type", "Please try again.");
			} finally {
				setIsLoadingFlow(false);
			}
		};

		fetchUserFlow();
	}, [user?.uid]);

	useEffect(() => {
		if (userFlow) {
			generateDocument(userFlow);
		}
	}, [userFlow]);

	const savePdfToCloud = async (pdfBlob, flow) => {
		const formData = new FormData();
		const timestamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
		const pdfFile = new File([pdfBlob], `design_document_${timestamp}.pdf`, { type: "application/pdf" });
		formData.append("pdf_file", pdfFile);

		const endpoint =
			flow === "existingHomeOwner"
				? `/designDocument/existingHomeOwnerDocumentLlm/savePdf/${user.uid}`
				: `/designDocument/newHomeOwnerDocumentLlm/savePdf/${user.uid}`;

		const res = await server.post(endpoint, formData);
		return res.data.result.pdf_url;
	};

	const generateDocument = async (flow) => {
		setIsGenerating(true);
		setError(null);
		setGeneratedPdfUrl(null);

		try {
			const endpoint =
				flow === "existingHomeOwner"
					? `/designDocument/existingHomeOwnerDocumentLlm/generateDesignDocument/${user.uid}`
					: `/designDocument/newHomeOwnerDocumentLlm/generateDesignDocument/${user.uid}`;

			const response = await server.post(endpoint, {}, { responseType: "blob" });

			const blob = response.data;
			await savePdfToCloud(blob, flow);

			const url = window.URL.createObjectURL(blob);
			setGeneratedPdfUrl(url);

			ShowToast("success", "Success!", "Design document generated successfully!");
		} catch (err) {
			console.error("Error generating document:", err);

			let errorMessage = "Failed to generate design document";

			if (err?.response?.data?.detail) {
				const d = err.response.data.detail;
				errorMessage = d.startsWith("UERROR: ") ? d.slice("UERROR: ".length)
					: d.startsWith("ERROR: ") ? d.slice("ERROR: ".length)
					: d;
			} else if (err?.response?.data?.error) {
				const e = err.response.data.error;
				errorMessage = e.startsWith("UERROR: ") ? e.slice("UERROR: ".length)
					: e.startsWith("ERROR: ") ? e.slice("ERROR: ".length)
					: e;
			} else {
				errorMessage = "An unexpected error occurred. Check console for more details.";
			}

			setError(errorMessage);
			ShowToast("error", errorMessage, "Check console for more details.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = async () => {
		if (!generatedPdfUrl) return;

		const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").split(".")[0];
		const filename = userFlow === "existingHomeOwner"
			? `renovation_design_document_${timestamp}.pdf`
			: `design_document_${timestamp}.pdf`;

		const link = document.createElement("a");
		link.href = generatedPdfUrl;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		const sendClientEmail = await server.post(`/designDocument/clientConfirmationEmail/${user.uid}`);
		if (!sendClientEmail.data.success) {
			console.error("Failed to send confirmation email:", sendClientEmail.data.message);
		}

		ShowToast("success", "Success!", "PDF downloaded successfully! An Confirmation email has also been sent to you, Please check your inbox (and spam folder just in case) for details on how to proceed with your design document.");
	};

	const handleRegenerate = () => {
		if (userFlow) generateDocument(userFlow);
	};

	const isSuccess = !isLoadingFlow && !isGenerating && !error && generatedPdfUrl;

	const getHeaderSubtitle = () => {
		if (isLoadingFlow) return "Checking your profile...";
		if (isGenerating) return "Generating your personalised design document...";
		if (noFlow) return "Onboarding required";
		if (error) return "Generation failed";
		return "Your document is ready";
	};

	const getGeneratingMessage = () =>
		userFlow === "existingHomeOwner"
			? "Our AI is creating a comprehensive renovation proposal. This may take a moment..."
			: "Our AI is creating a comprehensive interior design proposal. This may take a moment...";

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
					mt={{ base: 0, md: isSuccess ? "10vh" : 0 }}
					height={{ base: "calc(90vh - 12rem)", md: isSuccess ? "85vh" : "75vh" }}
					variant="elevated"
					borderRadius={{ base: 20, md: 35 }}
					style={glassStyle}
					overflow="hidden"
				>
					{/* Header */}
					<Box borderBottom="1px solid rgba(255, 255, 255, 0.2)" p={{ base: 4, md: 6 }} bg="rgba(255, 255, 255, 0.05)">
						<Flex align="center" gap={3}>
							<Box bg="rgba(255, 240, 189, 0.2)" p={2} borderRadius="full">
								<FileText size={24} color="#fff0bd" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading size={{ base: "md", md: "lg" }} color="white" textShadow="0 2px 4px rgba(0,0,0,0.2)">
									{userFlow === "existingHomeOwner" ? "Renovation Document Generator" : "Design Document Generator"}
								</Heading>
								<Text fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.7)">
									{getHeaderSubtitle()}
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
							"&::-webkit-scrollbar": { width: "8px" },
							"&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
							"&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
							"&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.4)" }
						}}
					>
						<VStack gap={6} align="stretch" h="100%" justify="center">

							{/* Checking flow from DB */}
							{isLoadingFlow && (
								<VStack gap={4} animation="fadeInUp 0.4s ease-out">
									<Spinner size="xl" color="#fff0bd" thickness="4px" />
									<Heading size="lg" color="white" textAlign="center">
										Loading Your Profile
									</Heading>
									<Text color="rgba(255, 255, 255, 0.7)" textAlign="center" maxW="400px">
										Checking your onboarding status...
									</Text>
								</VStack>
							)}

							{/* Generating */}
							{!isLoadingFlow && isGenerating && (
								<VStack gap={4} animation="fadeInUp 0.4s ease-out">
									<Spinner size="xl" color="#fff0bd" thickness="4px" />
									<Heading size="lg" color="white" textAlign="center">
										{userFlow === "existingHomeOwner"
											? "Generating Your Renovation Document"
											: "Generating Your Design Document"}
									</Heading>
									<Text color="rgba(255, 255, 255, 0.7)" textAlign="center" maxW="500px">
										{getGeneratingMessage()}
									</Text>
								</VStack>
							)}

							{/* No flow / Onboarding incomplete */}
							{!isLoadingFlow && !isGenerating && noFlow && (
								<VStack gap={5} animation="fadeInUp 0.4s ease-out">
									<Box bg="rgba(255, 193, 7, 0.15)" p={4} borderRadius="full">
										<ClipboardList size={48} color="#ffc107" />
									</Box>
									<Heading size="lg" color="white" textAlign="center">
										Onboarding Incomplete
									</Heading>
									<Text color="rgba(255, 255, 255, 0.7)" textAlign="center" maxW="480px">
										You need to complete at least one onboarding flow <br />
										<strong style={{ color: "white" }}>New Home Owner</strong> or{" "}
										<strong style={{ color: "white" }}>Existing Home Owner</strong>
										<br /> before generating your design document.
									</Text>
									<Button
										size="lg"
										bg="#D4AF37"
										color="white"
										_hover={{ bg: "#C9A961" }}
										onClick={() => navigate("/onboarding")}
										leftIcon={<ClipboardList size={20} />}
									>
										Go to Onboarding
									</Button>
								</VStack>
							)}

							{/* Error */}
							{!isLoadingFlow && !isGenerating && !noFlow && error && (
								<VStack gap={4} animation="fadeInUp 0.4s ease-out">
									<AlertCircle size={48} color="#ff6b6b" />
									<Heading size="lg" color="white" textAlign="center">
										Generation Failed
									</Heading>
									<Text color="rgba(255, 255, 255, 0.7)" textAlign="center" maxW="500px">
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

							{/* Success + PDF Preview */}
							{isSuccess && (
								<VStack gap={6} align="stretch" h="100%" animation="fadeInUp 0.4s ease-out">
									<VStack gap={3} animation="successFade 3s ease-out forwards">
										<Box bg="rgba(76, 175, 80, 0.2)" p={4} borderRadius="full">
											<CheckCircle size={40} color="#4caf50" />
										</Box>
										<Heading size="md" color="white" textAlign="center">
											Document Generated Successfully!
										</Heading>
										<Text color="rgba(255, 255, 255, 0.7)" textAlign="center" fontSize="sm">
											Preview your {userFlow === "existingHomeOwner" ? "renovation design" : "design"} document below
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
											style={{ width: "100%", height: "100%", border: "none", minHeight: "800px" }}
											title="PDF Preview"
										/>
									</Box>

									{/* Action Buttons */}
									<Flex gap={3} direction={{ base: "column", md: "row" }}>
										<Button
											flex="1"
											size="lg"
											variant="outline"
											borderColor="rgba(255, 255, 255, 0.3)"
											color="white"
											_hover={{ bg: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.5)" }}
											onClick={handleRegenerate}
											leftIcon={<RefreshCw size={20} />}
										>
											Regenerate
										</Button>
										<Button
											flex="1"
											size="lg"
											bg="#D4AF37"
											color="white"
											_hover={{ bg: "#C9A961" }}
											onClick={handleDownload}
											leftIcon={<Download size={20} />}
										>
											Download PDF & Assign Me A Designer 
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
						from { opacity: 0; transform: translateY(20px); }
						to { opacity: 1; transform: translateY(0); }
					}
					@keyframes pulse {
						0%, 100% { opacity: 1; }
						50% { opacity: 0.5; }
					}
					@keyframes successFade {
						0% { opacity: 1; transform: translateY(0); max-height: 200px; }
						70% { opacity: 1; transform: translateY(0); max-height: 200px; }
						100% { opacity: 0; transform: translateY(-20px); max-height: 0; margin: 0; padding: 0; }
					}
				`}
			</style>
		</>
	);
}

export default DesignDocumentPage;