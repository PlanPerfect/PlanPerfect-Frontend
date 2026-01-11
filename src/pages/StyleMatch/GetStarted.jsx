import { Card, Flex, Heading, Text, Box } from "@chakra-ui/react";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png"

function GetStarted() {
	return (
		<>
			<Box style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundImage: `url(${StyleMatchBackground})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				zIndex: -1
			}} />

			<Flex height="75vh" gap={4}>
				<Card.Root width="35%" variant="elevated" borderRadius={35}>
					<Card.Header>
						<Heading size="md">Left Card</Heading>
					</Card.Header>
					<Card.Body>
						<Text>WIP</Text>
					</Card.Body>
				</Card.Root>

				<Flex direction="column" width="65%" gap={3}>
					<Card.Root height="55%" variant="elevated" borderRadius={35}>
						<Card.Header>
							<Heading size="md">Top Right Card</Heading>
						</Card.Header>
						<Card.Body>
							<Text>WIP</Text>
						</Card.Body>
					</Card.Root>

					<Card.Root height="45%" variant="elevated" borderRadius={35}>
						<Card.Header>
							<Heading size="md">Bottom Right Card</Heading>
						</Card.Header>
						<Card.Body>
							<Text>WIP</Text>
						</Card.Body>
					</Card.Root>
				</Flex>
			</Flex>
		</>
	);
}

export default GetStarted;