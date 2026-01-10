import { Box, Flex, Heading, Text, Button, Steps } from "@chakra-ui/react";
import { BsPalette2 } from "react-icons/bs";
import { RiFileUploadFill } from "react-icons/ri";
import { IoSparkles } from "react-icons/io5";
import { LuFileCheck2 } from "react-icons/lu";
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";

const steps = [
	{
		title: "Preference & Budget",
		icon: <BsPalette2 />,
	},
	{
		title: "Upload Floor Plan",
		icon: <RiFileUploadFill/>,
	},
	{
		title: "AI Extraction",
		icon: <IoSparkles />,
	},
	{
		title: "Check Details",
		icon: <LuFileCheck2 />,
	},
	{
		title: "Get Results!",
		icon: <MdOutlineSupportAgent />,
	},
];

function NewHomeOwnerPage() {
	return (
		<>
			{/* Hero Section */}
			<Box
				bgImage="url('/newHomeOwnerHero.png')"
				bgRepeat="no-repeat"
				bgSize="cover"
				bgPosition="center"
				minH="100vh"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Flex
					direction="column"
					justify="center"
					align="center"
					textAlign="center"
					h="100%"
					px={6}
				>
					<Heading fontSize="80px" mb={4} color="white">
						Let Our AI Agent Find Your
					</Heading>
					<Heading
						fontSize="80px"
						mb={4}
						lineHeight="1.5"
						bgGradient="to-r"
						gradientFrom="#F4E5B2"
						gradientTo="#D4AF37"
						bgClip="text"
						color="transparent"
					>
						Perfect Design Style!
					</Heading>
					<Text
						fontSize="2xl"
						mt={8}
						mb={6}
						maxW="700px"
						color="white"
					>
						Complete the 5 steps below to get your personalized
						design style guide and mood board now!
					</Text>
				</Flex>
			</Box>

			{/* Action Steps */}
			<Box pb={20} px={8}>
				<Steps.Root
					defaultValue={0}
					count={steps.length}
					colorPalette={"yellow"}
				>
					<Box
						w="75%"
						h="150px"
						mb={-12}
						mt={-20}
						mx="auto"
						textAlign="center"
						boxShadow="0 4px 10px rgba(0, 0, 0, 0.15)"
						borderRadius="10px"
						bgColor="#F0F0F0"
						zIndex={1}
						position="relative"
						display="flex"
						alignItems="center"
						justifyContent="center"
						px={8}
					>
						<Steps.List
							display="flex"
							gap={0}
							alignItems="center"
							justifyContent="space-between"
							w="100%"
						>
							{steps.map((step, index) => (
								<Steps.Item
									key={index}
									index={index}
									display="flex"
									alignItems="center"
								>
									<Flex
										direction="column"
										align="center"
										mb={2}
									>
										<Flex
											direction="column"
											align="center"
											gap={1}
										>
											<Steps.Trigger>
												<Steps.Indicator
													borderRadius="8px"
													width="48px"
													height="48px"
												>
													<Steps.Status
														complete={<FaCheck />}
														incomplete={step.icon}
													/>
												</Steps.Indicator>
											</Steps.Trigger>
										</Flex>
										<Text
											fontWeight="600"
											fontSize="16px"
											mt={2}
										>
											{step.title}
										</Text>
									</Flex>
									<Steps.Separator mb={8} height="2px" />
								</Steps.Item>
							))}
						</Steps.List>
					</Box>
					<Box
						w="80%"
						h="300px"
						mx="auto"
						textAlign="center"
						border="1px solid black"
						borderRadius="10px"
						zIndex={0}
						position="relative"
						p={6}
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="center"
					>
						<Box
							flex="1"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							{steps.map((step, index) => (
								<Steps.Content key={index} index={index}>
									<Text>Content for {step.title}</Text>
								</Steps.Content>
							))}
							<Steps.CompletedContent>
								All steps are complete!
							</Steps.CompletedContent>
						</Box>

						<Flex justify="center" gap={4}>
							<Steps.PrevTrigger asChild>
								<Button>Prev</Button>
							</Steps.PrevTrigger>
							<Steps.NextTrigger asChild>
								<Button>Next</Button>
							</Steps.NextTrigger>
						</Flex>
					</Box>
				</Steps.Root>
			</Box>
		</>
	);
}

export default NewHomeOwnerPage;
