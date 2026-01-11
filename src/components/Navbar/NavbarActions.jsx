import { Box, Flex, Button, Text, Menu, Portal } from '@chakra-ui/react'
import { LuScissors, LuCopy, LuClipboardPaste } from 'react-icons/lu'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'

function NavbarActions() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Flex alignItems="center" gap={2} mr="40px">
            <Menu.Root onOpenChange={(e) => setIsMenuOpen(e.open)}>
                <Menu.Trigger asChild>
                    <Button variant="plain">
                        <Text color="white" fontWeight={"bold"}>SERVICES</Text>{isMenuOpen ? <FiChevronUp color="white" /> : <FiChevronDown color="white" />}
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
                <Text color="white" fontWeight={"bold"}>GET STARTED</Text>
            </Button>
        </Flex>
    )
}

export default NavbarActions