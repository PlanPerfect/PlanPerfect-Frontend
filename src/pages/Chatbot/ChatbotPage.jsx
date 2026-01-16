import { useState, useRef, useEffect } from "react";
import { Box, Card, Flex, Heading, Text, Input, VStack, HStack, Avatar } from "@chakra-ui/react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import LandingBackground from "../../assets/LandingBackground.png";

function ChatbotPage() {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Hello! I'm your AI interior design assistant. How can I help you transform your space today?",
			timestamp: new Date(),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef(null);
	const inputRef = useRef(null);

	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow:
			"0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSend = async () => {
		if (!inputValue.trim()) return;

		const userMessage = {
			role: "user",
			content: inputValue,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsTyping(true);

		// Simulate AI response
		setTimeout(() => {
			const aiResponses = [
				"That's a great question! For modern interiors, I'd recommend focusing on clean lines, neutral color palettes, and incorporating natural materials like wood and stone.",
				"Based on your preferences, I suggest creating a cohesive color scheme using the 60-30-10 rule: 60% dominant color, 30% secondary, and 10% accent.",
				"To maximize space in a small room, consider multi-functional furniture, mirrors to create depth, and vertical storage solutions.",
				"I'd love to help you with that! Could you tell me more about your style preferences and the room dimensions?",
			];

			const assistantMessage = {
				role: "assistant",
				content:
					aiResponses[Math.floor(Math.random() * aiResponses.length)],
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
			setIsTyping(false);
		}, 1500);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const quickPrompts = [
		"Help me design my living room",
		"What colors work well together?",
		"Space-saving furniture ideas",
		"Budget-friendly decor tips",
	];

	return (
		<>
			{/* Fixed Background */}
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
					zIndex: -1,
				}}
			/>

			{/* Main Container */}
			<Flex h="80vh" justify="center" align="center">
				<Card.Root
					width="100%"
					height={{ base: "calc(100vh - 12rem)", md: "75vh" }}
					variant="elevated"
					borderRadius={{ base: 20, md: 35 }}
					style={glassStyle}
					overflow="hidden"
				>
					{/* Header */}
					<Box
						borderBottom="1px solid rgba(255, 255, 255, 0.2)"
						p={{ base: 4, md: 6 }}
						bg="rgba(255, 255, 255, 0.05)"
					>
						<Flex align="center" gap={3}>
							<Box
								bg="rgba(255, 240, 189, 0.2)"
								p={2}
								borderRadius="full"
								animation="pulse 2s infinite"
							>
								<Sparkles size={24} color="#fff0bd" />
							</Box>
							<VStack align="start" gap={0}>
								<Heading
									size={{ base: "md", md: "lg" }}
									color="white"
									textShadow="0 2px 4px rgba(0,0,0,0.2)"
								>
									AI Design Assistant
								</Heading>
								<Text
									fontSize={{ base: "xs", md: "sm" }}
									color="rgba(255, 255, 255, 0.7)"
								>
									Powered by StyleMatch
								</Text>
							</VStack>
						</Flex>
					</Box>

					{/* Messages Container */}
					<Card.Body
						p={{ base: 4, md: 6 }}
						overflowY="auto"
						flex="1"
						css={{
							"&::-webkit-scrollbar": {
								width: "8px",
							},
							"&::-webkit-scrollbar-track": {
								background: "rgba(255, 255, 255, 0.1)",
								borderRadius: "10px",
							},
							"&::-webkit-scrollbar-thumb": {
								background: "rgba(255, 255, 255, 0.3)",
								borderRadius: "10px",
							},
							"&::-webkit-scrollbar-thumb:hover": {
								background: "rgba(255, 255, 255, 0.4)",
							},
						}}
					>
						<VStack gap={4} align="stretch">
							{/* Quick Prompts - Show only when no user messages */}
							{messages.length === 1 && (
								<Box mb={4}>
									<Text
										fontSize="sm"
										color="rgba(255, 255, 255, 0.7)"
										mb={3}
									>
										Try asking:
									</Text>
									<Flex gap={2} wrap="wrap">
										{quickPrompts.map((prompt, idx) => (
											<Box
												key={idx}
												as="button"
												px={4}
												py={2}
												bg="rgba(255, 255, 255, 0.1)"
												borderRadius="full"
												border="1px solid rgba(255, 255, 255, 0.2)"
												color="white"
												fontSize="sm"
												cursor="pointer"
												transition="all 0.2s"
												_hover={{
													bg: "rgba(255, 255, 255, 0.2)",
													transform:
														"translateY(-2px)",
												}}
												onClick={() => {
													setInputValue(prompt);
													inputRef.current?.focus();
												}}
											>
												{prompt}
											</Box>
										))}
									</Flex>
								</Box>
							)}

							{/* Messages */}
							{messages.map((message, idx) => (
								<Flex
									key={idx}
									justify={
										message.role === "user"
											? "flex-end"
											: "flex-start"
									}
									animation={`fadeInUp 0.3s ease-out ${
										idx * 0.1
									}s both`}
								>
									<Flex
										maxW={{ base: "85%", md: "70%" }}
										gap={3}
										direction={
											message.role === "user"
												? "row-reverse"
												: "row"
										}
									>
										{/* Avatar */}
										<Avatar.Root
											size={{ base: "sm", md: "md" }}
											bg={
												message.role === "user"
													? "#D4AF37"
													: "rgba(255, 240, 189, 0.3)"
											}
											flexShrink={0}
										>
											{message.role === "user" ? (
												<User size={20} color="white" />
											) : (
												<Bot
													size={20}
													color="#fff0bd"
												/>
											)}
										</Avatar.Root>

										{/* Message Bubble */}
										<VStack align="start" gap={1}>
											<Box
												bg={
													message.role === "user"
														? "#C9A227"
														: "rgba(255, 255, 255, 0.15)"
												}
												backdropFilter="blur(10px)"
												border="1px solid rgba(255, 255, 255, 0.2)"
												borderRadius={20}
												p={{ base: 3, md: 4 }}
												boxShadow="0 4px 16px rgba(0, 0, 0, 0.1)"
											>
												<Text
													color="white"
													fontSize={{
														base: "sm",
														md: "md",
													}}
													lineHeight="1.6"
												>
													{message.content}
												</Text>
											</Box>
											<Text
												fontSize="xs"
												color="rgba(255, 255, 255, 0.5)"
												px={2}
											>
												{message.timestamp.toLocaleTimeString(
													[],
													{
														hour: "2-digit",
														minute: "2-digit",
													}
												)}
											</Text>
										</VStack>
									</Flex>
								</Flex>
							))}

							{/* Typing Indicator */}
							{isTyping && (
								<Flex
									justify="flex-start"
									animation="fadeInUp 0.3s ease-out"
								>
									<Flex gap={3} maxW="70%">
										<Avatar.Root
											size={{ base: "sm", md: "md" }}
											bg="rgba(255, 240, 189, 0.3)"
										>
											<Bot size={20} color="#fff0bd" />
										</Avatar.Root>
										<Box
											bg="rgba(255, 255, 255, 0.15)"
											backdropFilter="blur(10px)"
											border="1px solid rgba(255, 255, 255, 0.2)"
											borderRadius={20}
											p={4}
										>
											<Flex gap={1}>
												<Box
													w="8px"
													h="8px"
													bg="rgba(255, 255, 255, 0.6)"
													borderRadius="full"
													animation="bounce 1.4s infinite"
												/>
												<Box
													w="8px"
													h="8px"
													bg="rgba(255, 255, 255, 0.6)"
													borderRadius="full"
													animation="bounce 1.4s infinite 0.2s"
												/>
												<Box
													w="8px"
													h="8px"
													bg="rgba(255, 255, 255, 0.6)"
													borderRadius="full"
													animation="bounce 1.4s infinite 0.4s"
												/>
											</Flex>
										</Box>
									</Flex>
								</Flex>
							)}

							<div ref={messagesEndRef} />
						</VStack>
					</Card.Body>

					{/* Input Area */}
					<Box
						borderTop="1px solid rgba(255, 255, 255, 0.2)"
						p={{ base: 4, md: 6 }}
						bg="rgba(255, 255, 255, 0.05)"
					>
						<HStack gap={3}>
							<Input
								ref={inputRef}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask about interior design, furniture, or styling tips..."
								bg="rgba(255, 255, 255, 0.1)"
								border="1px solid rgba(255, 255, 255, 0.2)"
								borderRadius="full"
								color="white"
								fontSize={{ base: "sm", md: "md" }}
								px={{ base: 4, md: 6 }}
								py={{ base: 5, md: 6 }}
								_placeholder={{
									color: "rgba(255, 255, 255, 0.5)",
								}}
								_focus={{
									outline: "none",
									border: "1px solid rgba(255, 240, 189, 0.5)",
									boxShadow:
										"0 0 0 3px rgba(255, 240, 189, 0.1)",
								}}
							/>
							<Box
								as="button"
								onClick={handleSend}
								bg="#D4AF37"
								p={{ base: 3, md: 4 }}
								borderRadius="full"
								cursor={
									inputValue.trim()
										? "pointer"
										: "not-allowed"
								}
								opacity={inputValue.trim() ? 1 : 0.5}
								transition="all 0.2s"
								_hover={
									inputValue.trim()
										? {
												bg: "#C9A961",
												transform: "translateY(-2px)",
												boxShadow:
													"0 4px 12px rgba(212, 175, 55, 0.4)",
										  }
										: {}
								}
								_active={
									inputValue.trim()
										? {
												transform: "translateY(0)",
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
