import { Card, Flex, Heading, Text, Box, Grid, Image, Avatar, Button } from "@chakra-ui/react";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";
import SampleStyleBackground from "../../assets/SampleStyleBackground.png";
import AnimatedLogo from "@/components/Homepage/AnimatedLogo";
import GetStartedButton from "@/components/Homepage/GetStartedButton";

function GetStarted() {
	const glassStyle = {
		background: "rgba(255, 255, 255, 0.1)",
		backdropFilter: "blur(20px) saturate(180%)",
		WebkitBackdropFilter: "blur(20px) saturate(180%)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
	};

	const furnitureItems = [
		{ name: "Chair", image: SampleStyleBackground },
		{ name: "Lamp", image: SampleStyleBackground },
		{ name: "Table", image: SampleStyleBackground },
		{ name: "Photo Frame", image: SampleStyleBackground },
		{ name: "Chair", image: SampleStyleBackground },
		{ name: "Lamp", image: SampleStyleBackground }
	];

	return (
		<>
			<Box
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url(${StyleMatchBackground})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					zIndex: -1
				}}
			/>

			<Flex height="75vh" gap={4}>
				<Card.Root width="25%" variant="elevated" borderRadius={35} style={glassStyle}>
					<Card.Body display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={8} gap={4}>
						<Box width="150px" height="120px">
							<AnimatedLogo style={{ maxWidth: "150px", height: "auto" }} />
						</Box>

						<Heading size="xl" color="white" textAlign="center" textShadow="0 2px 4px rgba(0,0,0,0.2)" lineHeight="1.2">
							Discover furniture that fits your style with{" "}
							<Text as="span" color="#fff0bd">
								StyleMatch
							</Text>
						</Heading>

						<Text color="rgba(255, 255, 255, 0.9)" fontSize="md" textAlign="center" textShadow="0 1px 2px rgba(0,0,0,0.1)" mt={2}>
							Let us analyse your space to find the perfect furniture for you
						</Text>

						<Box mt={4} display={"flex"} justifyContent={"center"}>
							<GetStartedButton width={"90%"} destination={"/onboarding"} delay={"1s"} />
						</Box>
					</Card.Body>
				</Card.Root>

				<Flex direction="column" width="75%" gap={3}>
					<Card.Root height="45%" variant="elevated" borderRadius={35} style={glassStyle} overflow="hidden">
						<Box position="relative" width="100%" height="100%">
							<Image src={SampleStyleBackground} alt="Modern living room" objectFit="cover" width="100%" height="100%" opacity={0.5} />
							{/* Gradient overlay */}
							<Box position="absolute" inset={0} bgGradient="to-b" gradientFrom="transparent" gradientTo="rgba(0,0,0,0.3)" />
							<Box position="absolute" bottom={3} right={5} fontWeight="md" fontSize="2xl" color="white">
								<Text>Modern</Text>
							</Box>
						</Box>
					</Card.Root>

					<Card.Root height="55%" variant="elevated" borderRadius={35} style={glassStyle}>
						<Card.Body padding={4}>
							<Grid templateColumns="repeat(3, 1fr)" gap={4} height="100%">
								{furnitureItems.map((item, index) => (
									<Card.Root key={index} size="sm" borderRadius={20}>
										<Card.Body>
											<Flex align="start" gap="3">
												<Avatar.Root size="lg" shape="rounded">
													<Avatar.Image src={SampleStyleBackground} />
													<Avatar.Fallback name="Nue Camp" />
												</Avatar.Root>

												<Box>
													<Card.Title>{item.name}</Card.Title>
													<Card.Description>Lorem ipsum dolor sit amet consectetur.</Card.Description>
												</Box>
											</Flex>
										</Card.Body>
									</Card.Root>
								))}
							</Grid>
						</Card.Body>
					</Card.Root>
				</Flex>
			</Flex>
		</>
	);
}

export default GetStarted;
