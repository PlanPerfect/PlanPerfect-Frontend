import { Box, Flex, Spacer, Image, Button, Text } from '@chakra-ui/react'
import { Menu, Portal } from "@chakra-ui/react"
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import React, { useState } from 'react'
import { LuScissors, LuCopy, LuClipboardPaste } from 'react-icons/lu'
import LogoSVG from '../assets/Logo.svg'
import TextPNG from '../assets/Text.png'

function Navbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <>
            <Flex
                as="nav"
                alignItems="center"
                bg="rgba(0, 0, 0, 0.5)"
                rounded="17px"
                mb="20px"
                p="10px"
                overflow="hidden"
            >
                <Box onClick={handleLogoClick} cursor="pointer" ml="10px" display="flex" alignItems="center">
                    <Image src={LogoSVG} width="5%" />
                    <Image src={TextPNG} width="17%" height="40%" ml={3} />
                </Box>

                <Spacer />

                <Flex alignItems="center" gap={2} mr="40px">
                    <Menu.Root onOpenChange={(e) => setIsMenuOpen(e.open)}>
                        <Menu.Trigger asChild>
                            <Button variant="plain">
                                <Text color="white">SERVICES</Text>{isMenuOpen ? <FiChevronUp color="white" /> : <FiChevronDown color="white" />}
                            </Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner mt={2}>
                            <Menu.Content>
                                <Menu.Item value="cut">
                                <LuScissors />
                                <Box flex="1">Item 1</Box>
                                <Menu.ItemCommand>⌘X</Menu.ItemCommand>
                                </Menu.Item>
                                <Menu.Item value="copy">
                                <LuCopy />
                                <Box flex="1">Item 2</Box>
                                <Menu.ItemCommand>⌘C</Menu.ItemCommand>
                                </Menu.Item>
                                <Menu.Item value="paste">
                                <LuClipboardPaste />
                                <Box flex="1">Item 3</Box>
                                <Menu.ItemCommand>⌘V</Menu.ItemCommand>
                                </Menu.Item>
                            </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>

                    <Button
                        bg="transparent"
                        border="2px solid #D4AF37"
                        borderRadius="8px"
                        fontWeight="500"
                        fontSize="sm"
                        px={3}
                        _hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
                        _active={{ bg: "rgba(212, 197, 160, 0.2)" }}
                    >
                        <Text color="white">GET STARTED</Text>
                    </Button>
                </Flex>
            </Flex>
        </>
    )
}

export default Navbar