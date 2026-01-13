import { Card, Flex, Box } from "@chakra-ui/react";
import StyleMatchBackground from "../../assets/StyleMatchBackground.png";

function GetStarted() {
    const glassStyle = {
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
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
                    zIndex: -1
                }}
            />

            <Flex height="75vh" gap={4}>
                <Card.Root width="35%" variant="elevated" borderRadius={35} style={glassStyle}>
                    <Card.Body display="flex" flexDirection="column" justifyContent="center" alignItems="center" padding={8} gap={4}>

                    </Card.Body>
                </Card.Root>

                <Flex direction="column" width="65%" gap={3}>
                    <Card.Root height="100%" variant="elevated" borderRadius={35} style={glassStyle}>
                        <Card.Body padding={4}>

                        </Card.Body>
                    </Card.Root>
                </Flex>
            </Flex>
        </>
    );
}

export default GetStarted;