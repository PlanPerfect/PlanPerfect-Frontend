import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Box, Card, Flex, Heading, Text, Input, VStack, HStack } from "@chakra-ui/react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LandingBackground from "../../assets/LandingBackground.png";
import ShowToast from "@/Extensions/ShowToast";
import server from "../../../networking";

function ChatbotPage() {
	const { user } = useAuth();
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content: "I'm Lumen AI, your personal AI interior design assistant. How can I help you transform your space today?",
			timestamp: new Date()
		}
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isInitialMount, setIsInitialMount] = useState(true);
	const [currentModel, setCurrentModel] = useState("");
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);
	const initialMessageCount = useRef(1);
	const navigate = useNavigate();

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	useEffect(() => {
		fetchCurrentModel();
	}, []);

	const fetchCurrentModel = async () => {
		try {
			const response = await server.get("/chatbot/current-model");
			setCurrentModel(response.data.model);
		} catch (err) {
			console.warn("Failed to fetch current model. Falling back to Llama 3.3 70B.", err);
			setCurrentModel("Llama 3.3 70B");
		}
	};

	const formatModelName = (modelString) => {
		const modelName = modelString.split('/')[1] || modelString;

		if (modelName.includes('llama')) {
			const match = modelName.match(/llama-(\d+\.\d+)-(\d+b)/i);
			if (match) {
				return `Llama ${match[1]} ${match[2].toUpperCase()}`;
			}
		} else if (modelName.includes('gemini')) {
			const match = modelName.match(/gemini-(\d+\.\d+)-(\w+)/i);
			if (match) {
				return `Gemini ${match[1]} ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}`;
			}
		}

		return modelName.charAt(0).toUpperCase() + modelName.slice(1);
	};

	useLayoutEffect(() => {
		setIsInitialMount(false);
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);

	const handleSend = async () => {
		if (!inputValue.trim()) return;

		const userMessage = {
			role: "user",
			content: inputValue,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		try {
			const response = await server.post("/chatbot/chat-completion", {
				uid: user.uid,
				query: userMessage.content
			});

			const assistantMessage = {
				role: "assistant",
				content: response.data.response,
				timestamp: new Date()
			};

			setMessages(prev => [...prev, assistantMessage]);

			if (response.data.model && response.data.model !== currentModel) {
				setCurrentModel(response.data.model);
			}
		} catch (err) {
			if (err.response?.data?.error?.startsWith("UERROR: ")) {
				const errorMessage = err.response.data.error.substring("UERROR: ".length);
				console.warn("Failed to send message: ", errorMessage);
				ShowToast("error", errorMessage);
			} else if (err.response?.data?.error?.startsWith("ERROR: ")) {
				const errorMessage = err.response.data.error.substring("ERROR: ".length);
				console.error("Failed to send message: ", errorMessage);
				ShowToast("error", errorMessage);
			} else {
				console.error("Failed to send message: ", err.response?.data?.error || err.response?.data?.detail);
				ShowToast("error", "An unexpected error occurred. Check console for more details.");
			}
		} finally {
			setIsTyping(false);
		}
	};

	const handleKeyPress = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSwitchToAgentMode = () => {
		navigate("/lumen/agent");
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

			<Flex h="75vh" justify="center" align="center">
				<Card.Root width="100%" height={{ base: "calc(100vh - 12rem)", md: "75vh" }} variant="elevated" borderRadius={{ base: 20, md: 35 }} style={glassStyle} overflow="hidden">
					<Box borderBottom="1px solid rgba(255, 255, 255, 0.2)" p={{ base: 4, md: 6 }} bg="rgba(255, 255, 255, 0.05)">
						<Flex align="center" justify="space-between" gap={3}>
							<Flex align="center" gap={3}>
								<Box bg="rgba(255, 240, 189, 0.2)" p={2} borderRadius="full" animation="pulse 2s infinite">
									<Bot size={24} color="#fff0bd" />
								</Box>
								<VStack align="start" gap={0}>
									<Heading size={{ base: "md", md: "lg" }} color="white" textShadow="0 2px 4px rgba(0,0,0,0.2)">
										Lumen AI
									</Heading>
									<Text
										fontSize={{ base: "xs", md: "sm" }}
										color="rgba(255, 255, 255, 0.7)"
										transition="all 0.3s ease"
									>
										Powered by {formatModelName(currentModel)}
									</Text>
								</VStack>
							</Flex>

							<Box
								as="button"
								onClick={handleSwitchToAgentMode}
								position="relative"
								bg="linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(255, 215, 0, 0.25))"
								backdropFilter="blur(15px)"
								border="1px solid rgba(212, 175, 55, 0.5)"
								borderRadius="full"
								px={{ base: 3, md: 5 }}
								py={{ base: 2, md: 2.5 }}
								color="white"
								fontSize={{ base: "xs", md: "sm" }}
								fontWeight="600"
								cursor="pointer"
								transition="all 0.4s ease, box-shadow 0.4s ease"
								whiteSpace="nowrap"
								overflow="hidden"
								boxShadow="0 4px 15px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
								_hover={{
									bg: "linear-gradient(135deg, rgba(212, 175, 55, 0.4), rgba(255, 215, 0, 0.4))",
									border: "1px solid rgba(255, 215, 0, 0.8)",
									transform: "translateY(-2px) scale(1.02)",
									boxShadow: "0 8px 25px rgba(212, 175, 55, 0.4), 0 0 20px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
								}}
								_active={{
									transform: "translateY(0) scale(0.98)",
									boxShadow: "0 2px 10px rgba(212, 175, 55, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.1)"
								}}
							>
								<Flex align="center" gap={2}>
									<Sparkles size={16} style={{ animation: "pulse 2s ease-in-out infinite" }} />
									<Text as="span">Switch to Agent Mode</Text>
								</Flex>
							</Box>
						</Flex>
					</Box>

					<Card.Body
						p={{ base: 4, md: 6 }}
						overflowY="auto"
						flex="1"
						css={{
							"&::-webkit-scrollbar": {
								width: "8px"
							},
							"&::-webkit-scrollbar-track": {
								background: "rgba(255, 255, 255, 0.1)",
								borderRadius: "10px"
							},
							"&::-webkit-scrollbar-thumb": {
								background: "rgba(255, 255, 255, 0.3)",
								borderRadius: "10px"
							},
							"&::-webkit-scrollbar-thumb:hover": {
								background: "rgba(255, 255, 255, 0.4)"
							}
						}}
					>
						<VStack gap={4} align="stretch">
							{messages.map((message, idx) => {
								const shouldAnimate = !isInitialMount && idx >= initialMessageCount.current;

								return (
									<Flex key={idx} justify={message.role === "user" ? "flex-end" : "flex-start"} animation={shouldAnimate ? "fadeInUp 0.4s ease-out" : "none"}>
										<Flex maxW={{ base: "85%", md: "70%" }} gap={3} direction={message.role === "user" ? "row-reverse" : "row"}>
											<Box
												bg={message.role === "user" ? "#D4AF37" : message.isError ? "rgba(255, 100, 100, 0.3)" : "rgba(255, 240, 189, 0.3)"}
												p={2}
												borderRadius="full"
												h="fit-content"
												flexShrink={0}
											>
												{message.role === "user" ? <User size={20} color="white" /> : message.isError ? <AlertCircle size={20} color="#ff6b6b" /> : <Bot size={20} color="#fff0bd" />}
											</Box>

											<VStack align="start" gap={1}>
												<Box
													bg={message.role === "user" ? "#C9A227" : message.isError ? "rgba(255, 100, 100, 0.15)" : "rgba(255, 255, 255, 0.15)"}
													backdropFilter="blur(10px)"
													border={message.isError ? "1px solid rgba(255, 100, 100, 0.3)" : "1px solid rgba(255, 255, 255, 0.2)"}
													borderRadius={20}
													p={{ base: 3, md: 4 }}
													boxShadow="0 4px 16px rgba(0, 0, 0, 0.1)"
												>
													<Text
														color="white"
														fontSize={{
															base: "sm",
															md: "md"
														}}
														lineHeight="1.6"
													>
														{message.content}
													</Text>
												</Box>
												<Text fontSize="xs" color="rgba(255, 255, 255, 0.5)" px={2}>
													{message.timestamp.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit"
													})}
												</Text>
											</VStack>
										</Flex>
									</Flex>
								);
							})}

							{isTyping && (
								<Flex justify="flex-start" animation="fadeInUp 0.4s ease-out">
									<Flex gap={3} maxW="70%">
										<Box bg="rgba(255, 240, 189, 0.3)" p={2} borderRadius="full" h="fit-content">
											<Bot size={20} color="#fff0bd" />
										</Box>
										<Box bg="rgba(255, 255, 255, 0.15)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)" borderRadius={20} p={4}>
											<Flex gap={1}>
												<Box w="8px" h="8px" bg="rgba(255, 255, 255, 0.6)" borderRadius="full" animation="bounce 1.4s infinite" />
												<Box w="8px" h="8px" bg="rgba(255, 255, 255, 0.6)" borderRadius="full" animation="bounce 1.4s infinite 0.2s" />
												<Box w="8px" h="8px" bg="rgba(255, 255, 255, 0.6)" borderRadius="full" animation="bounce 1.4s infinite 0.4s" />
											</Flex>
										</Box>
									</Flex>
								</Flex>
							)}

							<div ref={messagesEndRef} />
						</VStack>
					</Card.Body>

					<Box borderTop="1px solid rgba(255, 255, 255, 0.2)" p={{ base: 4, md: 6 }} bg="rgba(255, 255, 255, 0.05)">
						<HStack gap={3}>
							<Input
								ref={inputRef}
								value={inputValue}
								onChange={e => setInputValue(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask about interior design, furniture, or styling tips..."
								bg="rgba(255, 255, 255, 0.1)"
								border="1px solid rgba(255, 255, 255, 0.2)"
								borderRadius="full"
								color="white"
								fontSize={{ base: "sm", md: "md" }}
								px={{ base: 4, md: 6 }}
								py={{ base: 5, md: 6 }}
								disabled={isTyping}
								_placeholder={{
									color: "rgba(255, 255, 255, 0.5)"
								}}
								_focus={{
									outline: "none",
									border: "1px solid rgba(255, 240, 189, 0.5)",
									boxShadow: "0 0 0 3px rgba(255, 240, 189, 0.1)"
								}}
								_disabled={{
									opacity: 0.6,
									cursor: "not-allowed"
								}}
							/>
							<Box
								as="button"
								onClick={handleSend}
								bg="#D4AF37"
								p={{ base: 3, md: 4 }}
								borderRadius="full"
								cursor={inputValue.trim() && !isTyping ? "pointer" : "not-allowed"}
								opacity={inputValue.trim() && !isTyping ? 1 : 0.5}
								transition="all 0.2s"
								disabled={!inputValue.trim() || isTyping}
								_hover={
									inputValue.trim() && !isTyping
										? {
												bg: "#C9A961",
												transform: "translateY(-2px)",
												boxShadow: "0 4px 12px rgba(212, 175, 55, 0.4)"
											}
										: {}
								}
								_active={
									inputValue.trim() && !isTyping
										? {
												transform: "translateY(0)"
											}
										: {}
								}
							>
								<Send size={20} color="white" />
							</Box>
						</HStack>
					</Box>
				</Card.Root>
			</Flex>

			<style>
				{`
		  @keyframes fadeInDown {
				from {
					opacity: 0;
					transform: translateY(-20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

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
          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
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

export default ChatbotPage;