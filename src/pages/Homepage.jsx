import React from 'react'
import { Container, Stack, Heading, Text, Button, HStack, Badge, Box } from '@chakra-ui/react'
import { toaster } from "@/components/ui/toaster"

function Homepage() {
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
                            toaster.create({
                                description: "Over here!",
                                type: "success",
                            })
                        }
                    >
                        Did someone say toast?
                    </Button>
                </HStack>
            </Stack>
        </Container>
    )
}

export default Homepage