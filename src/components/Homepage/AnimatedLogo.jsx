import { Box, Image } from "@chakra-ui/react"
import Logo from '../../assets/Logo.svg'

function AnimatedLogo({ style }) {
    var style = style || { maxWidth: '200px', height: 'auto' }

    return (
        <Box
            opacity={0}
            animation="fadeInDown 0.8s ease-out 0.2s forwards"
        >
            <Image
                src={Logo}
                alt="Logo"
                style={style}
            />
        </Box>
    )
}

export default AnimatedLogo