import { Box, Image } from "@chakra-ui/react"
import Logo from '../../assets/Logo.svg'

function AnimatedLogo() {
    return (
        <Box
            opacity={0}
            animation="fadeInDown 0.8s ease-out 0.2s forwards"
        >
            <Image
                src={Logo}
                alt="Logo"
                style={{ maxWidth: '200px', height: 'auto' }}
            />
        </Box>
    )
}

export default AnimatedLogo