import { useState, useRef, useEffect } from "react";
import { Box, Flex, Heading, Text, Textarea, VStack } from "@chakra-ui/react";
import { Send, Sparkles, Code, Image as ImageIcon, FileText, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LandingBackground from "../../assets/LandingBackground.png";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

function AgentPage() {
	const { user } = useAuth();
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content: "I'm LumenFlow - your autonomous AI assistant for interior design. I can analyze spaces, generate visualizations, research products, and create comprehensive design plans. What would you like me to help you with?",
			timestamp: new Date(),
			isThinking: false
		}
	]);
	const [inputValue, setInputValue] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [thinkingSteps, setThinkingSteps] = useState([]);
	const [showThinking, setShowThinking] = useState(true);
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.08)",
		backdropFilter: "blur(24px) saturate(180%)",
		WebkitBackdropFilter: "blur(24px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)"
	};

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, thinkingSteps]);

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

	const handleSend = async () => {
		if (!inputValue.trim() || isProcessing) return;

		const userMessage = {
			role: "user",
			content: inputValue,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInputValue("");
		setIsProcessing(true);
		setThinkingSteps([]);

		// Simulate agent thinking process
		const simulateThinking = async () => {
			const steps = [
				{ step: "Understanding request", status: "complete" },
				{ step: "Analyzing requirements", status: "active" },
				{ step: "Researching design trends", status: "pending" },
				{ step: "Generating recommendations", status: "pending" }
			];

			for (let i = 0; i < steps.length; i++) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				setThinkingSteps(prev => {
					const updated = [...steps];
					updated[i].status = "complete";
					if (i < steps.length - 1) updated[i + 1].status = "active";
					return updated;
				});
			}
		};

		simulateThinking();

		try {
			const response = await server.post("/chatbot/chat-completion", {
				uid: user.uid,
				query: userMessage.content
			});

			await new Promise(resolve => setTimeout(resolve, 2000));

			const assistantMessage = {
				role: "assistant",
				content: response.data.response,
				timestamp: new Date(),
				isThinking: false
			};

			setMessages(prev => [...prev, assistantMessage]);
			setThinkingSteps([]);
		} catch (err) {
			if (err.response?.data?.error?.startsWith("UERROR: ")) {
				const errorMessage = err.response.data.error.substring("UERROR: ".length);
				ShowToast("error", errorMessage);
			} else if (err.response?.data?.error?.startsWith("ERROR: ")) {
				const errorMessage = err.response.data.error.substring("ERROR: ".length);
				ShowToast("error", errorMessage);
			} else {
				ShowToast("error", "An unexpected error occurred. Check console for more details.");
			}
			setThinkingSteps([]);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleKeyPress = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
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
							<Box
								bg="linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.3))"
								p={3}
								borderRadius="xl"
								style={glassStyle}
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
									LumenFlow
								</Heading>
								<Text fontSize={{ base: "xs", md: "sm" }} color="rgba(255, 255, 255, 0.6)">
									Autonomous Agentic AI Design Assistant
								</Text>
							</VStack>
						</Flex>
					</Flex>
				</Box>

				{/* Main Chat Area */}
				<Box
					flex="1"
					borderRadius={{ base: 20, md: 28 }}
					style={glassStyle}
					overflow="hidden"
					display="flex"
					flexDirection="column"
					w="100%"
					mx="auto"
				>
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
														backdropFilter="blur(10px)"
														border="1px solid rgba(255, 255, 255, 0.12)"
														borderRadius="2xl"
														p={{ base: 4, md: 5 }}
													>
														<Text
															color="rgba(255, 255, 255, 0.95)"
															fontSize={{ base: "sm", md: "md" }}
															lineHeight="1.8"
															fontWeight="400"
															whiteSpace="pre-wrap"
															textAlign="left"
														>
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
							{isProcessing && thinkingSteps.length > 0 && (
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
												backdropFilter="blur(10px)"
												border="1px solid rgba(255, 255, 255, 0.12)"
												borderRadius="2xl"
												p={{ base: 4, md: 5 }}
											>
												<Flex align="center" justify="space-between" mb={4}>
													<Text
														color="rgba(255, 255, 255, 0.7)"
														fontSize="sm"
														fontWeight="600"
														letterSpacing="0.02em"
													>
														THINKING
													</Text>
													<Box
														as="button"
														onClick={() => setShowThinking(!showThinking)}
														color="rgba(255, 255, 255, 0.5)"
														transition="all 0.2s"
														_hover={{ color: "rgba(255, 255, 255, 0.8)" }}
													>
														<ChevronDown
															size={18}
															style={{
																transform: showThinking ? "rotate(180deg)" : "rotate(0deg)",
																transition: "transform 0.3s"
															}}
														/>
													</Box>
												</Flex>

												{showThinking && (
													<VStack gap={3} align="stretch">
														{thinkingSteps.map((step, i) => (
															<Flex key={i} align="center" gap={3}>
																<Box
																	w="20px"
																	h="20px"
																	borderRadius="full"
																	border={
																		step.status === "complete"
																			? "2px solid #00FF9D"
																			: step.status === "active"
																				? "2px solid #FFD700"
																				: "2px solid rgba(255, 255, 255, 0.2)"
																	}
																	bg={
																		step.status === "complete"
																			? "rgba(0, 255, 157, 0.2)"
																			: step.status === "active"
																				? "rgba(255, 215, 0, 0.2)"
																				: "transparent"
																	}
																	display="flex"
																	alignItems="center"
																	justifyContent="center"
																	flexShrink={0}
																>
																	{step.status === "active" && (
																		<Loader2
																			size={12}
																			color="#FFD700"
																			style={{ animation: "spin 1s linear infinite" }}
																		/>
																	)}
																	{step.status === "complete" && (
																		<Box w="8px" h="8px" borderRadius="full" bg="#00FF9D" />
																	)}
																</Box>
																<Text
																	color={
																		step.status === "complete"
																			? "rgba(255, 255, 255, 0.9)"
																			: step.status === "active"
																				? "rgba(255, 255, 255, 0.8)"
																				: "rgba(255, 255, 255, 0.4)"
																	}
																	fontSize="sm"
																	fontWeight={step.status === "active" ? "500" : "400"}
																>
																	{step.step}
																</Text>
															</Flex>
														))}
													</VStack>
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
					<Box
						borderTop="1px solid rgba(255, 255, 255, 0.1)"
						p={{ base: 4, md: 5, lg: 6 }}
						bg="rgba(0, 0, 0, 0.2)"
						w="100%"
					>
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
									bg={inputValue.trim() && !isProcessing ? "linear-gradient(135deg, #D4AF37, #FFD700)" : "rgba(255, 255, 255, 0.1)"}
									px={4}
									borderRadius="xl"
									cursor={inputValue.trim() && !isProcessing ? "pointer" : "not-allowed"}
									opacity={inputValue.trim() && !isProcessing ? 1 : 0.4}
									transition="all 0.3s ease"
									disabled={!inputValue.trim() || isProcessing}
									boxShadow={inputValue.trim() && !isProcessing ? "0 4px 20px rgba(212, 175, 55, 0.3)" : "none"}
									display="flex"
									alignItems="center"
									justifyContent="center"
									_hover={
										inputValue.trim() && !isProcessing
											? {
													transform: "translateY(-2px)",
													boxShadow: "0 6px 25px rgba(212, 175, 55, 0.4)"
												}
											: {}
									}
									_active={
										inputValue.trim() && !isProcessing
											? {
													transform: "translateY(0)"
												}
											: {}
									}
								>
									{isProcessing ? (
										<Loader2 size={20} color="white" style={{ animation: "spin 1s linear infinite" }} />
									) : (
										<Send size={20} color="white" />
									)}
								</Box>
							</Flex>
						</Box>
					</Box>
				</Box>
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