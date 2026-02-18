import { useState, useRef, useEffect } from "react";
import { Box, Flex, Heading, Text, Textarea, VStack, HStack, IconButton, Image } from "@chakra-ui/react";
import { Send, Sparkles, Loader2, Paperclip, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/firebase";
import LandingBackground from "../../assets/LandingBackground.png";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

const renderInline = (text) => {
	if (!text) return text;
	const regex = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g;
	const segments = text.split(regex);
	return segments.map((seg, i) => {
		if (seg.startsWith("**") && seg.endsWith("**")) {
			return (
				<strong key={i} style={{ fontWeight: 700, color: "rgba(255,255,255,1)" }}>
					{seg.slice(2, -2)}
				</strong>
			);
		}
		if (seg.startsWith("*") && seg.endsWith("*") && !seg.startsWith("**")) {
			return <em key={i}>{seg.slice(1, -1)}</em>;
		}
		if (seg.startsWith("`") && seg.endsWith("`")) {
			return (
				<code
					key={i}
					style={{
						background: "rgba(255,255,255,0.12)",
						padding: "1px 5px",
						borderRadius: "3px",
						fontFamily: "monospace",
						fontSize: "0.88em"
					}}
				>
					{seg.slice(1, -1)}
				</code>
			);
		}
		return seg;
	});
};

const renderMessageContent = (content) => {
	if (!content) return null;
	const elements = [];
	const normalizedContent = content
		.replace(/\r\n/g, "\n")
		.replace(/([:;])\s+(\d+\.\s+)/g, "$1\n$2")
		.replace(/([:;])\s+([•*-]\s+)/g, "$1\n$2")
		.replace(/\s-\s(?=[A-Z0-9])/g, "\n- ");
	const lines = normalizedContent.split("\n");

	for (let i = 0; i < lines.length; i += 1) {
		const key = `line-${i}`;
		let trimmed = lines[i].trim();

		if (/^\d+\.$/.test(trimmed)) {
			let nextLineIndex = i + 1;
			while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
				nextLineIndex += 1;
			}

			if (nextLineIndex < lines.length) {
				const nextText = lines[nextLineIndex].trim();
					if (nextText && !/^(\d+\.|[-*•]\s|#{1,3}\s)/.test(nextText)) {
					trimmed = `${trimmed} ${nextText}`;
					i = nextLineIndex;
				}
			}
		}
		if (/^[•*-]$/.test(trimmed)) {
			let nextLineIndex = i + 1;
			while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === "") {
				nextLineIndex += 1;
			}

			if (nextLineIndex < lines.length) {
				const nextText = lines[nextLineIndex].trim();
				if (nextText && !/^(\d+\.|[-*•]\s|#{1,3}\s)/.test(nextText)) {
					trimmed = `${trimmed} ${nextText}`;
					i = nextLineIndex;
				}
			}
		}

		if (trimmed.startsWith("### ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="0.95em" color="rgba(255,255,255,0.98)" mt={2} mb={0.5}>
					{renderInline(trimmed.slice(4))}
				</Text>
			);
		} else if (trimmed.startsWith("## ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="1.05em" color="rgba(255,255,255,0.98)" mt={2} mb={1}>
					{renderInline(trimmed.slice(3))}
				</Text>
			);
		} else if (trimmed.startsWith("# ")) {
			elements.push(
				<Text key={key} fontWeight="700" fontSize="1.15em" color="rgba(255,255,255,0.98)" mt={2} mb={1}>
					{renderInline(trimmed.slice(2))}
				</Text>
			);
		} else if (/^([-*]|•)\s+/.test(trimmed)) {
			elements.push(
				<Flex key={key} gap={2} align="flex-start" pl={2} mb={0.5}>
					<Text color="rgba(255,215,0,0.8)" flexShrink={0} lineHeight="1.8">
						•
					</Text>
					<Text color="rgba(255,255,255,0.95)" lineHeight="1.8">
						{renderInline(trimmed.replace(/^([-*]|•)\s+/, ""))}
					</Text>
				</Flex>
			);
		} else if (/^\d+\.\s+/.test(trimmed)) {
			const m = trimmed.match(/^(\d+)\.\s+(.*)/);
			elements.push(
				<Flex key={key} gap={2} align="flex-start" pl={2} mb={0.5}>
					<Text color="rgba(255,215,0,0.8)" flexShrink={0} lineHeight="1.8">
						{m[1]}.
					</Text>
					<Text color="rgba(255,255,255,0.95)" lineHeight="1.8">
						{renderInline(m[2])}
					</Text>
				</Flex>
			);
		} else if (trimmed === "") {
			elements.push(<Box key={key} h="0.4em" />);
		} else {
			elements.push(
				<Text key={key} color="rgba(255,255,255,0.95)" lineHeight="1.8">
					{renderInline(trimmed)}
				</Text>
			);
		}
	}

	return <Box textAlign="left">{elements}</Box>;
};

const titleCase = (str) =>
	(str || "")
		.split(" ")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");

const OUTPUT_CATEGORIES = [
	{ key: "Web Searches", label: "Web Searches" },
	{ key: "Generated Images", label: "Generated Images" },
	{ key: "Generated Floor Plans", label: "Generated Floor Plans" },
	{ key: "Extracted Colors", label: "Color Palettes" },
	{ key: "Detected Furniture", label: "Detected Furniture" },
	{ key: "Classified Style", label: "Classified Styles" },
	{ key: "Recommendations", label: "Recommendations" }
];

const OUTPUT_BRANCH_TO_CATEGORY = {
	"Outputs/Web Searches": "Web Searches",
	"Outputs/Generated Images": "Generated Images",
	"Outputs/Generated Floor Plans": "Generated Floor Plans",
	"Outputs/Extracted Colors": "Extracted Colors",
	"Outputs/Detected Furniture": "Detected Furniture",
	"Outputs/Classified Style": "Classified Style",
	"Outputs/Recommendations": "Recommendations"
};

function AgentPage() {
	const { user } = useAuth();
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content: "Welcome to Le'Orchestra. What would you like me to help you with?",
			timestamp: new Date(),
			isThinking: false
		}
	]);
	const [inputValue, setInputValue] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [currentStep, setCurrentStep] = useState("Thinking...");
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [outputs, setOutputs] = useState(null);
	const [outputCategoryRecency, setOutputCategoryRecency] = useState({});
	const [showOutputs, setShowOutputs] = useState(false);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const [liveSteps, setLiveSteps] = useState([]);
	const [showAgentStatus, setShowAgentStatus] = useState(false);

	const glassPanelStyle = {
		position: "relative",
		isolation: "isolate",
		background: "rgba(255, 255, 255, 0.08)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
		transform: "translateZ(0)",
		backfaceVisibility: "hidden",
		WebkitBackfaceVisibility: "hidden",
		_before: {
			content: '""',
			position: "absolute",
			inset: 0,
			pointerEvents: "none",
			borderRadius: "inherit",
			backdropFilter: "blur(22px) saturate(165%)",
			WebkitBackdropFilter: "blur(22px) saturate(165%)",
			transform: "translateZ(0)"
		}
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, currentStep]);

	useEffect(() => {
		if (!user?.uid) return;

		const currentStepRef = ref(database, `Users/${user.uid}/Agent/current_step`);

		const unsubscribe = onValue(
			currentStepRef,
			(snapshot) => {
				const step = snapshot.val();
				if (!step) return;

				setCurrentStep(step);

				if (step !== "Done!") {
					setLiveSteps((prev) => {
						if (prev.length > 0 && prev[prev.length - 1].step === step) return prev;
						return [...prev, { step, timestamp: new Date().toISOString(), status: "active" }];
					});
				} else {
					setLiveSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));
				}

				if (step === "Done!") {
					setIsProcessing(false);
				} else if (step !== "Thinking...") {
					setIsProcessing(true);
				}
			},
			(error) => {
				console.error("❌ [FIREBASE ERROR]:", error);
			}
		);

		return () => off(currentStepRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const statusRef = ref(database, `Users/${user.uid}/Agent/status`);

		const unsubscribe = onValue(statusRef, (snapshot) => {
			const status = snapshot.val();
			setIsProcessing(status === "running");
		});

		return () => off(statusRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const outputsRef = ref(database, `Users/${user.uid}/Agent/Outputs`);

		const unsubscribe = onValue(outputsRef, (snapshot) => {
			const outputsData = snapshot.val();
			if (!outputsData) return;
			setOutputs(outputsData);
			const hasOutputs = Object.values(outputsData).some((arr) => Array.isArray(arr) && arr.length > 0);
			if (hasOutputs) setShowOutputs(true);
		});

		return () => off(outputsRef);
	}, [user?.uid]);

	useEffect(() => {
		if (!user?.uid) return;

		const stepsRef = ref(database, `Users/${user.uid}/Agent/steps`);
		onValue(stepsRef, (snapshot) => {
			const rawSteps = snapshot.val();
			const steps = Array.isArray(rawSteps) ? rawSteps : rawSteps ? Object.values(rawSteps) : [];
			const nextRecency = {};

			steps.forEach((step, index) => {
				if (!step || step.type !== "tool_result") return;
				const content = step.content && typeof step.content === "object" ? step.content : null;
				const outputBranch = content && typeof content.output_branch === "string" ? content.output_branch : "";
				const categoryKey = OUTPUT_BRANCH_TO_CATEGORY[outputBranch];
				if (!categoryKey) return;

				const parsedTimestamp = Date.parse(step.timestamp || "");
				const rank = Number.isFinite(parsedTimestamp) ? parsedTimestamp : index;
				if (!Number.isFinite(nextRecency[categoryKey]) || rank > nextRecency[categoryKey]) {
					nextRecency[categoryKey] = rank;
				}
			});

			setOutputCategoryRecency(nextRecency);
		});

		return () => off(stepsRef);
	}, [user?.uid]);

	useEffect(() => {
		if (isProcessing) {
			setShowAgentStatus(true);
		} else if (!isProcessing && liveSteps.length > 0) {
			setShowAgentStatus(false);
			setLiveSteps([]);
		}
	}, [isProcessing]);

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
		}
	};

	useEffect(() => {
		adjustTextareaHeight();
	}, [inputValue]);

	const handleFileSelect = (e) => {
		const ALLOWED = ["image/png", "image/jpeg", "image/jpg"];
		const files = Array.from(e.target.files).filter((f) => {
			if (ALLOWED.includes(f.type.toLowerCase())) return true;
			ShowToast("error", `Unsupported file: ${f.name}`, "Only PNG and JPG/JPEG images are allowed.");
			return false;
		});
		setUploadedFiles((prev) => [...prev, ...files]);
		e.target.value = "";
	};

	const removeFile = (index) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const canSend = inputValue.trim().length > 0 && !isProcessing;

	const handleSend = async () => {
		if (!canSend) return;

		const userMessage = {
			role: "user",
			content: inputValue,
			timestamp: new Date()
		};

		setMessages((prev) => [...prev, userMessage]);
		const queryToSend = inputValue;
		const filesToSend = uploadedFiles;
		setInputValue("");
		setUploadedFiles([]);
		setIsProcessing(true);
		setLiveSteps([]);
		setShowAgentStatus(false);

		try {
			const formData = new FormData();
			formData.append("uid", user.uid);
			formData.append("query", queryToSend);
			filesToSend.forEach((file) => formData.append("files", file));

			const response = await server.post("/agent/execute", formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});

			if (response.data.response) {
				setMessages((prev) => [
					...prev,
					{ role: "assistant", content: response.data.response, timestamp: new Date() }
				]);
			}

			setIsProcessing(false);
		} catch (err) {
			setIsProcessing(false);

			const detail = err?.response?.data?.detail || err?.response?.data?.error || "";
			if (detail.startsWith("UERROR: ")) {
				ShowToast("error", detail.substring("UERROR: ".length), "Check console for more details.");
			} else if (detail.startsWith("ERROR: ")) {
				ShowToast("error", detail.substring("ERROR: ".length), "Check console for more details.");
			} else {
				ShowToast("error", "An unexpected error occurred", "Check console for more details.");
			}
			console.error("Failed to send message:", err?.response);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const renderOutputs = () => {
		if (!outputs) return null;
		const sortedCategories = [...OUTPUT_CATEGORIES].sort((a, b) => {
			const aRank = Number.isFinite(outputCategoryRecency[a.key]) ? outputCategoryRecency[a.key] : Number.NEGATIVE_INFINITY;
			const bRank = Number.isFinite(outputCategoryRecency[b.key]) ? outputCategoryRecency[b.key] : Number.NEGATIVE_INFINITY;
			if (aRank === bRank) return 0;
			return bRank - aRank;
		});

			const OutputImage = ({ src, alt, maxH = "300px" }) => (
				<Flex justify="center" align="center" w="100%">
					<Image
						src={src}
						alt={alt}
						color="white"
						borderRadius="md"
						maxH={maxH}
						maxW="100%"
						objectFit="contain"
						crossOrigin="anonymous"
						style={{ color: "white" }}
						fallback={
							<Text color="white" fontSize="sm" textAlign="center" py={2}>
								Image unavailable
							</Text>
						}
				/>
			</Flex>
		);

			return (
				<VStack align="stretch" gap={4} w="100%">
					{sortedCategories.map((category) => {
						const items = outputs[category.key];
						if (!items || !Array.isArray(items) || items.length === 0) return null;
						const orderedItems = [...items].reverse();

						return (
							<Box key={category.key}>
							<Flex align="center" gap={2} mb={3}>
								<Heading size="sm" color="white">
									{category.label}
								</Heading>
								<Text color="rgba(255, 255, 255, 0.5)" fontSize="xs">
									({items.length})
								</Text>
								</Flex>

								<VStack align="stretch" gap={3}>
									{orderedItems.map((item, idx) => (
									<Box
										key={idx}
										bg="rgba(255, 255, 255, 0.05)"
										borderRadius="lg"
										p={3}
										border="1px solid rgba(255, 255, 255, 0.1)"
									>
										{typeof item === "string" && item.startsWith("http") ? (
											<OutputImage src={item} alt={`${category.label} ${idx + 1}`} />
										) : typeof item === "string" ? (
											<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
												{item}
											</Text>
										) : typeof item === "object" && item !== null ? (
											<VStack align="stretch" gap={2}>
													{item.query && (
														<>
															<Text
																color="rgba(255, 255, 255, 0.6)"
																fontSize="xs"
																fontWeight="600"
																textAlign="left"
															>
																Query: {item.query}
															</Text>
															{typeof item.result === "string" ? (
																<Box textAlign="left">
																	{renderMessageContent(item.result)}
																</Box>
															) : (
																<Text
																	color="rgba(255, 255, 255, 0.85)"
																	fontSize="sm"
																	textAlign="left"
																	lineHeight="1.7"
																>
																	{String(item.result ?? "")}
																</Text>
															)}
														</>
													)}

												{item.style && (
													<>
														{item.image_url && (
															<OutputImage
																src={item.image_url}
																alt="Style classification"
																maxH="200px"
															/>
														)}
														<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm" fontWeight="600">
															{item.style}
														</Text>
													</>
												)}

												{item.furniture && Array.isArray(item.furniture) && (
													<>
														{item.image_url && (
															<OutputImage
																src={item.image_url}
																alt="Furniture detection"
																maxH="200px"
															/>
														)}
														<VStack align="stretch" gap={2}>
															{item.furniture.map((furn, i) => (
																<Flex key={i} gap={3} align="center">
																	{furn.url && (
																		<Flex justify="center" flexShrink={0}>
																			<Image
																				src={furn.url}
																				alt={furn.name}
																				w="44px"
																				h="44px"
																				objectFit="cover"
																				borderRadius="md"
																				crossOrigin="anonymous"
																				fallback={
																					<Box
																						w="44px"
																						h="44px"
																						bg="rgba(255,255,255,0.1)"
																						borderRadius="md"
																					/>
																				}
																			/>
																		</Flex>
																	)}
																	<Text color="rgba(255, 255, 255, 0.9)" fontSize="sm">
																		{titleCase(furn.name)}
																	</Text>
																</Flex>
															))}
														</VStack>
													</>
												)}

												{item.colors && Array.isArray(item.colors) && (
													<>
														{item.image_url && (
															<OutputImage
																src={item.image_url}
																alt="Color palette source"
																maxH="200px"
															/>
														)}
															<Flex gap={2} flexWrap="wrap" justify="center" w="100%">
															{item.colors.map((color, i) => (
																<Box key={i} textAlign="center">
																	<Box
																		w="40px"
																		h="40px"
																		bg={color.hex || color}
																		borderRadius="md"
																		border="1px solid rgba(255, 255, 255, 0.2)"
																		mb={1}
																	/>
																	<Text color="rgba(255, 255, 255, 0.6)" fontSize="xs">
																		{color.hex || color}
																	</Text>
																</Box>
															))}
														</Flex>
													</>
												)}

												{item.url && !item.furniture && !item.colors && !item.style && !item.query && (
													<OutputImage src={item.url} alt={`${category.label} ${idx + 1}`} />
												)}
											</VStack>
										) : null}
									</Box>
								))}
							</VStack>
						</Box>
					);
				})}
			</VStack>
		);
	};

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

			<Flex h="82vh" direction="column" w="100%" py={{ base: 4, md: 6 }} mt={-6}>
				<Box mb={4} w="100%" ml={3}>
					<Flex align="center" justify="space-between" mx="auto" w="100%">
						<Flex align="center" gap={3}>
							<Box
								bg="linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.3))"
								p={3}
								borderRadius="xl"
								border="1px solid rgba(255, 255, 255, 0.15)"
								boxShadow="0 8px 24px rgba(31, 38, 135, 0.15)"
							>
								<Sparkles size={24} color="#FFD700" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading
									size={{ base: "lg", md: "xl" }}
									color="white"
									fontWeight="700"
									letterSpacing="-0.02em"
								>
									Le'Orchestra
								</Heading>
								<Text fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.6)">
									Autonomous Agentic AI Design Assistant
								</Text>
							</VStack>
						</Flex>
					</Flex>
				</Box>

				<Flex gap={4} flex="1" overflow="hidden" w="100%">
					{/* Chat Area */}
					<Box
						flex="1"
						borderRadius={{ base: 20, md: 28 }}
						{...glassPanelStyle}
						overflow="hidden"
						display="flex"
						flexDirection="column"
						transition="box-shadow 0.3s ease, border-color 0.3s ease"
					>
						<Box
							flex="1"
							overflowY="auto"
							p={{ base: 4, md: 6, lg: 8 }}
							position="relative"
							zIndex={1}
							css={{
								"&::-webkit-scrollbar": { width: "6px" },
								"&::-webkit-scrollbar-track": { background: "transparent" },
								"&::-webkit-scrollbar-thumb": {
									background: "rgba(255, 255, 255, 0.2)",
									borderRadius: "10px"
								},
								"&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.3)" }
							}}
						>
							<VStack gap={6} align="stretch" w="100%">
								{messages.map((message, idx) => (
									<Box key={idx} animation="fadeInUp 0.4s ease-out" w="100%">
											{message.role === "user" ? (
												<Flex justify="flex-end" w="100%">
												<Box
													maxW={{ base: "85%", md: "75%", lg: "65%", xl: "55%" }}
													bg="linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(255, 215, 0, 0.25))"
													border="1px solid rgba(212, 175, 55, 0.4)"
													borderRadius="2xl"
													p={{ base: 4, md: 5 }}
													boxShadow="0 4px 20px rgba(212, 175, 55, 0.15)"
												>
													{/* Change 14: Markdown support in user messages */}
													<Box fontSize={{ base: "sm", md: "md" }} lineHeight="1.7">
														{renderMessageContent(message.content)}
													</Box>
												</Box>
											</Flex>
										) : (
											<VStack align="stretch" gap={3} w="100%">
												<Flex align="start" gap={3} w="100%">
													<Box
														bg="rgba(255, 215, 0, 0.15)"
														p={2}
														borderRadius="lg"
														flexShrink={0}
														mt={1}
													>
														<Sparkles size={20} color="#FFD700" />
													</Box>
													<Box flex="1" maxW="100%">
															<Box
																bg="rgba(255, 255, 255, 0.08)"
																border="1px solid rgba(255, 255, 255, 0.12)"
																borderRadius="2xl"
																p={{ base: 4, md: 5 }}
																textAlign="left"
															>
																{/* Change 14: Markdown support in assistant messages */}
																<Box
																	fontSize={{ base: "sm", md: "md" }}
																	lineHeight="1.8"
																	textAlign="left"
																>
																{renderMessageContent(message.content)}
															</Box>
														</Box>
													</Box>
												</Flex>
											</VStack>
										)}
									</Box>
								))}

								{showAgentStatus && (
									<Box animation="fadeInUp 0.4s ease-out" w="100%">
										<Flex align="start" gap={3} w="100%">
											<Box
												bg="rgba(255, 215, 0, 0.15)"
												p={2}
												borderRadius="lg"
												flexShrink={0}
												mt={1}
											>
												<Sparkles size={20} color="#FFD700" />
											</Box>
											<Box flex="1" maxW="100%">
												<Box
													bg="rgba(255, 255, 255, 0.08)"
													border="1px solid rgba(255, 255, 255, 0.12)"
													borderRadius="2xl"
													p={{ base: 4, md: 5 }}
												>
														<Flex
															align="center"
															justify="flex-start"
															mb={liveSteps.length > 0 ? 4 : 2}
														>
															<Flex align="center" gap={2}>
															<Text
																color="rgba(255, 255, 255, 0.7)"
																fontSize="sm"
																fontWeight="600"
																letterSpacing="0.02em"
															>
																AGENT ORCHESTRATION
															</Text>
															{isProcessing && currentStep !== "Done!" && (
																<Flex align="center" gap={2}>
																	<Box
																		w="6px"
																		h="6px"
																		borderRadius="full"
																		bg="#FFD700"
																		animation="pulse 2s ease-in-out infinite"
																	/>
																	<Text color="#FFD700" fontSize="xs" fontWeight="600">
																		PROCESSING
																	</Text>
																	</Flex>
																)}
															</Flex>
														</Flex>

														{liveSteps.length > 0 && (
														<VStack gap={3} align="stretch">
															{liveSteps.map((step, i) => {
																const isLastStep = i === liveSteps.length - 1;
																const isActive =
																	isLastStep &&
																	isProcessing &&
																	currentStep !== "Done!";

																return (
																	<Flex
																		key={i}
																		align="center"
																		gap={3}
																		style={{
																			animation: `stepFadeIn 0.35s ease-out ${i * 0.06}s both`
																		}}
																	>
																			<Box
																				w="20px"
																				h="20px"
																			borderRadius="full"
																			border={
																				isActive
																					? "2px solid #FFD700"
																					: "2px solid #00FF9D"
																			}
																			bg={
																				isActive
																					? "rgba(255, 215, 0, 0.2)"
																					: "rgba(0, 255, 157, 0.2)"
																			}
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																			flexShrink={0}
																				transition="all 0.3s ease"
																			>
																				{isActive ? (
																					<Flex
																						w="100%"
																						h="100%"
																						align="center"
																						justify="center"
																						lineHeight="1"
																					>
																						<Loader2
																							size={10}
																							color="#FFD700"
																							style={{
																								animation:
																									"spin 1s linear infinite",
																								display: "block",
																								transformOrigin: "center center"
																							}}
																						/>
																					</Flex>
																				) : (
																						<Flex
																							w="100%"
																							h="100%"
																							align="center"
																							justify="center"
																							lineHeight="1"
																						>
																							<Box
																								w="8px"
																								h="8px"
																								borderRadius="full"
																								bg="#00FF9D"
																								display="block"
																							/>
																						</Flex>
																				)}
																		</Box>
																		<Text
																			color={
																				isActive
																					? "#FFD700"
																					: "rgba(255, 255, 255, 0.9)"
																			}
																			fontSize="sm"
																			fontWeight={isActive ? "600" : "400"}
																			transition="color 0.3s ease"
																		>
																			{step.step}
																		</Text>
																	</Flex>
																);
															})}
														</VStack>
													)}

													{isProcessing && liveSteps.length === 0 && (
														<Flex align="center" gap={3}>
															<Loader2
																size={16}
																color="#FFD700"
																style={{ animation: "spin 1s linear infinite" }}
															/>
															<Text color="rgba(255, 255, 255, 0.7)" fontSize="sm">
																Initializing...
															</Text>
														</Flex>
													)}
												</Box>
											</Box>
										</Flex>
									</Box>
								)}

								<div ref={messagesEndRef} />
							</VStack>
						</Box>

						<Box
							borderTop="1px solid rgba(255, 255, 255, 0.1)"
							p={{ base: 4, md: 5, lg: 6 }}
							bg="rgba(0, 0, 0, 0.2)"
							w="100%"
							position="relative"
							zIndex={1}
						>
							{uploadedFiles.length > 0 && (
								<Box mb={3}>
										<Flex gap={2} flexWrap="wrap">
										{uploadedFiles.map((file, idx) => (
											<Flex
												key={idx}
												align="center"
												gap={2}
												bg="rgba(255, 255, 255, 0.08)"
												border="1px solid rgba(255, 255, 255, 0.15)"
												borderRadius="lg"
												p={2}
												pr={3}
											>
												<Box bg="rgba(255, 215, 0, 0.2)" p={2} borderRadius="md">
													<Paperclip size={14} color="#FFD700" />
												</Box>
												<Text
													color="rgba(255, 255, 255, 0.8)"
													fontSize="xs"
													maxW="150px"
													isTruncated
												>
													{file.name}
												</Text>
												<IconButton
													size="xs"
													variant="ghost"
													colorPalette="whiteAlpha"
													onClick={() => removeFile(idx)}
													aria-label="Remove file"
												>
													<X size={14} color="white" />
												</IconButton>
											</Flex>
										))}
									</Flex>
								</Box>
							)}

							<Box w="100%">
								<Flex gap={3} align="stretch" w="100%">
									<Box
										flex="1"
										bg="rgba(255, 255, 255, 0.08)"
										border="1px solid rgba(255, 255, 255, 0.15)"
										borderRadius="2xl"
										p={1}
										transition="all 0.3s ease"
										display="flex"
										alignItems="center"
										_focusWithin={{
											border: "1px solid rgba(255, 215, 0, 0.4)",
											boxShadow: "0 0 0 3px rgba(255, 215, 0, 0.1)"
										}}
									>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											onChange={handleFileSelect}
											style={{ display: "none" }}
											accept="image/png, image/jpeg, .png, .jpg, .jpeg"
										/>

										<IconButton
											size="sm"
											colorPalette="whiteAlpha"
											variant="ghost"
											onClick={() => fileInputRef.current?.click()}
											disabled={isProcessing}
											aria-label="Attach file"
											ml={1}
											borderRadius={"full"}
											color="white"
											_hover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
										>
											<Paperclip size={20} color="white" />
										</IconButton>

										<Textarea
											ref={textareaRef}
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											onKeyDown={handleKeyPress}
											placeholder="Ask me to help with something..."
											bg="transparent"
											border="none"
											color="white"
											fontSize={{ base: "sm", md: "md" }}
											resize="none"
											minH="16px"
											maxH="200px"
											rows={1}
											py={2}
											px={3}
											lineHeight="1.5"
											disabled={isProcessing}
											_placeholder={{ color: "rgba(255, 255, 255, 0.4)" }}
											_focus={{ outline: "none", boxShadow: "none" }}
											_disabled={{ opacity: 0.5, cursor: "not-allowed" }}
										/>
									</Box>

									<Box
										as="button"
										onClick={handleSend}
										bg={
											canSend
												? "linear-gradient(135deg, #D4AF37, #FFD700)"
												: "rgba(255, 255, 255, 0.1)"
										}
										px={4}
										borderRadius="xl"
										cursor={canSend ? "pointer" : "not-allowed"}
										opacity={canSend ? 1 : 0.4}
										transition="all 0.3s ease"
										disabled={!canSend}
										boxShadow={canSend ? "0 4px 20px rgba(212, 175, 55, 0.3)" : "none"}
										display="flex"
										alignItems="center"
										justifyContent="center"
										_hover={
											canSend
												? {
														transform: "translateY(-2px)",
														boxShadow: "0 6px 25px rgba(212, 175, 55, 0.4)"
												  }
												: {}
										}
										_active={canSend ? { transform: "translateY(0)" } : {}}
									>
										{isProcessing ? (
											<Loader2
												size={20}
												color="white"
												style={{ animation: "spin 1s linear infinite" }}
											/>
										) : (
											<Send size={20} color="white" />
										)}
									</Box>
								</Flex>
							</Box>
						</Box>
					</Box>

					{showOutputs && (
						<Box
							w="400px"
							borderRadius={{ base: 20, md: 28 }}
							{...glassPanelStyle}
							overflow="hidden"
							display="flex"
							flexDirection="column"
							animation="fadeIn 0.24s ease-out"
							flexShrink={0}
						>
							<Flex
								align="center"
								p={4}
								borderBottom="1px solid rgba(255, 255, 255, 0.1)"
								bg="rgba(0, 0, 0, 0.2)"
								position="relative"
								zIndex={1}
							>
								<Heading size="sm" color="white">
									Agent Ensemble
								</Heading>
							</Flex>

							<Box
								flex="1"
								overflowY="auto"
								p={4}
								position="relative"
								zIndex={1}
								css={{
									"&::-webkit-scrollbar": { width: "6px" },
									"&::-webkit-scrollbar-track": { background: "transparent" },
									"&::-webkit-scrollbar-thumb": {
										background: "rgba(255, 255, 255, 0.2)",
										borderRadius: "10px"
									},
									"&::-webkit-scrollbar-thumb:hover": {
										background: "rgba(255, 255, 255, 0.3)"
									}
								}}
							>
								{renderOutputs()}
							</Box>
						</Box>
					)}
				</Flex>
			</Flex>

			<style>
				{`
          @keyframes fadeInUp {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes stepFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.5; }
          }
        `}
			</style>
		</>
	);
}

export default AgentPage;
