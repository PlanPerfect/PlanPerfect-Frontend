import { Card, Flex, Heading, Text, Box } from "@chakra-ui/react";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";

function GetStarted() {
  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
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
          backgroundImage: `url(${StyleMatchBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      <Flex height="75vh" gap={4}>
        <Card.Root
          width="35%"
          variant="elevated"
          borderRadius={35}
          style={glassStyle}
        >
          <Card.Header>
            <Heading size="md" color="white" textShadow="0 2px 4px rgba(0,0,0,0.2)">
              Left Card
            </Heading>
          </Card.Header>
          <Card.Body>
            <Text color="rgba(255, 255, 255, 0.9)" fontSize="sm">
              WIP
            </Text>
          </Card.Body>
        </Card.Root>

        <Flex direction="column" width="65%" gap={3}>
          <Card.Root
            height="55%"
            variant="elevated"
            borderRadius={35}
            style={glassStyle}
          >
            <Card.Header>
              <Heading size="md" color="white" textShadow="0 2px 4px rgba(0,0,0,0.2)">
                Top Right Card
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text color="rgba(255, 255, 255, 0.9)" fontSize="sm">
                WIP
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            height="45%"
            variant="elevated"
            borderRadius={35}
            style={glassStyle}
          >
            <Card.Header>
              <Heading size="md" color="white" textShadow="0 2px 4px rgba(0,0,0,0.2)">
                Bottom Right Card
              </Heading>
            </Card.Header>
            <Card.Body>
              <Text color="rgba(255, 255, 255, 0.9)" fontSize="sm">
                WIP
              </Text>
            </Card.Body>
          </Card.Root>
        </Flex>
      </Flex>
    </>
  );
}

export default GetStarted;