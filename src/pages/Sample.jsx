import React from 'react'
import { Container, Stack, Heading, Text, Button, HStack, Badge, Box } from '@chakra-ui/react'
import ShowToast from "../Extensions/ShowToast"
import server from "../../networking"

function Sample() {
    return (
        <Container maxW="4xl" py={{ base: "12", md: "24" }}>
            <Stack gap="8" align="center" textAlign="center">
                <Badge colorPalette="purple" variant="subtle" size="lg">
                    Coming Soon
                </Badge>

                <Stack gap="4">
                    <Heading
                        size={{ base: "3xl", md: "5xl" }}
                        fontWeight="bold"
                        letterSpacing="tight"
                    >
                        Welcome to PlanPerfect
                    </Heading>

                    <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        color="fg.muted"
                        maxW="2xl"
                    >
                        Your ultimate planning companion. We're building something amazing to help you organize, plan, and achieve your goals.
                    </Text>
                </Stack>

                <HStack gap="4" pt="4">
                    <Button
                        colorPalette={"green"}
                        onClick={() =>
                            ShowToast("success", "Over here!", "This is a toast!")
                        }
                    >
                        Did someone say toast?
                    </Button>
                    <Button
                        colorPalette={"green"}
                        onClick={async () => {
                            try {
                            const data = await server.get("/sample/get-data");
                            if (data.data.status === 200 && data.data.success == true) {
                                console.log("Networking successful:", data.data);
                                ShowToast("success", "Networking successful", "Check console for details");
                            } else {
                                console.log("Networking failed with status:", data.data.status);
                                ShowToast("error", "Networking failed", "Check console for details");
                            }
                            } catch (error) {
                                console.error("Networking error:", error);
                                ShowToast("error", "Networking error", "Check console for details");
                            }
                        }}
                    >
                        Networking Test Button!
                    </Button>
                </HStack>
            </Stack>
        </Container>
    )
}

export default Sample