import { useState, useRef, useEffect } from "react";
import { Box, Flex, Heading, Text, Textarea, VStack, HStack, IconButton, Image } from "@chakra-ui/react";
import { Send, Sparkles, Loader2, ChevronDown, Paperclip, X, Maximize2, Minimize2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/firebase";
import LandingBackground from "../../assets/LandingBackground.png";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

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
	const [showThinking, setShowThinking] = useState(true);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [outputs, setOutputs] = useState(null);
	const [showOutputs, setShowOutputs] = useState(false);
	const [outputsExpanded, setOutputsExpanded] = useState(true);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const [liveSteps, setLiveSteps] = useState([]);
	const [showAgentStatus, setShowAgentStatus] = useState(false);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.08)",
		backdropFilter: "blur(24px) saturate(180%)",
		WebkitBackdropFilter: "blur(24px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)"
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, currentStep]);


	// Firebase real-time listener for current_step
	useEffect(() => {
		if (!user?.uid) {
			return;
		}

		const currentStepRef = ref(database, `Users/${user.uid}/Agent/current_step`);

		const unsubscribe = onValue(
			currentStepRef,
			snapshot => {
				const step = snapshot.val();

				if (step) {
					setCurrentStep(step);

					// Add each new step to the live steps array
					if (step !== "Done!") {
						setLiveSteps(prev => {
							// Check if this step is already the last one (avoid duplicates)
							if (prev.length > 0 && prev[prev.length - 1].step === step) {
								return prev;
							}

							// Add new step with timestamp
							const newStep = {
								step: step,
								timestamp: new Date().toISOString(),
								status: "active"
							};

							const newArray = [...prev, newStep];

							return newArray;
						});
					} else {
						// Mark all previous steps as complete when done
						setLiveSteps(prev => {
							const updated = prev.map(s => ({ ...s, status: "complete" }));
							return updated;
						});
					}

					// Update processing state based on step
					if (step === "Done!") {
						setIsProcessing(false);
					} else if (step !== "Thinking...") {
						setIsProcessing(true);
					}
				}
			},
			error => {
				console.error("❌ [FIREBASE ERROR]:", error);
			}
		);

		return () => {
			off(currentStepRef);
		};
	}, [user?.uid]); // Removed currentStep from dependency array

	// Firebase real-time listener for Agent status
	useEffect(() => {
		if (!user?.uid) return;

		const statusRef = ref(database, `Users/${user.uid}/Agent/status`);

		const unsubscribe = onValue(statusRef, snapshot => {
			const status = snapshot.val();
			const newIsProcessing = status === "running";
			setIsProcessing(newIsProcessing);
		});

		return () => {
			off(statusRef);
		};
	}, [user?.uid]);

	// Firebase real-time listener for thinking steps history
	useEffect(() => {
		if (!user?.uid) return;

		const stepsRef = ref(database, `Users/${user.uid}/Agent/steps`);

		const unsubscribe = onValue(stepsRef, snapshot => {
			const stepsData = snapshot.val();

			// Firebase may return an array or an object with numeric keys
			const steps = Array.isArray(stepsData) ? stepsData : stepsData ? Object.values(stepsData) : [];

			if (steps.length > 0) {
				// Extract thinking-related steps for display
				const thinkingSteps = steps
					.filter(step => {
						// Include thought, tool_call, and tool_result steps
						return ["thought", "tool_call", "tool_result", "file_analysis", "file_selected"].includes(step.type);
					})
					.slice(-10) // Keep last 10 thinking steps
					.map(step => {
						let stepText = "";
						let status = "complete";

						if (step.type === "thought") {
							stepText = typeof step.content === "string" ? step.content : "Thinking...";
						} else if (step.type === "tool_call") {
							const toolName = step.tool || "unknown";
							stepText = `Calling tool: ${toolName}`;
						} else if (step.type === "tool_result") {
							const toolName = step.tool || "unknown";
							stepText = `Completed: ${toolName}`;
						} else if (step.type === "file_analysis") {
							const content = step.content || {};
							if (content.status === "started") {
								stepText = `Analyzing ${content.total_files || 0} file(s)`;
								status = "active";
							} else {
								stepText = `File analysis complete`;
							}
						} else if (step.type === "file_selected") {
							const content = step.content || {};
							stepText = `Selected: ${content.filename || "file"}`;
						}

						return {
							step: stepText,
							status: status,
							timestamp: step.timestamp
						};
					});
			}
		});

		return () => off(stepsRef);
	}, [user?.uid]);

	// Firebase real-time listener for Outputs
	useEffect(() => {
		if (!user?.uid) return;

		const outputsRef = ref(database, `Users/${user.uid}/Agent/Outputs`);

		const unsubscribe = onValue(outputsRef, snapshot => {
			const outputsData = snapshot.val();
			if (outputsData) {
				setOutputs(outputsData);

				// Show outputs panel if there's any data
				const hasOutputs = Object.values(outputsData).some(arr => Array.isArray(arr) && arr.length > 0);
				if (hasOutputs) {
					setShowOutputs(true);
				}
			}
		});

		return () => off(outputsRef);
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

	const handleFileSelect = e => {
		const files = Array.from(e.target.files);
		setUploadedFiles(prev => [...prev, ...files]);
	};

	const removeFile = index => {
		setUploadedFiles(prev => prev.filter((_, i) => i !== index));
	};

	const handleSend = async () => {
		if ((!inputValue.trim() && uploadedFiles.length === 0) || isProcessing) return;

		const userMessage = {
			role: "user",
			content: inputValue || "(File uploaded)",
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
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

			filesToSend.forEach(file => {
				formData.append("files", file);
			});

			const response = await server.post("/agent/execute", formData, {
				headers: {
					"Content-Type": "multipart/form-data"
				}
			});

			// Add assistant response immediately
			if (response.data.response) {
				const assistantMessage = {
					role: "assistant",
					content: response.data.response,
					timestamp: new Date()
				};

				setMessages(prev => [...prev, assistantMessage]);
			}

			// Processing state will be handled by Firebase listener
			setIsProcessing(false);
		} catch (err) {
			setIsProcessing(false);

			if (err?.response?.data?.detail) {
				if (err.response.data.detail.startsWith("UERROR: ")) {
					const errorMessage = err.response.data.detail.substring("UERROR: ".length);
					console.error("Failed to send message: ", errorMessage);
					ShowToast("error", errorMessage, "Check console for more details.");
				} else if (err.response.data.detail.startsWith("ERROR: ")) {
					const errorMessage = err.response.data.detail.substring("ERROR: ".length);
					console.error("Failed to send message: ", errorMessage);
					ShowToast("error", errorMessage, "Check console for more details.");
				} else {
					console.error("Failed to send message: ", err.response.data.detail);
					ShowToast("error", "Failed to send message", "Check console for more details.");
				}
			} else if (err?.response?.data?.error) {
				if (err.response.data.error.startsWith("UERROR: ")) {
					const errorMessage = err.response.data.error.substring("UERROR: ".length);
					console.error("Failed to send message: ", errorMessage);
					ShowToast("error", errorMessage, "Check console for more details.");
				} else if (err.response.data.error.startsWith("ERROR: ")) {
					const errorMessage = err.response.data.error.substring("ERROR: ".length);
					console.error("Failed to send message: ", errorMessage);
					ShowToast("error", errorMessage, "Check console for more details.");
				} else {
					console.error("Failed to send message: ", err.response.data.error);
					ShowToast("error", "Failed to send message", "Check console for more details.");
				}
			} else {
				console.error("Failed to send message: ", err?.response);
				ShowToast("error", "An unexpected error occurred", "Check console for more details.");
			}
		}
	};

	const handleKeyPress = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const renderOutputs = () => {
		if (!outputs) return null;

		const outputCategories = [
			{ key: "Web Searches", label: "Web Searches", icon: "🔍" },
			{ key: "Generated Images", label: "Generated Images", icon: "🖼️" },
			{ key: "Generated Floor Plans", label: "Generated Floor Plans", icon: "📐" },
			{ key: "Extracted Colors", label: "Extracted Colors", icon: "🎨" },
			{ key: "Detected Furniture", label: "Detected Furniture", icon: "🪑" },
			{ key: "Classified Style", label: "Classified Style", icon: "✨" },
			{ key: "Recommendations", label: "Recommendations", icon: "💡" }
		];

		return (
			<VStack align="stretch" gap={4} w="100%">
				{outputCategories.map(category => {
					const items = outputs[category.key];
					if (!items || !Array.isArray(items) || items.length === 0) return null;

					return (
						<Box key={category.key}>
							<Flex align="center" gap={2} mb={3}>
								<Text fontSize="lg">{category.icon}</Text>
								<Heading size="sm" color="white">
									{category.label}
								</Heading>
								<Text color="rgba(255, 255, 255, 0.5)" fontSize="xs">
									({items.length})
								</Text>
							</Flex>

							<VStack align="stretch" gap={3}>
								{items.map((item, idx) => (
									<Box key={idx} bg="rgba(255, 255, 255, 0.05)" borderRadius="lg" p={3} border="1px solid rgba(255, 255, 255, 0.1)">
										{/* Handle different output types */}
										{typeof item === "string" && item.startsWith("http") ? (
											<Image
												src={item}
												alt={`${category.label} ${idx + 1}`}
												borderRadius="md"
												maxH="300px"
												objectFit="contain"
												fallback={
													<Text color="rgba(255, 255, 255, 0.5)" fontSize="sm">
														Image: {item}
													</Text>
												}
											/>
										) : typeof item === "string" ? (
											<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
												• {item}
											</Text>
										) : typeof item === "object" && item !== null ? (
											<VStack align="stretch" gap={2}>
												{/* Web Search Results */}
												{item.query && (
													<>
														<Text color="rgba(255, 255, 255, 0.6)" fontSize="xs" fontWeight="600">
															Query: {item.query}
														</Text>
														<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
															{item.result}
														</Text>
													</>
												)}

												{/* Classified Style */}
												{item.style && (
													<>
														{item.image_url && <Image src={item.image_url} alt="Style classification" borderRadius="md" maxH="200px" objectFit="contain" mb={2} />}
														<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm" fontWeight="600">
															Style: {item.style}
														</Text>
													</>
												)}

												{/* Detected Furniture */}
												{item.furniture && Array.isArray(item.furniture) && (
													<>
														{item.image_url && <Image src={item.image_url} alt="Furniture detection" borderRadius="md" maxH="200px" objectFit="contain" mb={2} />}
														<VStack align="stretch" gap={1}>
															{item.furniture.map((furn, i) => (
																<Flex key={i} gap={2} align="center">
																	{furn.url && <Image src={furn.url} alt={furn.name} w="40px" h="40px" objectFit="cover" borderRadius="md" />}
																	<Text color="rgba(255, 255, 255, 0.8)" fontSize="sm">
																		• {furn.name}
																	</Text>
																</Flex>
															))}
														</VStack>
													</>
												)}

												{/* Extracted Colors */}
												{item.colors && Array.isArray(item.colors) && (
													<>
														{item.image_url && <Image src={item.image_url} alt="Color extraction" borderRadius="md" maxH="200px" objectFit="contain" mb={2} />}
														<Flex gap={2} flexWrap="wrap">
															{item.colors.map((color, i) => (
																<Box key={i}>
																	<Box w="40px" h="40px" bg={color.hex || color} borderRadius="md" border="1px solid rgba(255, 255, 255, 0.2)" mb={1} />
																	<Text color="rgba(255, 255, 255, 0.6)" fontSize="xs" textAlign="center">
																		{color.hex || color}
																	</Text>
																</Box>
															))}
														</Flex>
													</>
												)}

												{/* Generic image URL */}
												{item.url && !item.furniture && !item.colors && !item.style && <Image src={item.url} alt={`${category.label} ${idx + 1}`} borderRadius="md" maxH="300px" objectFit="contain" />}
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
				{/* Header */}
				<Box mb={4} w="100%" ml={3}>
					<Flex align="center" justify="space-between" mx="auto" w="100%">
						<Flex align="center" gap={3}>
							<Box bg="linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.3))" p={3} borderRadius="xl" style={glassStyle}>
								<Sparkles size={24} color="#FFD700" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading size={{ base: "lg", md: "xl" }} color="white" fontWeight="700" letterSpacing="-0.02em">
									Le'Orchestra
								</Heading>
								<Text fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.6)">
									Autonomous Agentic AI Design Assistant
								</Text>
							</VStack>
						</Flex>
					</Flex>
				</Box>

				{/* Main Content Area */}
				<Flex gap={4} flex="1" overflow="hidden" w="100%">
					{/* Chat Area */}
					<Box flex={showOutputs ? "1" : "1"} borderRadius={{ base: 20, md: 28 }} style={glassStyle} overflow="hidden" display="flex" flexDirection="column" transition="all 0.3s ease">
						<Box
							flex="1"
							overflowY="auto"
							p={{ base: 4, md: 6, lg: 8 }}
							css={{
								"&::-webkit-scrollbar": {
									width: "6px"
								},
								"&::-webkit-scrollbar-track": {
									background: "transparent"
								},
								"&::-webkit-scrollbar-thumb": {
									background: "rgba(255, 255, 255, 0.2)",
									borderRadius: "10px"
								},
								"&::-webkit-scrollbar-thumb:hover": {
									background: "rgba(255, 255, 255, 0.3)"
								}
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
													backdropFilter="blur(10px)"
													border="1px solid rgba(212, 175, 55, 0.4)"
													borderRadius="2xl"
													p={{ base: 4, md: 5 }}
													boxShadow="0 4px 20px rgba(212, 175, 55, 0.15)"
												>
													<Text color="white" fontSize={{ base: "sm", md: "md" }} lineHeight="1.7" fontWeight="400">
														{message.content}
													</Text>
												</Box>
											</Flex>
										) : (
											<VStack align="stretch" gap={3} w="100%">
												<Flex align="start" gap={3} w="100%">
													<Box bg="rgba(255, 215, 0, 0.15)" p={2} borderRadius="lg" flexShrink={0} mt={1}>
														<Sparkles size={20} color="#FFD700" />
													</Box>
													<Box flex="1" maxW="100%">
														<Box bg="rgba(255, 255, 255, 0.08)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.12)" borderRadius="2xl" p={{ base: 4, md: 5 }}>
															<Text color="rgba(255, 255, 255, 0.95)" fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" fontWeight="400" whiteSpace="pre-wrap" textAlign="left">
																{message.content}
															</Text>
														</Box>
													</Box>
												</Flex>
											</VStack>
										)}
									</Box>
								))}

								{/* Thinking Process Display */}
								{showAgentStatus && (
									<Box animation="fadeInUp 0.4s ease-out" w="100%">
										<Flex align="start" gap={3} w="100%">
											<Box bg="rgba(255, 215, 0, 0.15)" p={2} borderRadius="lg" flexShrink={0} mt={1}>
												<Sparkles size={20} color="#FFD700" />
											</Box>
											<Box flex="1" maxW="100%">
												<Box bg="rgba(255, 255, 255, 0.08)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.12)" borderRadius="2xl" p={{ base: 4, md: 5 }}>
													<Flex align="center" justify="space-between" mb={liveSteps.length > 0 ? 4 : 2}>
														<Flex align="center" gap={2}>
															<Text color="rgba(255, 255, 255, 0.7)" fontSize="sm" fontWeight="600" letterSpacing="0.02em">
																AGENT STATUS
															</Text>
															{isProcessing && currentStep !== "Done!" && (
																<Flex align="center" gap={2}>
																	<Box w="6px" h="6px" borderRadius="full" bg="#FFD700" animation="pulse 2s ease-in-out infinite" />
																	<Text color="#FFD700" fontSize="xs" fontWeight="600">
																		PROCESSING
																	</Text>
																</Flex>
															)}
														</Flex>
														{liveSteps.length > 0 && (
															<Box as="button" onClick={() => setShowThinking(!showThinking)} color="rgba(255, 255, 255, 0.5)" transition="all 0.2s" _hover={{ color: "rgba(255, 255, 255, 0.8)" }}>
																<ChevronDown
																	size={18}
																	style={{
																		transform: showThinking ? "rotate(180deg)" : "rotate(0deg)",
																		transition: "transform 0.3s"
																	}}
																/>
															</Box>
														)}
													</Flex>

													{showThinking && liveSteps.length > 0 && (
														<VStack gap={3} align="stretch">
															{liveSteps.map((step, i) => {
																const isLastStep = i === liveSteps.length - 1;
																const isActive = isLastStep && isProcessing && currentStep !== "Done!";

																return (
																	<Flex key={i} align="center" gap={3} animation="fadeInUp 0.3s ease-out">
																		<Box
																			w="20px"
																			h="20px"
																			borderRadius="full"
																			border={isActive ? "2px solid #FFD700" : "2px solid #00FF9D"}
																			bg={isActive ? "rgba(255, 215, 0, 0.2)" : "rgba(0, 255, 157, 0.2)"}
																			display="flex"
																			alignItems="center"
																			justifyContent="center"
																			flexShrink={0}
																		>
																			{isActive ? <Loader2 size={12} color="#FFD700" style={{ animation: "spin 1s linear infinite" }} /> : <Box w="8px" h="8px" borderRadius="full" bg="#00FF9D" />}
																		</Box>
																		<Text color={isActive ? "#FFD700" : "rgba(255, 255, 255, 0.9)"} fontSize="sm" fontWeight={isActive ? "600" : "400"}>
																			{step.step}
																		</Text>
																	</Flex>
																);
															})}
														</VStack>
													)}

													{/* Show message when no steps yet but processing */}
													{isProcessing && liveSteps.length === 0 && (
														<Flex align="center" gap={3}>
															<Loader2 size={16} color="#FFD700" style={{ animation: "spin 1s linear infinite" }} />
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

						{/* Input Area */}
						<Box borderTop="1px solid rgba(255, 255, 255, 0.1)" p={{ base: 4, md: 5, lg: 6 }} bg="rgba(0, 0, 0, 0.2)" w="100%">
							{/* File Upload Preview */}
							{uploadedFiles.length > 0 && (
								<Box mb={3}>
									<Flex gap={2} flexWrap="wrap">
										{uploadedFiles.map((file, idx) => (
											<Flex key={idx} align="center" gap={2} bg="rgba(255, 255, 255, 0.08)" border="1px solid rgba(255, 255, 255, 0.15)" borderRadius="lg" p={2} pr={3}>
												<Box bg="rgba(255, 215, 0, 0.2)" p={2} borderRadius="md">
													<Paperclip size={14} color="#FFD700" />
												</Box>
												<Text color="rgba(255, 255, 255, 0.8)" fontSize="xs" maxW="150px" isTruncated>
													{file.name}
												</Text>
												<IconButton size="xs" variant="ghost" colorPalette="whiteAlpha" onClick={() => removeFile(idx)} aria-label="Remove file">
													<X size={14} />
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
										backdropFilter="blur(10px)"
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
										<input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: "none" }} accept="image/*" />

										<IconButton size="sm" colorPalette="whiteAlpha" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} aria-label="Attach file" ml={1} _hover={{ backgroundColor: "transparent" }}>
											<Paperclip size={20} color="white" />
										</IconButton>
										<Textarea
											ref={textareaRef}
											value={inputValue}
											onChange={e => setInputValue(e.target.value)}
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
											_placeholder={{
												color: "rgba(255, 255, 255, 0.4)"
											}}
											_focus={{
												outline: "none",
												boxShadow: "none"
											}}
											_disabled={{
												opacity: 0.5,
												cursor: "not-allowed"
											}}
										/>
									</Box>

									<Box
										as="button"
										onClick={handleSend}
										bg={(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing ? "linear-gradient(135deg, #D4AF37, #FFD700)" : "rgba(255, 255, 255, 0.1)"}
										px={4}
										borderRadius="xl"
										cursor={(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing ? "pointer" : "not-allowed"}
										opacity={(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing ? 1 : 0.4}
										transition="all 0.3s ease"
										disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isProcessing}
										boxShadow={(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing ? "0 4px 20px rgba(212, 175, 55, 0.3)" : "none"}
										display="flex"
										alignItems="center"
										justifyContent="center"
										_hover={
											(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing
												? {
														transform: "translateY(-2px)",
														boxShadow: "0 6px 25px rgba(212, 175, 55, 0.4)"
													}
												: {}
										}
										_active={
											(inputValue.trim() || uploadedFiles.length > 0) && !isProcessing
												? {
														transform: "translateY(0)"
													}
												: {}
										}
									>
										{isProcessing ? <Loader2 size={20} color="white" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={20} color="white" />}
									</Box>
								</Flex>
							</Box>
						</Box>
					</Box>

					{/* Outputs Panel */}
					{showOutputs && (
						<Box w={outputsExpanded ? "400px" : "60px"} borderRadius={{ base: 20, md: 28 }} style={glassStyle} overflow="hidden" display="flex" flexDirection="column" transition="all 0.3s ease" animation="slideInRight 0.3s ease-out">
							<Flex align="center" justify="space-between" p={4} borderBottom="1px solid rgba(255, 255, 255, 0.1)" bg="rgba(0, 0, 0, 0.2)">
								{outputsExpanded && (
									<Heading size="sm" color="white">
										Agent Outputs
									</Heading>
								)}
								<HStack gap={2}>
									<IconButton size="sm" variant="ghost" colorPalette="whiteAlpha" onClick={() => setOutputsExpanded(!outputsExpanded)} aria-label={outputsExpanded ? "Minimize" : "Maximize"}>
										{outputsExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
									</IconButton>
									<IconButton size="sm" variant="ghost" colorPalette="whiteAlpha" onClick={() => setShowOutputs(false)} aria-label="Close outputs">
										<X size={18} />
									</IconButton>
								</HStack>
							</Flex>

							{outputsExpanded && (
								<Box
									flex="1"
									overflowY="auto"
									p={4}
									css={{
										"&::-webkit-scrollbar": {
											width: "6px"
										},
										"&::-webkit-scrollbar-track": {
											background: "transparent"
										},
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
							)}
						</Box>
					)}
				</Flex>
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

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
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
        `}
			</style>
		</>
	);
}

export default AgentPage;
