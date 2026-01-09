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
                                const response = await server.get("/sample/get-data");

                                if (response.status === 200 && response.data.success === true) {
                                    console.log("Networking successful:", response.data);
                                    ShowToast("success", "Networking successful", "Check console for details");
                                }
                            } catch (error) {
                                if (error.response) {
                                    ShowToast("error", `${error.response.status}`, "Check console for details");
                                }
                            }
                        }}
                    >
                        Send sample request
                    </Button>
                </HStack>
            </Stack>
        </Container>
    )
}

export default Sample