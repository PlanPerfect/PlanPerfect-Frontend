import { Flex, Button, Text } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'

function NavbarActions() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname !== "/") return null

  return (
    <Flex alignItems="center" gap={2} mr="3px">
      <Button
        bg="transparent"
        border="2px solid #D4AF37"
        borderRadius="8px"
        fontWeight="500"
        fontSize="sm"
        px={3}
        _hover={{ bg: "rgba(212, 197, 160, 0.1)" }}
        _active={{ bg: "rgba(212, 197, 160, 0.2)" }}
        onClick={() => navigate("/onboarding")}
      >
        <Text color="white" fontWeight="bold">
          GET STARTED
        </Text>
      </Button>
    </Flex>
  )
}

export default NavbarActions